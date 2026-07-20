// hooks/useSessions.ts
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from '../lib/firestore'
import type { ClimbingSession, CreateSessionData } from '../types'

export function useSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<ClimbingSession[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getSessions(user.uid)
      setSessions(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  async function create(data: CreateSessionData): Promise<string> {
    if (!user) throw new Error('Not authenticated')
    const id = await createSession(user.uid, data)
    await refresh()
    return id
  }

  async function update(id: string, data: Partial<CreateSessionData>): Promise<void> {
    await updateSession(id, data)
    await refresh()
  }

  async function remove(id: string): Promise<void> {
    await deleteSession(id)
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  return { sessions, loading, error, refresh, create, update, remove }
}
