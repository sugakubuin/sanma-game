import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import type { Meld, MeldType } from '../../game/types'
import { useGameStore } from '../../store/gameStore'
import './BaseModal.css'
import './DebugModal.css'

interface DebugModalProps {
    isOpen: boolean
    onClose: () => void
}

// デバッグ用の主要な牌
const DEBUG_TILES: string[] = [
    'm1', 'm9',
    'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9',
    's1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9',
    'z1', 'z2', 'z3', 'z4', 'z5', 'z6', 'z7'
]

export function DebugModal({ isOpen, onClose }: DebugModalProps) {
    const { gameState, addDebugMeld, removeDebugMeld } = useGameStore()
    const [selectedPlayer, setSelectedPlayer] = useState(0)
    const [meldType, setMeldType] = useState<MeldType>('pon')
    const [selectedTile, setSelectedTile] = useState<string>('m1')
    const [fromPlayer, setFromPlayer] = useState<number>(1)

    if (!isOpen || !gameState) return null

    const handleAddMeld = () => {
        // 選択された牌で副露を作成
        const tiles = []
        const count = meldType === 'pon' ? 3 : 4

        // 簡易的に同じ牌でMeldを作成
        for (let i = 0; i < count; i++) {
            tiles.push({
                id: selectedTile as any,
                isRed: false,
                isGold: false,
                isWhitePochi: false,
                instanceId: Date.now() + i
            })
        }

        const meld: Meld = {
            type: meldType,
            tiles,
            fromPlayer: meldType === 'ankan' ? undefined : fromPlayer,
            calledTile: tiles[tiles.length - 1]
        }

        addDebugMeld(selectedPlayer, meld)
    }

    const handleRemoveMeld = (meldIndex: number) => {
        removeDebugMeld(selectedPlayer, meldIndex)
    }

    const currentPlayer = gameState.players[selectedPlayer]

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content debug-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <h2 className="modal-title">🐛 副露デバッグ</h2>

                <div className="debug-section">
                    <h3>プレイヤー選択</h3>
                    <div className="debug-buttons">
                        <button
                            className={`debug-btn ${selectedPlayer === 0 ? 'active' : ''}`}
                            onClick={() => setSelectedPlayer(0)}
                        >
                            自分（bottom）
                        </button>
                        <button
                            className={`debug-btn ${selectedPlayer === 1 ? 'active' : ''}`}
                            onClick={() => setSelectedPlayer(1)}
                        >
                            右プレイヤー
                        </button>
                        <button
                            className={`debug-btn ${selectedPlayer === 2 ? 'active' : ''}`}
                            onClick={() => setSelectedPlayer(2)}
                        >
                            左プレイヤー
                        </button>
                    </div>
                </div>

                <div className="debug-section">
                    <h3>副露追加</h3>

                    <div className="debug-form">
                        <div className="form-group">
                            <label>副露タイプ:</label>
                            <select value={meldType} onChange={(e) => setMeldType(e.target.value as MeldType)}>
                                <option value="pon">ポン</option>
                                <option value="ankan">暗槓</option>
                                <option value="minkan">明槓</option>
                                <option value="kakan">加槓</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>牌:</label>
                            <select value={selectedTile} onChange={(e) => setSelectedTile(e.target.value)}>
                                {DEBUG_TILES.map(tile => (
                                    <option key={tile} value={tile}>{tile}</option>
                                ))}
                            </select>
                        </div>

                        {meldType !== 'ankan' && (
                            <div className="form-group">
                                <label>鳴いた相手 (fromPlayer):</label>
                                <select value={fromPlayer} onChange={(e) => setFromPlayer(Number(e.target.value))}>
                                    {[0, 1, 2].filter(p => p !== selectedPlayer).map(p => (
                                        <option key={p} value={p}>
                                            プレイヤー {p} {p === 0 ? '(自分)' : p === 1 ? '(右)' : '(左)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button className="debug-add-btn" onClick={handleAddMeld}>
                            <Plus size={16} />
                            副露を追加
                        </button>
                    </div>
                </div>

                <div className="debug-section">
                    <h3>現在の副露一覧 (プレイヤー {selectedPlayer})</h3>
                    {currentPlayer.melds.length === 0 ? (
                        <p className="no-melds">副露なし</p>
                    ) : (
                        <div className="melds-list">
                            {currentPlayer.melds.map((meld, index) => (
                                <div key={index} className="meld-item">
                                    <div className="meld-info">
                                        <strong>{meld.type}</strong>
                                        {' - '}
                                        {meld.tiles[0].id}
                                        {meld.fromPlayer !== undefined && ` (from: ${meld.fromPlayer})`}
                                    </div>
                                    <button
                                        className="meld-remove-btn"
                                        onClick={() => handleRemoveMeld(index)}
                                        title="削除"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
