/**
 * 三人麻雀 - ゲーム状態管理
 */

import type {
    GameState,
    PlayerState,
    TileInstance,
    Wind,
    DiscardedTile,
    RoundEndResult,
} from './types'
import { INITIAL_SCORE, PLAYER_COUNT } from './constants'
import { createWall, dealInitialHands, getRemainingDraws, drawTile } from './wall'
import { sortTiles } from './tiles'
import { isTenpai, isAgari } from './hand'
import { calculateNotenBappu } from './score'

// ===========================================
// 初期化
// ===========================================

/**
 * 新しいゲームを初期化
 */
export function initializeGame(playerNames: [string, string, string]): GameState {
    const wall = createWall()

    const players: [PlayerState, PlayerState, PlayerState] = [
        createInitialPlayer(0, 'east', playerNames[0]),
        createInitialPlayer(1, 'south', playerNames[1]),
        createInitialPlayer(2, 'west', playerNames[2]),
    ]

    return {
        phase: 'waiting',
        turnPhase: 'draw',
        round: { wind: 'east', number: 1 },
        honba: 0,
        kyotaku: 0,
        players,
        wall,
        currentPlayer: 0,
        dealerIndex: 0,
        lastDiscard: null,
        kanCount: 0,
        remainingDraws: getRemainingDraws(wall),
    }
}

/**
 * プレイヤーの初期状態を作成
 */
function createInitialPlayer(seatIndex: number, wind: Wind, name: string): PlayerState {
    return {
        seatIndex,
        name,
        wind,
        score: INITIAL_SCORE,
        hand: [],
        drawnTile: null,
        discards: [],
        melds: [],
        flowers: [],
        pendingFlowers: [],
        isRiichi: false,
        isOpenRiichi: false,
        isDoubleRiichi: false,
        isIppatsu: false,
        isMenzen: true,
        isNagashiValid: true,
        isFirstTurn: true,
    }
}

// ===========================================
// 局の開始
// ===========================================

/**
 * 新しい局を開始（配牌）
 */
export function startRound(state: GameState): GameState {
    // 山牌を新規作成
    const wall = createWall()

    // 配牌
    const { parentHand, childHands } = dealInitialHands(wall)

    // プレイヤーの手牌を設定
    const players = state.players.map((player, idx) => {
        // 親は14枚、子は13枚
        // 配牌後、親は13枚+ツモ1枚の状態にする
        if (idx === state.dealerIndex) {
            const hand = parentHand.slice(0, 13)
            const drawnTile = parentHand[13]
            return {
                ...createInitialPlayer(idx, getWindForSeat(idx, state.dealerIndex), player.name),
                score: player.score,
                hand,
                drawnTile,
            }
        } else {
            const adjustedIdx = state.dealerIndex === 0 ? idx - 1 :
                state.dealerIndex === 1 ? (idx === 0 ? 1 : 0) :
                    (idx === 0 ? 0 : 1)
            return {
                ...createInitialPlayer(idx, getWindForSeat(idx, state.dealerIndex), player.name),
                score: player.score,
                hand: childHands[adjustedIdx] || childHands[0],
            }
        }
    }) as [PlayerState, PlayerState, PlayerState]

    // 配牌時の華牌処理（即座に抜かず、pendingFlowersに保存）
    players.forEach(player => {
        // 手牌から華牌を見つけてpendingFlowersに移動
        const flowerTiles = player.hand.filter(t => t.id === 'flower')
        if (flowerTiles.length > 0) {
            player.hand = player.hand.filter(t => t.id !== 'flower')
            player.pendingFlowers = [...player.pendingFlowers, ...flowerTiles]
        }

        // 親のツモ牌が華牌の場合もpendingFlowersに追加
        if (player.drawnTile && player.drawnTile.id === 'flower') {
            player.pendingFlowers.push(player.drawnTile)
            player.drawnTile = null
        }
    })

    return {
        ...state,
        phase: 'playing',
        turnPhase: 'action',
        wall,
        players,
        currentPlayer: state.dealerIndex,
        lastDiscard: null,
        kanCount: 0,
        remainingDraws: getRemainingDraws(wall),
    }
}

/**
 * 座席から風を取得
 */
function getWindForSeat(seatIndex: number, dealerIndex: number): Wind {
    const winds: Wind[] = ['east', 'south', 'west', 'north']
    const offset = (seatIndex - dealerIndex + PLAYER_COUNT) % PLAYER_COUNT
    return winds[offset]
}

