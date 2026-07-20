import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native'
import MapView, { Marker, Callout, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps'
import { useFocusEffect, useRouter } from 'expo-router'
import { format } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { getSessions } from '../../lib/firestore'
import type { ClimbingSession } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import { ClimbingTypeBadge } from '../../components/Badges'
import { Colors, Fonts, Radius, Spacing } from '../../constants/Colors'

export default function MapScreen() {
  const { user }  = useAuth()
  const router    = useRouter()
  const [sessions, setSessions] = useState<ClimbingSession[]>([])
  const [loading,  setLoading]  = useState(true)

  useFocusEffect(
    useCallback(() => {
      if (!user) return
      setLoading(true)
      getSessions(user.uid)
        .then(setSessions)
        .finally(() => setLoading(false))
    }, [user]),
  )

  if (loading) return <LoadingSpinner />

  const mapped = sessions.filter(s => s.latitude != null && s.longitude != null)

  const initialRegion = mapped.length > 0
    ? {
        latitude:       mapped[0].latitude!,
        longitude:      mapped[0].longitude!,
        latitudeDelta:  8,
        longitudeDelta: 8,
      }
    : {
        latitude: 46.8,
        longitude: 8.2,
        latitudeDelta: 20,
        longitudeDelta: 20,
      }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Map 🗺️</Text>
        <Text style={styles.subtitle}>
          {mapped.length} location{mapped.length !== 1 ? 's' : ''} on your climbing map
        </Text>
      </View>

      {/* Map — web not supported */}
      {Platform.OS === 'web' ? (
        <View style={styles.webMapFallback}>
          <Text style={styles.webMapEmoji}>🗺️</Text>
          <Text style={styles.webMapText}>Map view is available on the mobile app.</Text>
          <Text style={styles.webMapSub}>Use Expo Go on your phone to see your climbing locations on a map.</Text>
        </View>
      ) : (
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        mapType="none"
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        {mapped.map(session => (
          <Marker
            key={session.id}
            coordinate={{ latitude: session.latitude!, longitude: session.longitude! }}
            title={session.locationName}
          >
            <View style={styles.markerDot}>
              <Text style={styles.markerEmoji}>📍</Text>
            </View>
            <Callout onPress={() => router.push(`/session/${session.id}`)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{session.locationName}</Text>
                <Text style={styles.calloutDate}>
                  {format(new Date(session.sessionDate), 'MMM d, yyyy')}
                </Text>
                <Text style={styles.calloutLink}>Tap to view →</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      )}

      {/* Location list */}
      <FlatList
        data={sessions}
        keyExtractor={s => s.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.listHeader}>All Sessions</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Log a session with GPS to see it on the map.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listItem}
            onPress={() => router.push(`/session/${item.id}`)}
          >
            <View style={styles.listLeft}>
              <Text style={styles.listLocation}>{item.locationName}</Text>
              <Text style={styles.listDate}>
                {format(new Date(item.sessionDate), 'MMM d, yyyy')}
                {item.latitude == null ? ' · No GPS' : ''}
              </Text>
            </View>
            <ClimbingTypeBadge type={item.climbingType} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.rock[50] },
  header: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
  },
  title: { fontSize: Fonts.size['2xl'], fontWeight: Fonts.weight.black, color: Colors.rock[900] },
  subtitle: { fontSize: Fonts.size.sm, color: Colors.rock[400], marginTop: 2 },
  map: { height: 300 },
  webMapFallback: {
    height: 200,
    backgroundColor: Colors.rock[100],
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
  },
  webMapEmoji: { fontSize: 40, marginBottom: Spacing[3] },
  webMapText: { fontSize: Fonts.size.base, fontWeight: Fonts.weight.semibold, color: Colors.rock[700], textAlign: 'center' },
  webMapSub: { fontSize: Fonts.size.sm, color: Colors.rock[400], textAlign: 'center', marginTop: Spacing[2] },
  markerDot: { alignItems: 'center' },
  markerEmoji: { fontSize: 28 },
  callout: { padding: Spacing[2], minWidth: 140 },
  calloutTitle: { fontWeight: Fonts.weight.bold, color: Colors.rock[900], fontSize: Fonts.size.base },
  calloutDate: { fontSize: Fonts.size.xs, color: Colors.rock[500], marginTop: 2 },
  calloutLink: { fontSize: Fonts.size.xs, color: Colors.summit[600], marginTop: 4 },
  list: { flex: 1 },
  listContent: { padding: Spacing[4] },
  listHeader: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semibold,
    color: Colors.rock[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing[3],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[2],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  listLeft: { flex: 1 },
  listLocation: { fontSize: Fonts.size.base, fontWeight: Fonts.weight.medium, color: Colors.rock[900] },
  listDate: { fontSize: Fonts.size.xs, color: Colors.rock[400], marginTop: 2 },
  emptyText: { fontSize: Fonts.size.sm, color: Colors.rock[400], textAlign: 'center', padding: Spacing[6] },
})
