/**
 * 三人麻雀 - Zustandストア
 */

import { create } from 'zustand'
import type { GameState, GameAction, Meld } from '../game/types'
import {
    initializeGame,
    startRound,
    getAvailableActions,
    getReactionActions,
    executeAction,
    processDraw,
    advanceToNextPlayer,
    cpuSelectAction,
    CPU_THINK_DELAY,
    CPU_REACTION_DELAY,
} from '../game'
import { drawRinshanTile, extractFlower } from '../game/wall'
import { updateGameState } from '../firebase/service'

// ===========================================
// ストア型定義
// ===========================================

interface GameStore {
    // ゲーム状態
    gameState: GameState | null
    humanPlayerIndex: number
    isProcessing: boolean

    // オンライン対戦用
    isOnline: boolean
    isHost: boolean
    roomId: string | null

    // アクション
    initGame: (playerName: string) => void
    initOnlineGame: (roomId: string, isHost: boolean, initialState: GameState, playerIndex: number) => void
    syncGameState: (newState: GameState) => void
    startGame: () => void
    executePlayerAction: (action: GameAction) => void
    extractFlowerFromPlayer: (playerIndex: number) => void
    showAction: (type: 'PON' | 'KAN' | 'FLOWER' | 'RIICHI' | 'TSUMO' | 'RON', playerIndex: number) => void

    // UI用ヘルパー
    getPlayerActions: () => GameAction[]
    getReactions: () => GameAction[]

    // デバッグ用
    addDebugMeld: (playerIndex: number, meld: Meld) => void
    removeDebugMeld: (playerIndex: number, meldIndex: number) => void
}

// ===========================================
// ヘルパー関数
// ===========================================

function processCpuTurnHelper(
    gameState: GameState,
    humanPlayerIndex: number,
    set: (partial: Partial<GameStore>) => void,
    get: () => GameStore
): void {
    // 人間のターンなら処理終了
    if (gameState.currentPlayer === humanPlayerIndex) {
        set({ isProcessing: false })
        return
    }

    // オンラインかつゲストならCPU処理はしない（ホストに任せる）
    if (get().isOnline && !get().isHost) {
        set({ isProcessing: false })
        return
    }

    // ゲームが終了していれば終了
    if (gameState.phase !== 'playing') {
        set({ isProcessing: false })
        return
    }

    set({ isProcessing: true })

    setTimeout(() => {
        const currentState = get().gameState
        if (!currentState) return

        // CPUのアクションを選択
        const action = cpuSelectAction(currentState, currentState.currentPlayer)
        if (!action) {
            set({ isProcessing: false })
            return
        }

        const newState = executeAction(currentState, action)
        set({ gameState: newState })

        // オンラインなら同期
        if (get().isOnline && get().roomId) {
            updateGameState(get().roomId!, newState)
        }

        // アクション表示 (CPU用)
        const { showAction } = get()
        if (action.type === 'PON') {
            showAction('PON', currentState.currentPlayer)
        } else if (action.type === 'ANKAN' || action.type === 'MINKAN' || action.type === 'KAKAN') {
            showAction('KAN', currentState.currentPlayer)
        } else if (action.type === 'RIICHI' || action.type === 'OPEN_RIICHI') {
            showAction('RIICHI', currentState.currentPlayer)
        } else if (action.type === 'TSUMO') {
            showAction('TSUMO', currentState.currentPlayer)
        } else if (action.type === 'RON') {
            showAction('RON', currentState.currentPlayer)
        }

        // 打牌後の処理
        if (action.type === 'DISCARD') {
            setTimeout(() => {
                processAfterDiscardHelper(get, set)
            }, CPU_REACTION_DELAY)
        } else if (action.type === 'TSUMO' || action.type === 'RON') {
            set({ isProcessing: false })
        } else {
            // 次のアクションへ
            setTimeout(() => {
                const state = get().gameState
                if (state) {
                    processCpuTurnHelper(state, get().humanPlayerIndex, set, get)
                }
            }, 100)
        }
    }, CPU_THINK_DELAY)
}