// ===========================================
// 次の局へ
// ===========================================

/**
 * 次の局に進む
 */
export function advanceToNextRound(
    state: GameState,
    isDealerContinue: boolean
): GameState {
    let nextRound = { ...state.round }
    let nextHonba = state.honba
    let nextDealerIndex = state.dealerIndex

    if (isDealerContinue) {
        // 連荘: 本場+1
        nextHonba++
    } else {
        // 輪荘: 親が次の人に、本場リセット
        nextDealerIndex = (state.dealerIndex + 1) % PLAYER_COUNT

        // 全員が親を終えたら次の場へ
        if (nextDealerIndex === 0) {
            if (nextRound.wind === 'east') {
                nextRound = { wind: 'south', number: 1 }
            } else {
                // 南場終了 = ゲーム終了
                return {
                    ...state,
                    phase: 'game_end',
                }
            }
        } else {
            nextRound = {
                ...nextRound,
                number: (nextRound.number % 3 + 1) as 1 | 2 | 3,
            }
        }
        nextHonba = 0
    }

    return {
        ...state,
        round: nextRound,
        honba: nextHonba,
        dealerIndex: nextDealerIndex,
        phase: 'dealing',
    }
}

// ===========================================
// ターン進行
// ===========================================

/**
 * ツモ処理
 */
export function processDraw(state: GameState): GameState {
    const currentPlayer = state.players[state.currentPlayer]

    // 山から1枚ツモる
    const tile = drawTile(state.wall)
    if (!tile) {
        // 山がなくなった = 流局
        return {
            ...state,
            phase: 'round_end',
        }
    }

    // 華牌の場合はpendingFlowersに追加（即座に抜かない）
    let drawnTile: TileInstance | null = tile
    if (tile.id === 'flower') {
        currentPlayer.pendingFlowers.push(tile)
        drawnTile = null
    }

    const updatedPlayer = {
        ...currentPlayer,
        drawnTile,
        isIppatsu: currentPlayer.isIppatsu, // 一発継続
    }

    const players = [...state.players] as [PlayerState, PlayerState, PlayerState]
    players[state.currentPlayer] = updatedPlayer

    return {
        ...state,
        players,
        turnPhase: 'action',
        remainingDraws: getRemainingDraws(state.wall),
    }
}

/**
 * 打牌処理
 */
export function processDiscard(state: GameState, tile: TileInstance, isRiichi: boolean = false): GameState {
    const currentPlayer = state.players[state.currentPlayer]

    // ツモ切りかどうか
    const isTsumogiri = currentPlayer.drawnTile?.instanceId === tile.instanceId

    // 手牌から取り除く
    let newHand: TileInstance[]
    if (isTsumogiri) {
        newHand = currentPlayer.hand
    } else {
        newHand = currentPlayer.hand.filter(t => t.instanceId !== tile.instanceId)
        // ツモ牌を手牌に加える
        if (currentPlayer.drawnTile) {
            newHand = sortTiles([...newHand, currentPlayer.drawnTile])
        }
    }

    const discard: DiscardedTile = {
        tile,
        isRiichi,
        isTsumogiri,
    }

    const updatedPlayer: PlayerState = {
        ...currentPlayer,
        hand: newHand,
        drawnTile: null,
        discards: [...currentPlayer.discards, discard],
        isRiichi: isRiichi || currentPlayer.isRiichi,
        isIppatsu: isRiichi, // リーチ直後は一発有効
        isFirstTurn: false,
    }

    const players = [...state.players] as [PlayerState, PlayerState, PlayerState]
    players[state.currentPlayer] = updatedPlayer

    // 他プレイヤーの一発を消す（自分以外の打牌で）
    for (let i = 0; i < PLAYER_COUNT; i++) {
        if (i !== state.currentPlayer && players[i].isIppatsu) {
            players[i] = { ...players[i], isIppatsu: false }
        }
    }

    return {
        ...state,
        players,
        lastDiscard: discard,
        turnPhase: 'discard',
    }
}

/**
 * 次のプレイヤーへ
 */
export function advanceToNextPlayer(state: GameState): GameState {
    const nextPlayer = (state.currentPlayer + 1) % PLAYER_COUNT

    return {
        ...state,
        currentPlayer: nextPlayer,
        turnPhase: 'draw',
    }
}

