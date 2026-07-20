import type { Timestamp } from 'firebase/firestore'

export type ClimbingType = 'BOULDERING' | 'SPORT' | 'TRAD'
export type ClimbStatus = 'ATTEMPTED' | 'PROJECT' | 'SENT' | 'FLASHED'

// ─── Firestore document shapes ────────────────────────────────────────────────

export interface UserProfile {
  id: string
  username: string
  displayName: string
  bio: string | null
  climbingLevel: string | null
  photoURL: string | null
  createdAt: Timestamp
}

export interface ClimbingSession {
  id: string
  userId: string
  sessionDate: string        // ISO date string  "2024-07-15"
  locationName: string
  latitude: number | null
  longitude: number | null
  climbingType: ClimbingType
  notes: string | null
  durationMinutes: number | null
  partners: string[]
  photoURLs: string[]
  createdAt: Timestamp
}

export interface Climb {
  id: string
  sessionId: string
  userId: string
  name: string
  grade: string
  style: string | null
  status: ClimbStatus
  attempts: number
  notes: string | null
  createdAt: Timestamp
}

// ─── Form / request shapes ────────────────────────────────────────────────────

export interface CreateSessionData {
  sessionDate: string
  locationName: string
  latitude: number | null
  longitude: number | null
  climbingType: ClimbingType
  notes: string | null
  durationMinutes: number | null
  partners: string[]
  photoURLs: string[]
}

export interface CreateClimbData {
  name: string
  grade: string
  style: string | null
  status: ClimbStatus
  attempts: number
  notes: string | null
}

export interface DashboardStats {
  totalSessions: number
  totalClimbs: number
  highestGradeSent: string | null
  favoriteLocations: string[]
  outdoorSessions: number
  indoorSessions: number
}
