// app/log.tsx
// Standalone "Log a Climb" modal screen — opened via router.push('/log')
// Wraps SessionFormModal so it can be reached from anywhere in the app.
import React from 'react'
import { useRouter } from 'expo-router'
import { useAuth } from '../hooks/useAuth'
import SessionFormModal from '../components/SessionFormModal'
import { createSession } from '../lib/firestore'
import type { CreateSessionData } from '../types'

export default function LogScreen() {
  const router   = useRouter()
  const { user } = useAuth()

  async function handleSubmit(data: CreateSessionData) {
    if (!user) return
    const id = await createSession(user.uid, data)
    router.replace(`/session/${id}`)
  }

  return (
    <SessionFormModal
      visible
      onClose={() => router.back()}
      onSubmit={handleSubmit}
    />
  )
}
