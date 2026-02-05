import { useState, useEffect, useCallback } from 'react'
import { Settings, User, Bug } from 'lucide-react'
import Tile from './Tile'
import MeldDisplay from './MeldDisplay'
import { useGameStore } from '../store/gameStore'
import type { GameAction, TileInstance, TileId, DiscardedTile as DiscardInfo } from '../game/types'
import { getDoraTiles } from '../game'
import { getWaitingTiles } from '../game/hand'
import { DebugModal } from './modals/DebugModal'
import './Game.css'

interface GameProps {
    onGameEnd: () => void
}

function Game({ onGameEnd }: GameProps) {
    const {
        gameState,
        humanPlayerIndex,
        isProcessing,
        initGame,
        startGame,
        executePlayerAction,
        getPlayerActions,
        getReactions,
        extractFlowerFromPlayer,
    } = useGameStore()

    // Debug State Removed - using CSS variables in Game.css now

    const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [showWhitePochiModal, setShowWhitePochiModal] = useState(false)
    const [whitePochiCandidates, setWhitePochiCandidates] = useState<TileId[]>([])
    const [showDebugModal, setShowDebugModal] = useState(false)

    useEffect(() => {
        if (!isInitialized) {
            initGame('プレイヤー')
            setIsInitialized(true)
        }
    }, [initGame, isInitialized])

    useEffect(() => {
        if (isInitialized && gameState?.phase === 'waiting') {
            startGame()
        }
    }, [isInitialized, gameState?.phase, startGame])

    // 華牌抜きタイマー（500msごとに1枚ずつ）
    useEffect(() => {
        if (!gameState) return

        for (let i = 0; i < 3; i++) {
            if (gameState.players[i].pendingFlowers.length > 0) {
                const timer = setTimeout(() => {
                    extractFlowerFromPlayer(i)
                }, 500)
                return () => clearTimeout(timer)
            }
        }
    }, [gameState, extractFlowerFromPlayer])

    const handleTileClick = useCallback((index: number, isDrawnTile: boolean) => {
        if (isProcessing) return
        setSelectedTileIndex(isDrawnTile ? -1 : index)
    }, [isProcessing])

    const handleDiscard = useCallback(() => {
        if (!gameState || selectedTileIndex === null || isProcessing) return
        const player = gameState.players[humanPlayerIndex]
        let tile: TileInstance | undefined
        if (selectedTileIndex === -1) {
            tile = player.drawnTile ?? undefined
        } else {
            tile = player.hand[selectedTileIndex]
        }
        if (tile) {
            executePlayerAction({ type: 'DISCARD', tile })
            setSelectedTileIndex(null)
        }
    }, [gameState, selectedTileIndex, humanPlayerIndex, isProcessing, executePlayerAction])

    const handleAction = useCallback((action: GameAction) => {
        if (isProcessing) return
        if (action.type === 'TSUMO') {
            const player = gameState?.players[humanPlayerIndex]
            if (player && player.isRiichi && player.drawnTile?.isWhitePochi) {
                const handIds = player.hand.map(t => t.id)
                const handIdsWithoutPochi = handIds.filter(id => id !== 'z5')
                const options = getWaitingTiles(handIdsWithoutPochi)
                if (options.length > 1) {
                    setWhitePochiCandidates(options)
                    setShowWhitePochiModal(true)
                    return
                } else if (options.length === 1) {
                    executePlayerAction({ type: 'TSUMO', whitePochiTarget: options[0] })
                    setSelectedTileIndex(null)
                    return
                }
            }
        }
        executePlayerAction(action)
        setSelectedTileIndex(null)
    }, [gameState, humanPlayerIndex, isProcessing, executePlayerAction])

    const handleWhitePochiSelect = useCallback((tileId: TileId) => {
        executePlayerAction({ type: 'TSUMO', whitePochiTarget: tileId })
        setShowWhitePochiModal(false)
        setWhitePochiCandidates([])
        setSelectedTileIndex(null)
    }, [executePlayerAction])

    // プレイヤーインデックスから表示位置を取得
    const getPlayerPosition = useCallback((playerIndex: number): 'bottom' | 'left' | 'right' => {
        if (playerIndex === humanPlayerIndex) return 'bottom'
        // 左プレイヤーは(humanPlayerIndex + 1) % 3
        // 右プレイヤーは(humanPlayerIndex + 2) % 3
        const leftPlayerIndex = (humanPlayerIndex + 1) % 3
        return playerIndex === leftPlayerIndex ? 'left' : 'right'
    }, [humanPlayerIndex])

    // アクションタイプを日本語に変換
    const translateAction = (type: string): string => {
        const translations: Record<string, string> = {
            'PON': 'ポン',
            'KAN': 'カン',
            'FLOWER': '華抜き',
            'RIICHI': 'リーチ',
            'TSUMO': 'ツモ',
            'RON': 'ロン'
        }
        return translations[type] || type
    }

    if (!gameState) {
        return <div className="game"><div className="loading">読み込み中...</div></div>
    }

    const myPlayer = gameState.players[humanPlayerIndex]
    const rightPlayer = gameState.players[(humanPlayerIndex + 1) % 3]
    const leftPlayer = gameState.players[(humanPlayerIndex + 2) % 3]

    // Action checks
    const playerActions = getPlayerActions()
    const reactions = getReactions()
    const canTsumo = playerActions.some(a => a.type === 'TSUMO')
    const canRiichi = playerActions.some(a => a.type === 'RIICHI')
    const canRon = reactions.some(a => a.type === 'RON')
    const canPon = reactions.some(a => a.type === 'PON')
    const canKan = playerActions.some(a => a.type === 'ANKAN' || a.type === 'KAKAN') || reactions.some(a => a.type === 'MINKAN')
    const canDiscard = selectedTileIndex !== null && playerActions.some(a => a.type === 'DISCARD')

    const roundText = `${gameState.round.wind === 'east' ? '東' : '南'}${gameState.round.number}局`
    const doraTiles = getDoraTiles(gameState.wall)
    const windDisplay = (wind: string) => {
        switch (wind) {
            case 'east': return '東'; case 'south': return '南'; case 'west': return '西'; case 'north': return '北'; default: return wind
        }
    }

    // River Render
    const renderDiscards = (discards: DiscardInfo[], position: 'bottom' | 'left' | 'right' | 'top') => {
        const MAX_SLOTS = 24;
        const slots: (DiscardInfo | null)[] = Array(MAX_SLOTS).fill(null);
        discards.forEach((d, i) => {
            if (i >= MAX_SLOTS) return;
            let gridIndex = i;
            if (position === 'left') {
                const col = 3 - Math.floor(i / 6);
                const row = i % 6;
                gridIndex = row * 4 + col;
            } else if (position === 'right') {
                const col = Math.floor(i / 6);
                const row = 5 - (i % 6);
                gridIndex = row * 4 + col;
            }
            if (gridIndex >= 0 && gridIndex < MAX_SLOTS) slots[gridIndex] = d;
        });

        return (
            <div className="discards-grid">
                {slots.map((discard, idx) => (
                    <div key={idx} className="discard-slot">
                        {discard && <Tile id={discard.tile.id} size="small" isRiichi={discard.isRiichi} isRed={discard.tile.isRed} isGold={discard.tile.isGold} isWhitePochi={discard.tile.isWhitePochi} flowerType={discard.tile.flowerType} />}
                    </div>
                ))}
            </div>
        )
    }

    const doraDisplay = Array(5).fill(null).map((_, i) => {
        if (i < doraTiles.length) return doraTiles[i];
        return null;
    });

    return (
        <div className="game">

            {/* Round Info Overlay */}
            <div className="game-root-layout">

                {/* Debug button */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}>
                    <button
                        onClick={() => setShowDebugModal(true)}
                        style={{
                            padding: '8px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '4px',
                            color: '#ffd700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="デバッグモード"
                    >
                        <Bug size={20} />
                    </button>
                </div>

                {/* 1. Main Game Area */}
                <div className="main-game-area">
                    <div className="hand-area left">
                        <div className="opponent-hand vertical left">
                            {Array(leftPlayer.hand.length).fill(null).map((_, i) => (
                                <div key={i} className="tile-back-small vertical">
                                    <div className="tile-bottom"></div>
                                </div>
                            ))}
                        </div>
                        <div className="sarashi-area left">
                            {/* Left: Meld (Top) / Flower (Bottom) */}
                            <div className="meld-section">
                                <MeldDisplay melds={leftPlayer.melds} position="left" playerIndex={(humanPlayerIndex + 2) % 3} />
                            </div>
                            <div className="flower-section">
                                {leftPlayer.flowers.map((tile, i) => (
                                    <div key={i} className="flower-tile-small">
                                        <Tile id={tile.id} size="small" isRed={tile.isRed} isGold={tile.isGold} isWhitePochi={tile.isWhitePochi} flowerType={tile.flowerType} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Hand Removed (display:none in CSS) */}
                    <div className="hand-area top"></div>

                    <div className="hand-area right">
                        <div className="sarashi-area right">
                            {/* Right: Flower (Top) / Meld (Bottom) */}
                            <div className="flower-section">
                                {rightPlayer.flowers.map((tile, i) => (
                                    <div key={i} className="flower-tile-small">
                                        <Tile id={tile.id} size="small" isRed={tile.isRed} isGold={tile.isGold} isWhitePochi={tile.isWhitePochi} flowerType={tile.flowerType} />
                                    </div>
                                ))}
                            </div>
                            <div className="meld-section">
                                <MeldDisplay melds={rightPlayer.melds} position="right" playerIndex={(humanPlayerIndex + 1) % 3} />
                            </div>
                        </div>
                        <div className="opponent-hand vertical right">
                            {Array(rightPlayer.hand.length).fill(null).map((_, i) => (
                                <div key={i} className="tile-back-small vertical">
                                    <div className="tile-bottom"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* River Container */}
                    <div className="river-container-area">
                        <div className="river-sub-area top">
                            <div className="discards-grid empty"></div>
                        </div>

                        <div className="river-sub-area left">
                            {renderDiscards(leftPlayer.discards, 'left')}
                        </div>

                        <div className="river-sub-area center">
                            <div className="center-box">
                                <span className="center-round">{roundText}</span>
                                <span className="center-honba">{gameState.honba}本場</span>
                                <div className="center-counts">
                                    <span className="center-label">残:</span>
                                    <span className="center-value">{gameState.remainingDraws}</span>
                                </div>
                                <div className="wind-label left">{windDisplay(leftPlayer.wind)}</div>
                                <div className="wind-label right">{windDisplay(rightPlayer.wind)}</div>
                                <div className="wind-label bottom">{windDisplay(myPlayer.wind)}</div>
                            </div>
                        </div>

                        <div className="river-sub-area right">
                            {renderDiscards(rightPlayer.discards, 'right')}
                        </div>

                        <div className="river-sub-area bottom">
                            {renderDiscards(myPlayer.discards, 'bottom')}
                        </div>
                    </div>
                </div>

                {/* 2. My Info & Action Buttons (Above Hand) */}
                <div className="my-info-action-area">
                    <div className="info-overlay my-player">
                        <div className="p-icon-box"><User size={24} /></div>
                        <div className="p-details">
                            <span className="p-name">プレイヤー</span>
                            <span className="p-score-large">{myPlayer.score.toLocaleString()} <span className="p-score-unit">点</span></span>
                        </div>
                    </div>

                    <div className="my-actions-block">
                        {canRiichi && <button className="game-action-btn" disabled={isProcessing} onClick={() => { const a = playerActions.find(ac => ac.type === 'RIICHI'); if (a) handleAction(a); }}>リーチ</button>}
                        {canTsumo && <button className="game-action-btn primary-action" disabled={isProcessing} onClick={() => handleAction({ type: 'TSUMO' })}>ツモ</button>}
                        {canRon && <button className="game-action-btn primary-action" disabled={isProcessing} onClick={() => handleAction({ type: 'RON' })}>ロン</button>}
                        {canPon && <button className="game-action-btn" disabled={isProcessing} onClick={() => { const a = reactions.find(ac => ac.type === 'PON'); if (a) handleAction(a); }}>ポン</button>}
                        {canKan && <button className="game-action-btn" disabled={isProcessing} onClick={() => { const a = playerActions.find(ac => ac.type === 'ANKAN' || ac.type === 'KAKAN') || reactions.find(ac => ac.type === 'MINKAN'); if (a) handleAction(a); }}>カン</button>}
                        {reactions.length > 0 && <button className="game-action-btn" disabled={isProcessing} onClick={() => handleAction({ type: 'SKIP' })}>スキップ</button>}
                        {canDiscard && <button className="game-action-btn discard-btn" onClick={handleDiscard} disabled={isProcessing}>打牌</button>}
                    </div>
                </div>

                {/* 3. My Hand Area */}
                <div className="my-hand-area">
                    <div className="hand-tiles">
                        {myPlayer.hand.map((tile, i) => (
                            <Tile
                                key={`${tile.instanceId}-${i}`}
                                id={tile.id}
                                isSelected={selectedTileIndex === i}
                                onClick={() => handleTileClick(i, false)}
                                isRed={tile.isRed}
                                isGold={tile.isGold}
                            />
                        ))}
                        {myPlayer.drawnTile && (
                            <div className="drawn-tile-gap">
                                <Tile
                                    id={myPlayer.drawnTile.id}
                                    isSelected={selectedTileIndex === -1}
                                    onClick={() => handleTileClick(-1, true)}
                                    isRed={myPlayer.drawnTile.isRed}
                                    isGold={myPlayer.drawnTile.isGold}
                                    isWhitePochi={myPlayer.drawnTile.isWhitePochi}
                                />
                            </div>
                        )}
                    </div>

                    <div className="my-melds">
                        <MeldDisplay melds={myPlayer.melds} position="bottom" playerIndex={humanPlayerIndex} />
                    </div>

                    <div className="my-flower-area">
                        {myPlayer.flowers.map((tile, i) => (
                            <div key={i} className="flower-tile-medium">
                                <Tile id={tile.id} size="medium" isRed={tile.isRed} isGold={tile.isGold} isWhitePochi={tile.isWhitePochi} flowerType={tile.flowerType} />
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* --- Independent Overlays --- */}

            {/* --- Independent Overlays --- */}

            {/* アクション表示オーバーレイ */}
            {gameState.currentAction && (
                <div className={`action-overlay action-overlay-${getPlayerPosition(gameState.currentAction.playerIndex)}`}>
                    <div className="action-text">
                        {translateAction(gameState.currentAction.type)}
                    </div>
                </div>
            )}

            <div className="info-overlay left">
                <div className="p-icon-box"><User size={24} /></div>
                <div className="p-details">
                    <span className="p-name">{leftPlayer.name}</span>
                    <span className="p-score-large">{leftPlayer.score.toLocaleString()} <span className="p-score-unit">点</span></span>
                </div>
            </div>

            <div className="info-overlay right">
                <div className="p-icon-box"><User size={24} /></div>
                <div className="p-details">
                    <span className="p-name">{rightPlayer.name}</span>
                    <span className="p-score-large">{rightPlayer.score.toLocaleString()} <span className="p-score-unit">点</span></span>
                </div>
            </div>

            <div className="dora-overlay-container">
                <div className="dora-tiles-row">
                    {doraDisplay.map((tileId, i) => (
                        <div key={i} className="dora-slot">
                            {tileId ? <Tile id={tileId} size="medium" /> : <div className="dora-back"></div>}
                        </div>
                    ))}
                </div>
                <div className="kyotaku-text">供託: {gameState.kyotaku}本</div>
            </div>

            <div className="settings-overlay">
                <button className="settings-btn" onClick={onGameEnd}><Settings size={28} /></button>
            </div>

            <div className="sidebar-overlay">
                <div className="action-log">
                    <button className="log-btn" title="理牌">理</button>
                    <button className="log-btn" title="和了">和</button>
                    <button className="log-btn" title="切る">切</button>
                </div>
            </div>

            {/* Modals */}
            {gameState.phase === 'round_end' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>局終了</h2>
                        <button onClick={onGameEnd}>結果を見る</button>
                    </div>
                </div>
            )}
            {gameState.phase === 'game_end' && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>ゲーム終了</h2>
                        <button onClick={onGameEnd}>ホームへ</button>
                    </div>
                </div>
            )}
            {showWhitePochiModal && (
                <WhitePochiModal waitingTiles={whitePochiCandidates} onSelect={handleWhitePochiSelect} />
            )}
            <DebugModal isOpen={showDebugModal} onClose={() => setShowDebugModal(false)} />
        </div>
    )
}

interface WhitePochiModalProps {
    waitingTiles: TileId[]
    onSelect: (tileId: TileId) => void
}

function WhitePochiModal({ waitingTiles, onSelect }: WhitePochiModalProps) {
    return (
        <div className="modal-overlay">
            <div className="modal-content white-pochi-modal">
                <h2>白ポッチ和了牌選択</h2>
                <div className="white-pochi-options">
                    {waitingTiles.map(id => (
                        <div key={id} className="white-pochi-option" onClick={() => onSelect(id)}>
                            <Tile id={id} size="medium" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Game
