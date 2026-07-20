import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { getSessions, getClimbs } from '../../lib/firestore'
import type { ClimbingSession, Climb } from '../../types'
import SessionCard from '../../components/SessionCard'
import EmptyState from '../../components/EmptyState'
import LoadingSpinner from '../../components/LoadingSpinner'
import SessionFormModal from '../../components/SessionFormModal'
import { createSession } from '../../lib/firestore'
import { Colors, Fonts, Spacing } from '../../constants/Colors'

export default function FeedScreen() {
  const { user } = useAuth()
  const [sessions, setSessions]           = useState<ClimbingSession[]>([])
  const [climbsMap, setClimbsMap]         = useState<Record<string, Climb[]>>({})
  const [loading, setLoading]             = useState(true)
  const [refreshing, setRefreshing]       = useState(false)
  const [showNewSession, setShowNewSession] = useState(false)

  async function load() {
    if (!user) return
    const data = await getSessions(user.uid)
    setSessions(data)
    // Fetch climbs for visible sessions (first 10)
    const visible = data.slice(0, 10)
    const results = await Promise.all(visible.map(s => getClimbs(s.id)))
    const map: Record<string, Climb[]> = {}
    visible.forEach((s, i) => { map[s.id] = results[i] })
    setClimbsMap(map)
  }

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      load().finally(() => setLoading(false))
    }, [user]),
  )

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  async function handleCreate(data: Parameters<typeof createSession>[1]) {
    if (!user) return
    await createSession(user.uid, data)
    await load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appName}>Allez 🧗</Text>
          <Text style={styles.tagline}>Your climbing journey</Text>
        </View>
        <TouchableOpacity style={styles.logBtn} onPress={() => setShowNewSession(true)}>
          <Text style={styles.logBtnText}>+ Log Climb</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={s => s.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.summit[500]} />}
        ListEmptyComponent={
          <EmptyState
            icon="🏔️"
            title="Your adventure starts here"
            subtitle="Tap + Log Climb to record your first session"
          />
        }
        renderItem={({ item }) => (
          <SessionCard session={item} climbs={climbsMap[item.id] ?? []} />
        )}
      />

      <SessionFormModal
        visible={showNewSession}
        onClose={() => setShowNewSession(false)}
        onSubmit={handleCreate}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.rock[50] },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
  },
  appName: {
    fontSize: Fonts.size['2xl'],
    fontWeight: Fonts.weight.black,
    color: Colors.rock[900],
  },
  tagline: {
    fontSize: Fonts.size.sm,
    color: Colors.rock[400],
    marginTop: 1,
  },
  logBtn: {
    backgroundColor: Colors.summit[500],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2] + 2,
    borderRadius: 999,
  },
  logBtnText: {
    color: Colors.white,
    fontWeight: Fonts.weight.semibold,
    fontSize: Fonts.size.base,
  },
  list: {
    padding: Spacing[4],
    paddingBottom: Spacing[10],
  },
})
