import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { format } from 'date-fns'
import type { ClimbingSession } from '../types'
import { ClimbingTypeBadge } from './Badges'
import { Colors, Fonts, Radius, Spacing } from '../constants/Colors'

interface Props {
  session: ClimbingSession
  climbs?: { status: string }[]
}

export default function SessionCard({ session, climbs = [] }: Props) {
  const router = useRouter()
  const sentCount = climbs.filter(
    c => c.status === 'SENT' || c.status === 'FLASHED',
  ).length

  const hasPhoto = session.photoURLs?.length > 0

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/session/${session.id}`)}
      activeOpacity={0.85}
    >
      {/* Hero image */}
      {hasPhoto ? (
        <Image
          source={{ uri: session.photoURLs[0] }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.heroImage, styles.heroPlaceholder]}>
          <Text style={styles.heroEmoji}>
            {session.climbingType === 'BOULDERING'
              ? '🪨'
              : session.climbingType === 'SPORT'
              ? '🧗'
              : '⛰️'}
          </Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.location} numberOfLines={1}>
              {session.locationName}
            </Text>
            <Text style={styles.date}>
              {format(new Date(session.sessionDate), 'EEEE, MMM d, yyyy')}
              {session.durationMinutes ? ` · ${session.durationMinutes} min` : ''}
            </Text>
          </View>
          <ClimbingTypeBadge type={session.climbingType} />
        </View>

        {/* Stats strip */}
        <View style={styles.statsRow}>
          <StatPill value={climbs.length} label="climbs" />
          <StatPill value={sentCount} label="sent" accent={Colors.summit[600]} />
          {session.durationMinutes ? (
            <StatPill value={`${session.durationMinutes}m`} label="duration" />
          ) : null}
          {session.partners?.length > 0 ? (
            <StatPill
              value={session.partners.length}
              label={session.partners.length === 1 ? 'partner' : 'partners'}
            />
          ) : null}
        </View>

        {/* Notes */}
        {session.notes ? (
          <Text style={styles.notes} numberOfLines={2}>
            "{session.notes}"
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  )
}

function StatPill({
  value,
  label,
  accent,
}: {
  value: string | number
  label: string
  accent?: string
}) {
  return (
    <View style={pillStyles.container}>
      <Text style={[pillStyles.value, accent ? { color: accent } : {}]}>
        {value}
      </Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing[4],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroImage: {
    width: '100%',
    height: 180,
  },
  heroPlaceholder: {
    backgroundColor: Colors.rock[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 64,
  },
  content: {
    padding: Spacing[4],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  headerLeft: {
    flex: 1,
  },
  location: {
    fontSize: Fonts.size.xl,
    fontWeight: Fonts.weight.bold,
    color: Colors.rock[900],
    marginBottom: 2,
  },
  date: {
    fontSize: Fonts.size.sm,
    color: Colors.rock[400],
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  notes: {
    fontSize: Fonts.size.sm,
    color: Colors.rock[500],
    fontStyle: 'italic',
    lineHeight: 20,
  },
})

const pillStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.rock[50],
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    alignItems: 'center',
    minWidth: 52,
  },
  value: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.bold,
    color: Colors.rock[900],
  },
  label: {
    fontSize: Fonts.size.xs,
    color: Colors.rock[400],
    marginTop: 1,
  },
})