function processAfterDiscardHelper(
    get: () => GameStore,
    set: (partial: Partial<GameStore>) => void
): void {
    const { gameState, humanPlayerIndex } = get()
    if (!gameState) return

    // 人間プレイヤーがロン・ポンできるかチェック
    const reactions = getReactionActions(gameState, humanPlayerIndex)
    const hasRon = reactions.some(a => a.type === 'RON')
    const hasPon = reactions.some(a => a.type === 'PON')

    if (hasRon || hasPon) {
        // 人間に選択させる
        set({ isProcessing: false })
        return
    }

    // 他のCPUの反応をチェック
    for (let i = 0; i < 3; i++) {
        if (i === gameState.currentPlayer || i === humanPlayerIndex) continue

        const cpuAction = cpuSelectAction(gameState, i)

        if (cpuAction && cpuAction.type !== 'SKIP') {
            const newState = executeAction(gameState, cpuAction, i)
            set({ gameState: newState })

            // オンラインなら同期
            if (get().isOnline && get().roomId) {
                updateGameState(get().roomId!, newState)
            }

            setTimeout(() => {
                const state = get().gameState
                if (state) {
                    processCpuTurnHelper(state, get().humanPlayerIndex, set, get)
                }
            }, CPU_THINK_DELAY)
            return
        }
    }

    // 誰も反応しなければ次のプレイヤーへ
    const newState = advanceToNextPlayer(gameState)
    set({ gameState: newState })

    // オンラインなら同期
    if (get().isOnline && get().roomId) {
        updateGameState(get().roomId!, newState)
    }

    // 次のプレイヤーのターン
    if (newState.turnPhase === 'draw') {
        if (newState.currentPlayer === humanPlayerIndex) {
            // 人間のツモ
            const drawnState = processDraw(newState)
            set({ gameState: drawnState, isProcessing: false })

            // オンライン同期はここではしない（人間がアクションしてからにするか、ツモった状態も同期するか）
            // ツモった状態も同期すべき
            if (get().isOnline && get().roomId) {
                updateGameState(get().roomId!, drawnState)
            }
        } else {
            // CPUのターン
            setTimeout(() => {
                processCpuTurnHelper(newState, humanPlayerIndex, set, get)
            }, 100)
        }
    }
}

// ===========================================
// ストア
// ===========================================

