import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import './FriendMatch.css'

interface FriendMatchProps {
    onBack: () => void
    onCreateRoom: () => void
    onJoinRoom: (roomId: string) => void
}

function FriendMatch({ onBack, onCreateRoom, onJoinRoom }: FriendMatchProps) {
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [roomId, setRoomId] = useState('')

    const handleJoin = () => {
        if (roomId.length === 6) {
            onJoinRoom(roomId)
        }
    }

    return (
        <div className="friend-match">
            <div className="friend-match-bg" />

            {/* Header */}
            <header className="fm-header">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft size={24} />
                    <span>戻る</span>
                </button>
                <div className="header-spacer" />
            </header>

            <div className="fm-title-container">
                <h1 className="fm-title">友人戦メニュー</h1>
            </div>

            {/* Main Content */}
            <main className="fm-main">
                <div className="fm-options">
                    <button className="fm-option-btn create" onClick={onCreateRoom}>
                        <div className="option-text-container">
                            <span className="option-text">ルーム作成</span>
                            <span className="option-desc">新しい部屋を作る</span>
                        </div>
                    </button>

                    <button className="fm-option-btn join" onClick={() => setShowJoinModal(true)}>
                        <div className="option-text-container">
                            <span className="option-text">ルーム参加</span>
                            <span className="option-desc">番号を入力して参加</span>
                        </div>
                    </button>
                </div>
            </main>

            {/* Join Modal */}
            {showJoinModal && (
                <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">ルームに参加</h2>
                        <p className="modal-desc">6桁のルームキーを入力してください</p>

                        <div className="room-input-wrapper">
                            <input
                                type="text"
                                className="room-input"
                                maxLength={6}
                                placeholder="000000"
                                value={roomId}
                                onChange={e => setRoomId(e.target.value.replace(/\D/g, ''))}
                                autoFocus
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="modal-btn secondary"
                                onClick={() => setShowJoinModal(false)}
                            >
                                キャンセル
                            </button>
                            <button
                                className="modal-btn primary"
                                onClick={handleJoin}
                                disabled={roomId.length !== 6}
                            >
                                参加
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FriendMatch
