import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { format } from 'date-fns'
import {
  getSession,
  getClimbs,
  addClimb,
  updateClimb,
  deleteClimb,
  deleteSession,
  updateSession,
} from '../../lib/firestore'
import { useAuth } from '../../hooks/useAuth'
import type { ClimbingSession, Climb, CreateClimbData } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import ClimbItem from '../../components/ClimbItem'
import ClimbFormModal from '../../components/ClimbFormModal'
import SessionFormModal from '../../components/SessionFormModal'
import { ClimbingTypeBadge } from '../../components/Badges'
import { Colors, Fonts, Radius, Spacing } from '../../constants/Colors'

export default function SessionDetailScreen() {
  const { id }   = useLocalSearchParams<{ id: string }>()
  const router   = useRouter()
  const { user } = useAuth()

  const [session,      setSession]      = useState<ClimbingSession | null>(null)
  const [climbs,       setClimbs]       = useState<Climb[]>([])
  const [loading,      setLoading]      = useState(true)
  const [showAddClimb, setShowAddClimb] = useState(false)
  const [editingClimb, setEditingClimb] = useState<Climb | null>(null)
  const [editingSession, setEditingSession] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([getSession(id), getClimbs(id)])
      .then(([s, c]) => { setSession(s); setClimbs(c) })
      .finally(() => setLoading(false))
  }, [id])

  async function handleAddClimb(data: CreateClimbData) {
    if (!user || !id) return
    const climbId = await addClimb(id, user.uid, data)
    const updated = await getClimbs(id)
    setClimbs(updated)
  }

  async function handleUpdateClimb(data: CreateClimbData) {
    if (!editingClimb) return
    await updateClimb(editingClimb.id, data)
    setClimbs(prev => prev.map(c => c.id === editingClimb.id ? { ...c, ...data } : c))
  }

  async function handleDeleteClimb(climbId: string) {
    Alert.alert('Remove climb?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await deleteClimb(climbId)
          setClimbs(prev => prev.filter(c => c.id !== climbId))
        },
      },
    ])
  }

  async function handleDeleteSession() {
    Alert.alert('Delete session?', 'This will delete all climbs too.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          if (!id) return
          await deleteSession(id)
          router.back()
        },
      },
    ])
  }

  if (loading) return <LoadingSpinner />
  if (!session) return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.notFound}>Session not found</Text>
    </SafeAreaView>
  )

  const sentCount = climbs.filter(c => c.status === 'SENT' || c.status === 'FLASHED').length
  const totalAttempts = climbs.reduce((s, c) => s + c.attempts, 0)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Back + actions */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setEditingSession(true)}>
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleDeleteSession}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero photo */}
        {session.photoURLs?.length > 0 ? (
          <Image source={{ uri: session.photoURLs[0] }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]}>
            <Text style={styles.heroEmoji}>
              {session.climbingType === 'BOULDERING' ? '🪨' : session.climbingType === 'SPORT' ? '🧗' : '⛰️'}
            </Text>
          </View>
        )}

        {/* Session info */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View style={styles.infoLeft}>
              <Text style={styles.locationName}>{session.locationName}</Text>
              <Text style={styles.sessionDate}>
                {format(new Date(session.sessionDate), 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
            <ClimbingTypeBadge type={session.climbingType} />
          </View>

          {/* Stats strip */}
          <View style={styles.statsStrip}>
            <StatItem value={climbs.length} label="climbs" />
            <StatItem value={sentCount} label="sent" accent={Colors.summit[600]} />
            <StatItem value={totalAttempts} label="attempts" />
            {session.durationMinutes ? (
              <StatItem value={`${session.durationMinutes}m`} label="duration" />
            ) : null}
          </View>

          {/* Partners */}
          {session.partners?.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>👥 With</Text>
              <Text style={styles.infoValue}>{session.partners.join(', ')}</Text>
            </View>
          )}

          {/* Coordinates */}
          {session.latitude != null && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍 GPS</Text>
              <Text style={styles.infoValue}>
                {session.latitude.toFixed(4)}, {session.longitude?.toFixed(4)}
              </Text>
            </View>
          )}

          {/* Notes */}
          {session.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>"{session.notes}"</Text>
            </View>
          )}
        </View>

        {/* Climbs */}
        <View style={styles.climbsCard}>
          <View style={styles.climbsHeader}>
            <Text style={styles.climbsTitle}>Climbs ({climbs.length})</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddClimb(true)}>
              <Text style={styles.addBtnText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {climbs.length === 0 ? (
            <View style={styles.emptyClimbs}>
              <Text style={styles.emptyText}>🧗 No climbs yet — add your first!</Text>
            </View>
          ) : (
            <View style={styles.climbsList}>
              {climbs.map(climb => (
                <ClimbItem
                  key={climb.id}
                  climb={climb}
                  onEdit={setEditingClimb}
                  onDelete={handleDeleteClimb}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ClimbFormModal
        visible={showAddClimb}
        onClose={() => setShowAddClimb(false)}
        onSubmit={handleAddClimb}
      />

      {editingClimb && (
        <ClimbFormModal
          visible
          onClose={() => setEditingClimb(null)}
          onSubmit={handleUpdateClimb}
          initial={editingClimb}
        />
      )}

      {editingSession && (
        <SessionFormModal
          visible
          onClose={() => setEditingSession(false)}
          initial={session}
          onSubmit={async data => {
            if (!id) return
            await updateSession(id, data)
            setSession(prev => prev ? { ...prev, ...data } : prev)
          }}
        />
      )}
    </SafeAreaView>
  )
}

function StatItem({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <View style={statStyles.item}>
      <Text style={[statStyles.value, accent ? { color: accent } : {}]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  )
}

const statStyles = StyleSheet.create({
  item: { flex: 1, alignItems: 'center', paddingVertical: Spacing[3] },
  value: { fontSize: Fonts.size.xl, fontWeight: Fonts.weight.black, color: Colors.rock[900] },
  label: { fontSize: Fonts.size.xs, color: Colors.rock[400], marginTop: 2 },
})

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.rock[50] },
  content: { paddingBottom: Spacing[10] },
  notFound: { padding: Spacing[6], textAlign: 'center', color: Colors.rock[400] },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
  },
  backBtn: { padding: Spacing[1] },
  backText: { fontSize: Fonts.size.base, color: Colors.summit[600], fontWeight: Fonts.weight.medium },
  actions: { flexDirection: 'row', gap: Spacing[2] },
  actionBtn: { padding: Spacing[2] },
  actionText: { fontSize: 20 },
  hero: { width: '100%', height: 240 },
  heroPlaceholder: {
    backgroundColor: Colors.rock[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: { fontSize: 72 },
  infoCard: {
    backgroundColor: Colors.white,
    padding: Spacing[5],
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    borderRadius: Radius.xl,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  infoLeft: { flex: 1 },
  locationName: { fontSize: Fonts.size['2xl'], fontWeight: Fonts.weight.bold, color: Colors.rock[900] },
  sessionDate: { fontSize: Fonts.size.sm, color: Colors.rock[400], marginTop: 2 },
  statsStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.rock[100],
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
    marginBottom: Spacing[4],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[3],
  },
  infoLabel: { fontSize: Fonts.size.sm, color: Colors.rock[400] },
  infoValue: { fontSize: Fonts.size.sm, color: Colors.rock[800], fontWeight: Fonts.weight.medium },
  notesBox: {
    marginTop: Spacing[4],
    backgroundColor: Colors.rock[50],
    borderRadius: Radius.md,
    padding: Spacing[4],
  },
  notesText: { fontSize: Fonts.size.base, color: Colors.rock[600], fontStyle: 'italic', lineHeight: 22 },
  climbsCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    borderRadius: Radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  climbsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
  },
  climbsTitle: { fontSize: Fonts.size.lg, fontWeight: Fonts.weight.semibold, color: Colors.rock[900] },
  addBtn: {
    backgroundColor: Colors.summit[500],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: 999,
  },
  addBtnText: { color: Colors.white, fontWeight: Fonts.weight.semibold, fontSize: Fonts.size.sm },
  emptyClimbs: { padding: Spacing[8], alignItems: 'center' },
  emptyText: { fontSize: Fonts.size.base, color: Colors.rock[400] },
  climbsList: { paddingHorizontal: Spacing[5] },
})
