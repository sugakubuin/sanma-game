import { Copy, User, ArrowLeft, Play } from 'lucide-react'
import './Room.css'

interface RoomInfo {
    roomId: string
    isHost: boolean
    players: string[]
}

interface RoomProps {
    roomInfo: RoomInfo
    onStartGame: () => void
    onLeave: () => void
}

function Room({ roomInfo, onStartGame, onLeave }: RoomProps) {
    const copyRoomId = () => {
        navigator.clipboard.writeText(roomInfo.roomId)
    }

    return (
        <div className="room">
            <div className="room-bg" />

            {/* Header */}
            <header className="room-header">
                <button className="back-btn" onClick={onLeave}>
                    <ArrowLeft size={24} />
                    <span>退出</span>
                </button>
                <div className="header-spacer" />
            </header>

            <div className="room-title-container">
                <h1 className="room-title">ルーム待機中</h1>
            </div>

            {/* Room Info */}
            <main className="room-main">
                <div className="room-card">
                    <div className="room-id-section">
                        <span className="room-id-label">ROOM KEY</span>
                        <div className="room-id-display">
                            <span className="room-id">{roomInfo.roomId}</span>
                            <button className="copy-btn" onClick={copyRoomId} title="コピー">
                                <Copy size={20} />
                            </button>
                        </div>
                        <p className="room-id-hint">この番号を友人に伝えてください</p>
                    </div>

                    {/* Players */}
                    <div className="players-section">
                        <div className="players-list">
                            {[0, 1, 2].map(index => (
                                <div key={index} className={`player-slot ${roomInfo.players[index] ? 'filled' : 'empty'}`}>
                                    {roomInfo.players[index] ? (
                                        <>
                                            <div className="player-avatar">
                                                <User size={24} />
                                            </div>
                                            <div className="player-info">
                                                <span className="player-name">
                                                    {roomInfo.players[index]}
                                                </span>
                                                {index === 0 && roomInfo.isHost && <span className="host-badge">HOST</span>}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="player-avatar empty">
                                                <span>?</span>
                                            </div>
                                            <span className="player-name empty">待機中...</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="room-actions">
                        {roomInfo.isHost ? (
                            <button
                                className="action-btn primary"
                                onClick={onStartGame}
                            >
                                <Play size={24} fill="currentColor" />
                                <span>ゲーム開始</span>
                            </button>
                        ) : (
                            <div className="waiting-message">
                                <span>ホストの開始を待っています...</span>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Room