export const useGameStore = create<GameStore>((set, get) => ({
    gameState: null,
    humanPlayerIndex: 0,
    isProcessing: false,
    isOnline: false,
    isHost: false,
    roomId: null,

    initGame: (playerName: string) => {
        const state = initializeGame([playerName, 'CPU 1', 'CPU 2'])
        set({ gameState: state, humanPlayerIndex: 0, isOnline: false, isHost: true })
    },

    initOnlineGame: (roomId, isHost, initialState, playerIndex) => {
        set({
            gameState: initialState,
            humanPlayerIndex: playerIndex,
            isOnline: true,
            isHost,
            roomId
        })
    },

    syncGameState: (newState) => {
        // 外部（Firestore）からの更新を適用
        // 自分のアクション直後などで競合する可能性があるが、
        // 基本的にサーバー（ホスト）の正解を受け入れる
        set({ gameState: newState })
    },

    startGame: () => {
        const { gameState, humanPlayerIndex } = get()
        if (!gameState) return

        const newState = startRound(gameState)
        set({ gameState: newState })

        // CPUターンなら自動進行
        if (newState.currentPlayer !== humanPlayerIndex) {
            processCpuTurnHelper(newState, humanPlayerIndex, set, get)
        } else {
            set({ isProcessing: false })
        }
    },

    executePlayerAction: (action: GameAction) => {
        const { gameState, isProcessing, humanPlayerIndex } = get()
        if (!gameState || isProcessing) return

        set({ isProcessing: true })

        const newState = executeAction(gameState, action)
        set({ gameState: newState })

        // オンラインなら同期
        if (get().isOnline && get().roomId) {
            updateGameState(get().roomId!, newState)
        }

        // アクション表示
        if (action.type === 'PON') {
            get().showAction('PON', humanPlayerIndex)
        } else if (action.type === 'ANKAN' || action.type === 'MINKAN' || action.type === 'KAKAN') {
            get().showAction('KAN', humanPlayerIndex)
        } else if (action.type === 'RIICHI' || action.type === 'OPEN_RIICHI') {
            get().showAction('RIICHI', humanPlayerIndex)
        } else if (action.type === 'TSUMO') {
            get().showAction('TSUMO', humanPlayerIndex)
        } else if (action.type === 'RON') {
            get().showAction('RON', humanPlayerIndex)
        }

        // 打牌後の処理
        if (action.type === 'DISCARD') {
            // 他プレイヤーの反応をチェック
            setTimeout(() => {
                processAfterDiscardHelper(get, set)
            }, 300)
        } else if (action.type === 'TSUMO' || action.type === 'RON') {
            // 局終了
            set({ isProcessing: false })
        } else if (action.type === 'SKIP') {
            // スキップ後、次へ進む
            setTimeout(() => {
                processAfterDiscardHelper(get, set)
            }, 100)
        } else {
            // 次のターンへ
            setTimeout(() => {
                const state = get().gameState
                if (state) {
                    processCpuTurnHelper(state, humanPlayerIndex, set, get)
                }
            }, 100)
        }
    },

    getPlayerActions: () => {
        const { gameState, humanPlayerIndex } = get()
        if (!gameState) return []
        if (gameState.currentPlayer !== humanPlayerIndex) return []
        return getAvailableActions(gameState)
    },

    getReactions: () => {
        const { gameState, humanPlayerIndex } = get()
        if (!gameState) return []
        if (gameState.currentPlayer === humanPlayerIndex) return []
        return getReactionActions(gameState, humanPlayerIndex)
    },

    extractFlowerFromPlayer: (playerIndex: number) => {
        const { gameState } = get()
        if (!gameState) return

        const player = gameState.players[playerIndex]
        if (player.pendingFlowers.length === 0) return

        // 1枚抜く
        const flower = player.pendingFlowers[0]
        const newPendingFlowers = player.pendingFlowers.slice(1)

        // 嶺上牌から補充
        const replacement = drawRinshanTile(gameState.wall)
        extractFlower(gameState.wall)

        const updatedPlayer = {
            ...player,
            flowers: [...player.flowers, flower],
            pendingFlowers: newPendingFlowers,
        }

        // 補充牌が華牌の場合はまたpendingFlowersに追加
        if (replacement && replacement.id === 'flower') {
            updatedPlayer.pendingFlowers.push(replacement)
        } else if (replacement) {
            // 通常の牌の場合、手番でdrawnTileが無い場合のみdrawnTileに設定
            // それ以外は手牌に追加
            if (playerIndex === gameState.currentPlayer && !player.drawnTile) {
                updatedPlayer.drawnTile = replacement
            } else {
                updatedPlayer.hand = [...updatedPlayer.hand, replacement]
            }
        }

        const newPlayers = [...gameState.players] as [typeof gameState.players[0], typeof gameState.players[1], typeof gameState.players[2]]
        newPlayers[playerIndex] = updatedPlayer

        set({ gameState: { ...gameState, players: newPlayers } })

        // オンラインなら同期
        if (get().isOnline && get().roomId) {
            updateGameState(get().roomId!, { ...gameState, players: newPlayers })
        }

        // アクション表示
        get().showAction('FLOWER', playerIndex)
    },

    showAction: (type, playerIndex) => {
        const { gameState } = get()
        if (!gameState) return

        const newState = {
            ...gameState,
            currentAction: {
                type,
                playerIndex,
                timestamp: Date.now(),
            },
        }

        set({ gameState: newState })

        // 1秒後にクリア
        setTimeout(() => {
            const state = get().gameState
            if (state && state.currentAction?.timestamp === newState.currentAction.timestamp) {
                set({ gameState: { ...state, currentAction: undefined } })
            }
        }, 1000)
    },

    // デバッグ用: 副露を追加
    addDebugMeld: (playerIndex, meld) => {
        const { gameState } = get()
        if (!gameState) return

        const player = gameState.players[playerIndex]
        const updatedPlayer = {
            ...player,
            melds: [...player.melds, meld]
        }

        const newPlayers = [...gameState.players] as [typeof gameState.players[0], typeof gameState.players[1], typeof gameState.players[2]]
        newPlayers[playerIndex] = updatedPlayer

        set({ gameState: { ...gameState, players: newPlayers } })
    },

    // デバッグ用: 副露を削除
    removeDebugMeld: (playerIndex, meldIndex) => {
        const { gameState } = get()
        if (!gameState) return

        const player = gameState.players[playerIndex]
        const updatedPlayer = {
            ...player,
            melds: player.melds.filter((_, i) => i !== meldIndex)
        }

        const newPlayers = [...gameState.players] as [typeof gameState.players[0], typeof gameState.players[1], typeof gameState.players[2]]
        newPlayers[playerIndex] = updatedPlayer

        set({ gameState: { ...gameState, players: newPlayers } })
    },
}))
