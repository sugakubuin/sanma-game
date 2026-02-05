import { useState } from 'react'
import Login from './components/Login'
import Home from './components/Home'
import FriendMatch from './components/FriendMatch'
import Room from './components/Room'
import Game from './components/Game'
import Result from './components/Result'
import './App.css'

export type GamePhase =
    | 'login'
    | 'home'
    | 'friend-match'
    | 'room'
    | 'game'
    | 'result'

export interface RoomInfo {
    roomId: string
    isHost: boolean
    players: string[]
}

function App() {
    const [phase, setPhase] = useState<GamePhase>('login')
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)

    const handleCreateRoom = () => {
        // Generate 6-digit room key
        const roomId = Math.floor(100000 + Math.random() * 900000).toString()
        setRoomInfo({
            roomId,
            isHost: true,
            players: ['プレイヤー']
        })
        setPhase('room')
    }

    const handleJoinRoom = (roomId: string) => {
        setRoomInfo({
            roomId,
            isHost: false,
            players: ['プレイヤー']
        })
        setPhase('room')
    }

    const handleStartGame = () => {
        setPhase('game')
    }

    const handleLeaveRoom = () => {
        setRoomInfo(null)
        setPhase('friend-match')
    }

    return (
        <div className="app">
            {phase === 'login' && (
                <Login onLogin={() => setPhase('home')} />
            )}
            {phase === 'home' && (
                <Home
                    onFriendMatch={() => setPhase('friend-match')}
                    onLogout={() => setPhase('login')}
                />
            )}
            {phase === 'friend-match' && (
                <FriendMatch
                    onBack={() => setPhase('home')}
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                />
            )}
            {phase === 'room' && roomInfo && (
                <Room
                    roomInfo={roomInfo}
                    onStartGame={handleStartGame}
                    onLeave={handleLeaveRoom}
                />
            )}
            {phase === 'game' && (
                <Game onGameEnd={() => setPhase('result')} />
            )}
            {phase === 'result' && (
                <Result
                    onReturnToLobby={() => setPhase('home')}
                    onPlayAgain={() => setPhase('game')}
                />
            )}
        </div>
    )
}

export default App
