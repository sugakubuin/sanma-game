import { useEffect, useState } from 'react'
import { Copy, User, ArrowLeft, Play } from 'lucide-react'
import { subscribeToRoom, updateGameStatus, updateGameState, getCurrentUser } from '../firebase/service'
import { initializeGame } from '../game'
import './Room.css'

interface RoomInfo {
    roomId: string
    isHost: boolean
    players: string[]
}

interface RoomProps {
    roomInfo: RoomInfo
    onGameStarted: (gameState: any, playerIndex: number) => void
    onLeave: () => void
}

function Room({ roomInfo, onGameStarted, onLeave }: RoomProps) {
    const [players, setPlayers] = useState<string[]>(roomInfo.players)
    const [isStarting, setIsStarting] = useState(false)

    useEffect(() => {
        const unsubscribe = subscribeToRoom(roomInfo.roomId, (room) => {
            // Update player list
            const playerNames = room.players.map(p => p.name)
            setPlayers(playerNames)

            // Check if game started
            if (room.status === 'playing' && room.gameState) {
                const user = getCurrentUser()
                const myIndex = room.players.findIndex(p => p.uid === user?.uid)
                // If I am found in the room, start
                if (myIndex !== -1) {
                    onGameStarted(room.gameState, myIndex)
                }
            }
        })
        return () => unsubscribe()
    }, [roomInfo.roomId, onGameStarted])

    const handleStartGame = async () => {
        // Only host can start
        if (!roomInfo.isHost) return
        if (players.length < 1) return // For debug, allow 1 player start? Or enforce 3?
        // Ideally enforce 3 for Sanma

        setIsStarting(true)

        // Initialize game state locally
        // Map player names from the room
        // Fill empty slots with CPU if needed? For now assume strict 3 players or fill logic
        // Let's fill with CPU if < 3 for testing
        const pNames: [string, string, string] = [
            players[0] || 'CPU 1',
            players[1] || 'CPU 2',
            players[2] || 'CPU 3'
        ]

        const initialState = initializeGame(pNames)

        try {
            await updateGameState(roomInfo.roomId, initialState)
            await updateGameStatus(roomInfo.roomId, 'playing')
            // Don't call onGameStarted here, let the subscription handle it for consistency
        } catch (e) {
            console.error(e)
            setIsStarting(false)
        }
    }
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
                                <div key={index} className={`player-slot ${players[index] ? 'filled' : 'empty'}`}>
                                    {players[index] ? (
                                        <>
                                            <div className="player-avatar">
                                                <User size={24} />
                                            </div>
                                            <div className="player-info">
                                                <span className="player-name">
                                                    {players[index]}
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
                                onClick={handleStartGame}
                                disabled={isStarting}
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
