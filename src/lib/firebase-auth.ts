import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User } from '@/types'
import { rolePermissions } from './auth'

const googleProvider = new GoogleAuthProvider()

async function resolveRole(fbUser: FirebaseUser): Promise<User> {
    const ref = doc(db, 'users', fbUser.uid)
    const snap = await getDoc(ref)

    if (snap.exists()) {
        const data = snap.data()
        await setDoc(ref, { lastActive: serverTimestamp() }, { merge: true })
        const role: User['role'] = data.role || 'OBSERVER'
        return {
            id: fbUser.uid,
            name: data.name || fbUser.displayName || fbUser.email!.split('@')[0],
            email: fbUser.email!,
            role,
            station: data.station,
            permissions: rolePermissions[role],
            lastActive: new Date().toISOString(),
        }
    }

    const newUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email!.split('@')[0],
        email: fbUser.email!,
        role: 'OBSERVER',
        permissions: rolePermissions['OBSERVER'],
        lastActive: new Date().toISOString(),
    }

    await setDoc(ref, {
        name: newUser.name,
        email: newUser.email,
        role: 'OBSERVER',
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
    })

    return newUser
}

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    return resolveRole(result.user)
}

export async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return resolveRole(result.user)
}

export async function signOut() {
    await firebaseSignOut(auth)
}

export function onAuthChange(cb: (user: User | null) => void) {
    return onAuthStateChanged(auth, async fbUser => {
        if (!fbUser) { cb(null); return }
        try {
            const user = await resolveRole(fbUser)
            cb(user)
        } catch {
            cb(null)
        }
    })
}
