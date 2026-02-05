import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    onSnapshot,
    serverTimestamp,
    runTransaction,
    arrayUnion
} from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { db, auth } from "./config";

export interface Player {
    uid: string;
    name: string;
    ready: boolean;
    joinedAt: number;
}

export interface Room {
    id: string;
    hostId: string;
    status: 'waiting' | 'playing' | 'finished';
    players: Player[];
    createdAt: any; // ServerTimestamp
    gameState?: any; // We might embed gamestate here for MVP simplified sync
}

const ROOM_COLLECTION = "rooms";
const USER_COLLECTION = "users";

export interface UserProfile {
    uid: string;
    name: string;
    createdAt: any;
}

// --- Auth ---
const provider = new GoogleAuthProvider();

export const signIn = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
};

export const getCurrentUser = () => {
    return auth.currentUser;
};

// --- User Management ---
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const userRef = doc(db, USER_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
    }
    return null;
};

export const createUserProfile = async (uid: string, name: string): Promise<void> => {
    const userRef = doc(db, USER_COLLECTION, uid);
    const profile: UserProfile = {
        uid,
        name,
        createdAt: serverTimestamp(),
    };
    await setDoc(userRef, profile);
};

export const updateUserProfile = async (uid: string, name: string): Promise<void> => {
    const userRef = doc(db, USER_COLLECTION, uid);
    await updateDoc(userRef, { name });
};

// --- Room Management ---

// Generate a random 6-digit room ID
const generateRoomId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createRoom = async (playerName: string): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const roomId = generateRoomId();
    const roomRef = doc(db, ROOM_COLLECTION, roomId);

    const newPlayer: Player = {
        uid: user.uid,
        name: playerName,
        ready: true, // Host is always ready?
        joinedAt: Date.now(),
    };

    const roomData: Room = {
        id: roomId,
        hostId: user.uid,
        status: 'waiting',
        players: [newPlayer],
        createdAt: serverTimestamp(),
    };

    await setDoc(roomRef, roomData);
    return roomId;
};

export const joinRoom = async (roomId: string, playerName: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const roomRef = doc(db, ROOM_COLLECTION, roomId);

    await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) {
            throw new Error("Room not found");
        }

        const room = roomDoc.data() as Room;

        if (room.status !== 'waiting') {
            throw new Error("Room is already playing or finished");
        }

        if (room.players.length >= 3) {
            throw new Error("Room is full");
        }

        // Check if already joined
        const existingPlayer = room.players.find(p => p.uid === user.uid);
        if (!existingPlayer) {
            const newPlayer: Player = {
                uid: user.uid,
                name: playerName,
                ready: false,
                joinedAt: Date.now(),
            };
            transaction.update(roomRef, {
                players: arrayUnion(newPlayer)
            });
        }
    });
};

// Subscribe to room updates
export const subscribeToRoom = (roomId: string, callback: (room: Room) => void) => {
    const roomRef = doc(db, ROOM_COLLECTION, roomId);
    return onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.data() as Room);
        }
    });
};

// --- Game Synchronization ---

// Sync entire game state (Host updates this)
export const updateGameState = async (roomId: string, gameState: any) => {
    const roomRef = doc(db, ROOM_COLLECTION, roomId);
    // Merge gamestate into the room doc for MVP simplicity
    // Ideally this goes into a subcollection for granularity, but simpler to sync 1 doc
    await updateDoc(roomRef, {
        gameState: gameState,
        lastUpdated: serverTimestamp()
    });
};

export const setPlayerReady = async (roomId: string, isReady: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    // This is tricky with array of objects in Firestore. 
    // We strictly need to read-modify-write or use a safer structure (map).
    // For MVP, we'll do a transactional update.
    const roomRef = doc(db, ROOM_COLLECTION, roomId);
    await runTransaction(db, async (transaction) => {
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) throw new Error("Room not found");

        const room = roomDoc.data() as Room;
        const newPlayers = room.players.map(p =>
            p.uid === user.uid ? { ...p, ready: isReady } : p
        );

        transaction.update(roomRef, { players: newPlayers });
    });
};

export const updateGameStatus = async (roomId: string, status: 'waiting' | 'playing' | 'finished') => {
    const roomRef = doc(db, ROOM_COLLECTION, roomId);
    await updateDoc(roomRef, { status });
};
