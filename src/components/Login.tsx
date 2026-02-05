import './Login.css'

interface LoginProps {
    onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
    return (
        <div className="login">
            {/* Background effects */}
            <div className="login-bg">
                <div className="sakura-petals" />
                <div className="glow-orb orb-1" />
                <div className="glow-orb orb-2" />
            </div>

            {/* Logo */}
            <div className="login-logo">
                <h1 className="logo-text">
                    RyanShanTen Online
                </h1>
                <p className="logo-subtitle">- オンライン三人麻雀 -</p>
            </div>

            {/* Login Button */}
            <div className="login-actions">
                <button className="login-btn primary" onClick={onLogin}>
                    Googleでログイン
                </button>
                <label className="auto-login">
                    <input type="checkbox" defaultChecked />
                    <span>次から自動でログイン</span>
                </label>
            </div>

            {/* Version */}
            {/* <div className="login-version">
                v0.1.0
            </div> */}
        </div>
    )
}

export default Login
