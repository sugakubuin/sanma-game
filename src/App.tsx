import { useState, useEffect } from 'react'
import Login from './components/Login'
import Home from './components/Home'
import FriendMatch from './components/FriendMatch'
import Room from './components/Room'
import Game from './components/Game'
import Result from './components/Result'
import NameRegistration from './components/NameRegistration'
import './App.css'

import { signIn, createRoom, joinRoom, getUserProfile, createUserProfile, updateUserProfile } from './firebase/service'
import { auth } from './firebase/config'
import { useGameStore } from './store/gameStore'

export type GamePhase =
    | 'login'
    | 'home'
    | 'friend-match'
    | 'room'
    | 'game'
    | 'result'
    | 'register-name'

export interface RoomInfo {
    roomId: string
    isHost: boolean
    players: string[]
}


function App() {
    const [phase, setPhase] = useState<GamePhase>('login')
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
    const [userName, setUserName] = useState<string>('')
    // const [isAuthReady, setIsAuthReady] = useState(false) // Unused
    const initOnlineGame = useGameStore(state => state.initOnlineGame)

    // Login is handled manually by the user in Login component
    // We can add onAuthStateChanged listener here if we want to persist session
    // Monitor auth state
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("User:", user.displayName);
                // Optional: Auto-redirect if already logged in?
                // if (phase === 'login') setPhase('home');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            const user = await signIn();
            if (user) {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setUserName(profile.name);
                    setPhase('home');
                } else {
                    setPhase('register-name');
                }
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("ログインに失敗しました。");
        }
    };

    const handleRegisterName = async (name: string) => {
        try {
            if (auth.currentUser) {
                await createUserProfile(auth.currentUser.uid, name);
                setUserName(name);
                setPhase('home');
            }
        } catch (error) {
            console.error("Registration failed:", error);
            alert("登録に失敗しました。");
        }
    }

    const handleUpdateName = async (name: string) => {
        try {
            if (auth.currentUser) {
                await updateUserProfile(auth.currentUser.uid, name);
                setUserName(name);
            }
        } catch (error) {
            console.error("Update failed:", error);
            throw error;
        }
    }

    const handleCreateRoom = async () => {
        try {
            const roomId = await createRoom(userName || "ClientPlayer")
            setRoomInfo({
                roomId,
                isHost: true,
                players: [userName || "ClientPlayer"]
            })
            setPhase('room')
        } catch (e) {
            alert("Error creating room: " + e)
        }
    }

    const handleJoinRoom = async (roomId: string) => {
        try {
            await joinRoom(roomId, userName || "ClientPlayer")
            setRoomInfo({
                roomId,
                isHost: false,
                players: [userName || "ClientPlayer"]
            })
            setPhase('room')
        } catch (e) {
            alert("Error joining room: " + e)
        }
    }

    // Removed unused handleStartGame
    // Removed unused handleGameStarted

    const handleLeaveRoom = () => {
        setRoomInfo(null)
        setPhase('home')
    }

    return (
        <div className="app">
            {phase === 'login' && (
                <Login onLogin={handleLogin} />
            )}

            {phase === 'register-name' && (
                <NameRegistration onSubmit={handleRegisterName} />
            )}

            {phase === 'home' && (
                <Home
                    userName={userName}
                    onUpdateName={handleUpdateName}
                    onFriendMatch={() => setPhase('friend-match')}
                    onLogout={() => setPhase('login')}
                />
            )}

            {phase === 'friend-match' && (
                <FriendMatch
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                    onBack={() => setPhase('home')}
                />
            )}

            {phase === 'room' && roomInfo && (
                <Room
                    roomInfo={roomInfo}
                    onGameStarted={(gameState, playerIndex) => {
                        if (roomInfo) {
                            initOnlineGame(roomInfo.roomId, roomInfo.isHost, gameState, playerIndex);
                        }
                        setPhase('game')
                    }}
                    onLeave={handleLeaveRoom}
                />
            )}

            {phase === 'game' && (
                <Game
                    onGameEnd={() => setPhase('result')}
                />
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
