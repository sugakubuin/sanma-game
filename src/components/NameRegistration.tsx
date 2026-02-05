import { useState } from 'react'
import './Login.css' // Reuse login styles

interface NameRegistrationProps {
    onSubmit: (name: string) => void
}

function NameRegistration({ onSubmit }: NameRegistrationProps) {
    const [name, setName] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (name.trim()) {
            onSubmit(name.trim())
        }
    }

    return (
        <div className="login">
            <div className="login-bg">
                <div className="sakura-petals" />
                <div className="glow-orb orb-1" />
            </div>

            <div className="login-logo">
                <h1 className="logo-text">Welcome</h1>
                <p className="logo-subtitle">プレイヤー名を入力してください</p>
            </div>

            <form className="login-actions" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="name-input"
                    placeholder="名前 (最大8文字)"
                    maxLength={8}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoFocus
                    style={{
                        padding: '12px 20px',
                        fontSize: '1.2rem',
                        borderRadius: '30px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        marginBottom: '1rem',
                        width: '100%',
                        textAlign: 'center',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    className="login-btn primary"
                    disabled={!name.trim()}
                >
                    始める
                </button>
            </form>
        </div>
    )
}

export default NameRegistration
