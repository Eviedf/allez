// hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth'
import { auth, db } from '../lib/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Ensure a profile document exists
        const ref = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if (!snap.exists()) {
          await setDoc(ref, {
            username: `climber_${u.uid.slice(0, 6)}`,
            displayName: 'Climber',
            bio: null,
            climbingLevel: null,
            photoURL: null,
            createdAt: serverTimestamp(),
          })
        }
        setUser(u)
      } else {
        // Auto sign-in anonymously for the MVP
        await signInAnonymously(auth)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  return { user, loading }
}
