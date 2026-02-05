import { useState } from 'react'
import {
    Settings,
    User,
    Users,
    History,
    BookOpen,
    LogOut,
} from 'lucide-react'
import './Home.css'
import {
    ProfileModal,
    SettingsModal,
    RankedMatchModal,
    FriendListModal,
    RecordModal,
    RulesModal,
    LogoutModal,
    DebugModal
} from './modals/AppModals'

interface HomeProps {
    userName: string
    onUpdateName: (name: string) => Promise<void>
    onFriendMatch: () => void
    onLogout: () => void
}

function HomeScreen({ userName, onUpdateName, onFriendMatch, onLogout }: HomeProps) {
    const [modals, setModals] = useState({
        profile: false,
        settings: false,
        ranked: false,
        friendList: false,
        record: false,
        rules: false,
        logout: false,
        debug: false,
    })

    const toggleModal = (key: keyof typeof modals, value: boolean) => {
        setModals(prev => ({ ...prev, [key]: value }))
    }

    const handleRankedClick = () => toggleModal('ranked', true)

    return (
        <div className="home">
            {/* Background Layer */}
            <div className="home-bg" />

            {/* Top Elements: Profile & Settings */}
            <div className="top-bar">
                <div className="profile-card" onClick={() => toggleModal('profile', true)}>
                    <div className="profile-avatar">
                        <User size={32} color="#fff" />
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{userName}</span>
                        <div className="profile-details-row">
                            <span className="profile-rank">初段</span>
                            <div className="profile-exp-bar">
                                <div className="profile-exp-fill" style={{ width: '45%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <button className="settings-btn" title="設定" onClick={() => toggleModal('settings', true)}>
                    <Settings size={28} />
                </button>
            </div>

            {/* Main Content Container */}
            <div className="home-content">

                {/* Title Section */}
                <div className="title-section">
                    <h1 className="home-title">RyanShanTen Online</h1>
                </div>

                {/* Main Menu Buttons */}
                <div className="main-menu">
                    <button className="menu-btn ranked" onClick={handleRankedClick}>
                        <div className="menu-text-container">
                            <span className="menu-text">段位戦</span>
                            <span className="menu-text-sub">(準備中)</span>
                        </div>
                    </button>
                    <button className="menu-btn friend" onClick={onFriendMatch}>
                        <div className="menu-text-container">
                            <span className="menu-text">友人戦</span>
                        </div>
                    </button>
                </div>

                {/* Footer Navigation (Sub Buttons) */}
                <footer className="home-footer">
                    <nav className="footer-nav">
                        <button className="footer-btn sub-friend" onClick={() => toggleModal('friendList', true)}>
                            <Users size={20} />
                            <span className="footer-label">フレンド</span>
                        </button>
                        <button className="footer-btn sub-record" onClick={() => toggleModal('record', true)}>
                            <History size={20} />
                            <span className="footer-label">牌譜</span>
                        </button>
                        <button className="footer-btn sub-rules" onClick={() => toggleModal('rules', true)}>
                            <BookOpen size={20} />
                            <span className="footer-label">ルール</span>
                        </button>
                        <button className="footer-btn sub-logout" onClick={() => toggleModal('logout', true)} title="ログアウト">
                            <LogOut size={20} />
                            <span className="footer-label">ログアウト</span>
                        </button>
                    </nav>
                </footer>
            </div>

            {/* Modals */}
            <ProfileModal
                isOpen={modals.profile}
                onClose={() => toggleModal('profile', false)}
                userName={userName}
                onUpdateName={async (name) => {
                    await onUpdateName(name)
                    toggleModal('profile', false)
                }}
            />
            <SettingsModal isOpen={modals.settings} onClose={() => toggleModal('settings', false)} />
            <RankedMatchModal isOpen={modals.ranked} onClose={() => toggleModal('ranked', false)} />
            <FriendListModal isOpen={modals.friendList} onClose={() => toggleModal('friendList', false)} />
            <RecordModal isOpen={modals.record} onClose={() => toggleModal('record', false)} />
            <RulesModal isOpen={modals.rules} onClose={() => toggleModal('rules', false)} />
            <LogoutModal
                isOpen={modals.logout}
                onClose={() => toggleModal('logout', false)}
                onConfirm={() => {
                    toggleModal('logout', false)
                    onLogout()
                }}
            />
            <DebugModal isOpen={modals.debug} onClose={() => toggleModal('debug', false)} />
        </div>
    )
}

export default HomeScreen