// ===========================================
// 流局処理
// ===========================================

/**
 * 流局を処理
 */
export function processRyuukyoku(state: GameState): RoundEndResult {
    // 流し役満判定（幺九牌のみ捨てて流局、かつ他家に鳴かれてない）
    const nagashiPlayers: number[] = []
    for (let i = 0; i < PLAYER_COUNT; i++) {
        if (state.players[i].isNagashiValid) {
            nagashiPlayers.push(i)
        }
    }

    // 流し役満成立者がいる場合、役満和了として処理
    if (nagashiPlayers.length > 0) {
        // 上家から順に処理（複数人の場合は全員が和了）
        const scoreChanges: [number, number, number] = [0, 0, 0]
        const yakumanScore = 32000 // 子の役満点
        const oyaYakumanScore = 48000 // 親の役満点

        for (const winner of nagashiPlayers) {
            const score = winner === state.dealerIndex ? oyaYakumanScore : yakumanScore
            scoreChanges[winner] += score

            // 他家から徴収（ツモ扱い）
            const payerCount = PLAYER_COUNT - 1
            const payPerPlayer = Math.floor(score / payerCount)
            for (let j = 0; j < PLAYER_COUNT; j++) {
                if (j !== winner) {
                    scoreChanges[j] -= payPerPlayer
                }
            }
        }

        const isDealerContinue = nagashiPlayers.includes(state.dealerIndex)
        return {
            type: 'tsumo', // 流しはツモ扱い
            winners: nagashiPlayers,
            scoreChanges,
            isDealerContinue,
        }
    }

    // 通常の流局処理
    // テンパイ者を判定
    const tenpaiPlayers: number[] = []

    for (let i = 0; i < PLAYER_COUNT; i++) {
        const player = state.players[i]
        const handIds = player.hand.map(t => t.id)
        if (isTenpai(handIds)) {
            tenpaiPlayers.push(i)
        }
    }

    // ノーテン罰符
    const scoreChanges = calculateNotenBappu(tenpaiPlayers)

    // 親がテンパイなら連荘
    const isDealerContinue = tenpaiPlayers.includes(state.dealerIndex)

    return {
        type: 'ryuukyoku',
        scoreChanges,
        isDealerContinue,
        notenPlayers: [0, 1, 2].filter(i => !tenpaiPlayers.includes(i)),
    }
}

// ===========================================
// 和了処理
// ===========================================

/**
 * ツモ和了を処理
 */
export function processTsumo(state: GameState): RoundEndResult | null {
    const currentPlayer = state.players[state.currentPlayer]
    const allTiles = [...currentPlayer.hand, currentPlayer.drawnTile!].map(t => t.id)

    if (!isAgari(allTiles)) {
        return null
    }

    // 点数計算は別途行う
    const isDealerContinue = state.currentPlayer === state.dealerIndex

    return {
        type: 'tsumo',
        winners: [state.currentPlayer],
        scoreChanges: [0, 0, 0], // 後で計算
        isDealerContinue,
    }
}

/**
 * ロン和了を処理
 */
export function processRon(state: GameState, ronPlayer: number): RoundEndResult | null {
    const player = state.players[ronPlayer]
    const lastDiscard = state.lastDiscard?.tile

    if (!lastDiscard) return null

    const allTiles = [...player.hand, lastDiscard].map(t => t.id)

    if (!isAgari(allTiles)) {
        return null
    }

    const loserIdx = state.currentPlayer
    const isDealerContinue = ronPlayer === state.dealerIndex

    return {
        type: 'ron',
        winners: [ronPlayer],
        loser: loserIdx,
        scoreChanges: [0, 0, 0], // 後で計算
        isDealerContinue,
    }
}

// ===========================================
// トビ判定
// ===========================================

/**
 * トビが発生したかどうか
 */
export function checkTobi(state: GameState): number | null {
    for (let i = 0; i < PLAYER_COUNT; i++) {
        if (state.players[i].score <= 0) {
            return i
        }
    }
    return null
}

// ===========================================
// ゲーム終了判定
// ===========================================

/**
 * ゲーム終了条件をチェック
 */
export function checkGameEnd(state: GameState): boolean {
    // トビ
    if (checkTobi(state) !== null) return true

    // 南場終了
    if (state.round.wind === 'south' && state.round.number === 3) {
        return true
    }

    return false
}
