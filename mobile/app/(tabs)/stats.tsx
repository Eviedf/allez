import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { format, getMonth, getYear } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { getDashboardStats, getSessions } from '../../lib/firestore'
import type { DashboardStats, ClimbingSession } from '../../types'
import StatsCard from '../../components/StatsCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Colors, Fonts, Radius, Spacing } from '../../constants/Colors'

export default function StatsScreen() {
  const { user } = useAuth()
  const [stats,    setStats]    = useState<DashboardStats | null>(null)
  const [sessions, setSessions] = useState<ClimbingSession[]>([])
  const [loading,  setLoading]  = useState(true)

  useFocusEffect(
    useCallback(() => {
      if (!user) return
      setLoading(true)
      Promise.all([getDashboardStats(user.uid), getSessions(user.uid)])
        .then(([s, sess]) => { setStats(s); setSessions(sess) })
        .finally(() => setLoading(false))
    }, [user]),
  )

  if (loading) return <LoadingSpinner />

  // Monthly activity: count sessions per month (last 6 months)
  const now = new Date()
  const monthlyActivity = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const count = sessions.filter(s => {
      const sd = new Date(s.sessionDate)
      return getMonth(sd) === getMonth(d) && getYear(sd) === getYear(d)
    }).length
    return { label: format(d, 'MMM'), count }
  })
  const maxCount = Math.max(...monthlyActivity.map(m => m.count), 1)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Stats 📊</Text>
          <Text style={styles.subtitle}>Your climbing at a glance</Text>
        </View>

        {/* Key stats */}
        <View style={styles.statsGrid}>
          <StatsCard icon="📅" label="Sessions"     value={stats?.totalSessions ?? 0} />
          <StatsCard icon="🧗" label="Climbs"       value={stats?.totalClimbs ?? 0}   />
          <StatsCard icon="🏆" label="Top grade"    value={stats?.highestGradeSent ?? '—'} accent={Colors.send[600]} />
          <StatsCard icon="🌿" label="Outdoor"      value={stats?.outdoorSessions ?? 0} accent={Colors.summit[600]} />
        </View>

        {/* Monthly activity bar chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monthly Activity</Text>
          <View style={styles.barChart}>
            {monthlyActivity.map(m => (
              <View key={m.label} style={styles.barWrap}>
                <Text style={styles.barCount}>{m.count > 0 ? m.count : ''}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${(m.count / maxCount) * 100}%` },
                      m.count === 0 && styles.barEmpty,
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Favorite locations */}
        {(stats?.favoriteLocations?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Locations</Text>
            {stats!.favoriteLocations.map((loc, i) => (
              <View key={loc} style={styles.locationRow}>
                <Text style={styles.locationRank}>#{i + 1}</Text>
                <Text style={styles.locationName}>📍 {loc}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Outdoor vs indoor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outdoor vs Indoor</Text>
          <View style={styles.splitRow}>
            <View style={[styles.splitCard, { backgroundColor: Colors.summit[50] }]}>
              <Text style={styles.splitEmoji}>🌲</Text>
              <Text style={[styles.splitValue, { color: Colors.summit[600] }]}>
                {stats?.outdoorSessions ?? 0}
              </Text>
              <Text style={styles.splitLabel}>Outdoor</Text>
            </View>
            <View style={[styles.splitCard, { backgroundColor: Colors.rock[50] }]}>
              <Text style={styles.splitEmoji}>🏢</Text>
              <Text style={[styles.splitValue, { color: Colors.rock[600] }]}>
                {stats?.indoorSessions ?? 0}
              </Text>
              <Text style={styles.splitLabel}>Indoor</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.rock[50] },
  content: { paddingBottom: Spacing[10] },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
    marginBottom: Spacing[4],
  },
  title: { fontSize: Fonts.size['2xl'], fontWeight: Fonts.weight.black, color: Colors.rock[900] },
  subtitle: { fontSize: Fonts.size.sm, color: Colors.rock[400], marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing[3],
    marginBottom: Spacing[2],
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    marginHorizontal: Spacing[4],
    marginBottom: Spacing[4],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semibold,
    color: Colors.rock[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing[4],
  },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: Spacing[2] },
  barWrap: { flex: 1, alignItems: 'center', gap: 4 },
  barCount: { fontSize: Fonts.size.xs, color: Colors.rock[500], fontWeight: Fonts.weight.semibold },
  barTrack: { flex: 1, width: '100%', backgroundColor: Colors.rock[100], borderRadius: Radius.sm, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', backgroundColor: Colors.summit[300], borderRadius: Radius.sm },
  barEmpty: { height: 4 },
  barLabel: { fontSize: Fonts.size.xs, color: Colors.rock[400] },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
    gap: Spacing[3],
  },
  locationRank: { fontSize: Fonts.size.sm, fontWeight: Fonts.weight.bold, color: Colors.rock[300], width: 24 },
  locationName: { fontSize: Fonts.size.base, color: Colors.rock[800] },
  splitRow: { flexDirection: 'row', gap: Spacing[4] },
  splitCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    alignItems: 'center',
    gap: Spacing[1],
  },
  splitEmoji: { fontSize: 28 },
  splitValue: { fontSize: Fonts.size['2xl'], fontWeight: Fonts.weight.black },
  splitLabel: { fontSize: Fonts.size.xs, color: Colors.rock[500] },
})
