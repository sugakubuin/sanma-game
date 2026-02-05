
import { BaseModal } from './BaseModal'

// Profile Modal
export const ProfileModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
    <BaseModal title="プロフィール" isOpen={isOpen} onClose={onClose}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
            <h3>プレイヤー名</h3>
            <p>ここに詳細な戦績や自己紹介が入ります。</p>
        </div>
    </BaseModal>
)

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
