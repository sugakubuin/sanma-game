import { Crown, PartyPopper, User } from 'lucide-react'
import './Result.css'

interface ResultProps {
    onReturnToLobby: () => void
    onPlayAgain: () => void
}

// Mock result data
const mockResults = [
    { rank: 1, name: 'プレイヤー', score: 58000, diff: '+8000' },
    { rank: 2, name: 'CPU-1', score: 48000, diff: '-2000' },
    { rank: 3, name: 'CPU-2', score: 44000, diff: '-6000' },
]

const mockStats = {
    wins: 3,
    dealIns: 1,
    riichi: 4,
    maxHan: 6,
}

function Result({ onReturnToLobby, onPlayAgain }: ResultProps) {
    return (
        <div className="result">
            <header className="result-header">
                <h1 className="result-title text-gold glow">対局結果</h1>
            </header>

            {/* Ranking */}
            <section className="ranking-section">
                {mockResults.map((player, index) => (
                    <div
                        key={player.rank}
                        className={`ranking-card rank-${player.rank}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {player.rank === 1 && <div className="crown"><Crown size={24} /></div>}
                        <div className="ranking-avatar">
                            <div className="avatar-inner">
                                {player.rank === 1 ? <PartyPopper size={24} /> : <User size={24} />}
                            </div>
                        </div>
                        <div className="ranking-position">{player.rank}位</div>
                        <div className="ranking-name">{player.name}</div>
                        <div className="ranking-score">
                            <span className="score-value">{player.score.toLocaleString()}</span>
                            <span className={`score-diff ${player.diff.startsWith('+') ? 'positive' : 'negative'}`}>
                                {player.diff}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Statistics */}
            <section className="stats-section glass-card">
                <h2 className="stats-title">対局統計</h2>
                <div className="stats-grid">
                    <div className="stats-item">
                        <span className="stats-label">和了回数</span>
                        <span className="stats-value">{mockStats.wins}</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-label">放銃回数</span>
                        <span className="stats-value">{mockStats.dealIns}</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-label">リーチ回数</span>
                        <span className="stats-value">{mockStats.riichi}</span>
                    </div>
                    <div className="stats-item">
                        <span className="stats-label">最大翻数</span>
                        <span className="stats-value">{mockStats.maxHan}翻</span>
                    </div>
                </div>
            </section>

            {/* Action Buttons */}
            <footer className="result-actions">
                <button className="action-btn secondary" onClick={onReturnToLobby}>
                    ロビーに戻る
                </button>
                <button className="action-btn primary" onClick={onPlayAgain}>
                    もう一局
                </button>
            </footer>
        </div>
    )
}

export default Result
