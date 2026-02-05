import { useState, useEffect } from 'react'
import { BaseModal } from './BaseModal'
import { User, Edit2, Check, X } from 'lucide-react'

// Profile Modal
export const ProfileModal = ({
    isOpen,
    onClose,
    userName,
    onUpdateName
}: {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    onUpdateName: (newName: string) => Promise<void>;
}) => {
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(userName)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setEditName(userName)
    }, [userName, isOpen])

    const handleSave = async () => {
        if (!editName.trim() || editName === userName) {
            setIsEditing(false)
            return
        }
        setIsLoading(true)
        try {
            await onUpdateName(editName)
            setIsEditing(false)
        } catch (e) {
            alert('名前の更新に失敗しました')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <BaseModal title="プロフィール" isOpen={isOpen} onClose={onClose}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #FF9A9E, #FECFEF)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                    border: '3px solid white'
                }}>
                    <User size={50} color="white" />
                </div>

                <div style={{ width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>プレイヤー名</div>

                    {isEditing ? (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                maxLength={8}
                                style={{
                                    padding: '0.5rem',
                                    fontSize: '1.2rem',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    textAlign: 'center',
                                    width: '150px'
                                }}
                                autoFocus
                            />
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                style={{
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Check size={20} />
                            </button>
                            <button
                                onClick={() => { setIsEditing(false); setEditName(userName); }}
                                disabled={isLoading}
                                style={{
                                    background: '#ccc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{userName}</h2>
                            <button
                                onClick={() => setIsEditing(true)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#666',
                                    padding: '4px'
                                }}
                            >
                                <Edit2 size={18} />
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ width: '100%', background: '#F5F5F5', borderRadius: '12px', padding: '1rem' }}>
                    <h4 style={{ marginTop: 0, borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>戦績データ</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>対戦数</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>0</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>1位率</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>--%</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>平均順位</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>--</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>現在の段位</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>初段</div>
                        </div>
                    </div>
                </div>
            </div>
        </BaseModal>
    )
}

// Settings Modal
export const SettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <BaseModal title="設定" isOpen={isOpen} onClose={onClose}>
        <p>BGM音量、SE音量、画面設定などがここで行えます。</p>
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>BGM</label>
            <input type="range" style={{ width: '100%' }} />
        </div>
    </BaseModal>
)

// Ranked Match Modal
export const RankedMatchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <BaseModal title="段位戦" isOpen={isOpen} onClose={onClose}>
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h3>準備中</h3>
            <p>段位戦機能は現在開発中です。次回アップデートをお待ちください。</p>
        </div>
    </BaseModal>
)

// Friend List Modal
export const FriendListModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <BaseModal title="フレンド" isOpen={isOpen} onClose={onClose}>
        <p>フレンドリスト機能は準備中です。</p>
    </BaseModal>
)

// Record Modal
export const RecordModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <BaseModal title="牌譜" isOpen={isOpen} onClose={onClose}>
        <p>過去の対戦履歴（牌譜）機能は準備中です。</p>
    </BaseModal>
)

// Rules Modal
export const RulesModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <BaseModal title="ルール" isOpen={isOpen} onClose={onClose}>
        <h3>サンマ（三人麻雀）ルール</h3>
        <ul>
            <li>北は抜きドラ</li>
            <li>チーなし</li>
            <li>ツモ損なし（またはあり）</li>
        </ul>
        <p>詳細なルール説明がここに表示されます。</p>
    </BaseModal>
)

// Logout Modal (Confirm)
export const LogoutModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => (
    <BaseModal
        title="ログアウト"
        isOpen={isOpen}
        onClose={onClose}
        footer={
            <>
                <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}>キャンセル</button>
                <button onClick={onConfirm} style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', background: '#e74c3c', color: '#fff', cursor: 'pointer' }}>ログアウト</button>
            </>
        }
    >
        <p>本当にログアウトしますか？</p>
    </BaseModal>
)

// Debug Modal - Re-export from separate file
export { DebugModal } from './DebugModal'
