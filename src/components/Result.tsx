import { Crown, User } from 'lucide-react'
import './Result.css'

interface ResultProps {
    onReturnToLobby: () => void
    onPlayAgain: () => void
}

// Mock result data
// Mock result data (Simulated)
// In real app, this should come from GameStore
const mockResults = [
    { rank: 1, name: 'プレイヤー', score: 65000, chips: 5 },
    { rank: 2, name: 'CPU-1', score: 45000, chips: -2 },
    { rank: 3, name: 'CPU-2', score: 40000, chips: -3 },
]

const calculatePoints = (results: typeof mockResults) => {
    // 3-player Mahjong Point Calculation (50000 origin/return)
    // Uma: 2nd place > 50000 ? [+30, +10, -40] : [+40, -10, -30]

    const rank2 = results.find(r => r.rank === 2);
    const isRank2Floating = (rank2?.score || 0) >= 50000;

    return results.map(player => {
        // Base point: (Score - Origin) / 1000
        const basePoint = (player.score - 50000) / 1000;

        // Uma
        let uma = 0;
        if (isRank2Floating) {
            if (player.rank === 1) uma = 30;
            else if (player.rank === 2) uma = 10;
            else if (player.rank === 3) uma = -40;
        } else {
            if (player.rank === 1) uma = 40;
            else if (player.rank === 2) uma = -10;
            else if (player.rank === 3) uma = -30;
        }

        // Chip point: Chips * 5
        const chipPoint = player.chips * 5;

        // Total
        const totalPoint = basePoint + uma + chipPoint;

        return {
            ...player,
            totalPoint: totalPoint,
            totalPointFormatted: totalPoint > 0 ? `+${totalPoint}` : `${totalPoint}`
        };
    });
}

const finalResults = calculatePoints(mockResults);



function Result({ onReturnToLobby, onPlayAgain }: ResultProps) {
    return (
        <div className="result">
            <header className="result-header">
                <h1 className="result-title text-gold glow">対局結果</h1>
            </header>

            {/* Ranking Vertical */}
            <section className="ranking-list">
                {finalResults.map((player, index) => (
                    <div
                        key={player.rank}
                        className={`result-row rank-${player.rank}`}
                        style={{ animationDelay: `${index * 0.15}s` }}
                    >
                        {/* Rank Badge */}
                        <div className="rank-badge">
                            {player.rank === 1 && <Crown size={20} className="crown-icon" />}
                            <span className="rank-number">{player.rank}</span>
                        </div>

                        {/* Avatar & Name */}
                        <div className="player-info">
                            <div className="result-avatar">
                                <User size={24} />
                            </div>
                            <div className="result-name">{player.name}</div>
                        </div>

                        {/* Metrics */}
                        <div className="result-metrics">
                            {/* Score */}
                            <div className="metric-item score">
                                <div className="metric-label">持ち点</div>
                                <div className="metric-value">{player.score.toLocaleString()}</div>
                            </div>

                            {/* Chips */}
                            <div className="metric-item chips">
                                <div className="metric-label">祝儀</div>
                                <div className={`metric-value ${player.chips >= 0 ? 'positive' : 'negative'}`}>
                                    {player.chips >= 0 ? `+${player.chips}` : player.chips}枚
                                </div>
                            </div>

                            {/* Total Points */}
                            <div className="metric-item total">
                                <div className="metric-label">トータル</div>
                                <div className={`metric-value ${player.totalPoint >= 0 ? 'positive' : 'negative'}`}>
                                    {player.totalPointFormatted}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
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
