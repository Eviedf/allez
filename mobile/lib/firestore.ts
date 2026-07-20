// lib/firestore.ts
// Typed CRUD helpers for every Firestore collection.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  UserProfile,
  ClimbingSession,
  Climb,
  CreateSessionData,
  CreateClimbData,
  DashboardStats,
} from '../types'

// ─── Collections ─────────────────────────────────────────────────────────────

const usersCol    = () => collection(db, 'users')
const sessionsCol = () => collection(db, 'sessions')
const climbsCol   = () => collection(db, 'climbs')

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(usersCol(), userId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as UserProfile
}

export async function upsertProfile(
  userId: string,
  data: Partial<Omit<UserProfile, 'id' | 'createdAt'>>,
): Promise<void> {
  const ref = doc(usersCol(), userId)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, data)
  } else {
    await updateDoc(ref, { ...data, createdAt: serverTimestamp() })
  }
}

export async function createProfile(
  userId: string,
  data: Omit<UserProfile, 'id' | 'createdAt'>,
): Promise<void> {
  await updateDoc(doc(usersCol(), userId), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function getSessions(userId: string): Promise<ClimbingSession[]> {
  const q = query(
    sessionsCol(),
    where('userId', '==', userId),
    orderBy('sessionDate', 'desc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as ClimbingSession)
}

export async function getSession(id: string): Promise<ClimbingSession | null> {
  const snap = await getDoc(doc(sessionsCol(), id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as ClimbingSession
}

export async function createSession(
  userId: string,
  data: CreateSessionData,
): Promise<string> {
  const ref = await addDoc(sessionsCol(), {
    ...data,
    userId,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateSession(
  id: string,
  data: Partial<CreateSessionData>,
): Promise<void> {
  await updateDoc(doc(sessionsCol(), id), data)
}

export async function deleteSession(id: string): Promise<void> {
  // Also delete all climbs for this session
  const climbSnap = await getDocs(
    query(climbsCol(), where('sessionId', '==', id)),
  )
  await Promise.all(climbSnap.docs.map(d => deleteDoc(d.ref)))
  await deleteDoc(doc(sessionsCol(), id))
}

// ─── Climbs ───────────────────────────────────────────────────────────────────

export async function getClimbs(sessionId: string): Promise<Climb[]> {
  const q = query(
    climbsCol(),
    where('sessionId', '==', sessionId),
    orderBy('createdAt', 'asc'),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Climb)
}

export async function addClimb(
  sessionId: string,
  userId: string,
  data: CreateClimbData,
): Promise<string> {
  const ref = await addDoc(climbsCol(), {
    ...data,
    sessionId,
    userId,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateClimb(
  id: string,
  data: Partial<CreateClimbData>,
): Promise<void> {
  await updateDoc(doc(climbsCol(), id), data)
}

export async function deleteClimb(id: string): Promise<void> {
  await deleteDoc(doc(climbsCol(), id))
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const sessions = await getSessions(userId)

  const climbSnap = await getDocs(
    query(climbsCol(), where('userId', '==', userId)),
  )
  const climbs = climbSnap.docs.map(d => d.data() as Climb)

  const sent = climbs.filter(c => c.status === 'SENT' || c.status === 'FLASHED')
  const grades = sent.map(c => c.grade).filter(Boolean)

  // Count location frequency
  const locationCount: Record<string, number> = {}
  sessions.forEach(s => {
    locationCount[s.locationName] = (locationCount[s.locationName] ?? 0) + 1
  })
  const favoriteLocations = Object.entries(locationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => name)

  return {
    totalSessions: sessions.length,
    totalClimbs: climbs.length,
    highestGradeSent: grades.length ? grades[grades.length - 1] : null,
    favoriteLocations,
    outdoorSessions: sessions.filter(s => s.latitude != null).length,
    indoorSessions: sessions.filter(s => s.latitude == null).length,
  }
}
