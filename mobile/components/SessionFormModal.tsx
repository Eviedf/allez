import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native'
import * as Location from 'expo-location'
import { format } from 'date-fns'
import type { CreateSessionData, ClimbingType } from '../types'
import { Colors, Fonts, Radius, Spacing } from '../constants/Colors'

interface Props {
  visible: boolean
  onClose: () => void
  onSubmit: (data: CreateSessionData) => Promise<void>
  initial?: Partial<CreateSessionData>
}

const TYPES: { value: ClimbingType; label: string; emoji: string }[] = [
  { value: 'BOULDERING', label: 'Bouldering', emoji: '🪨' },
  { value: 'SPORT',      label: 'Sport',      emoji: '🧗' },
  { value: 'TRAD',       label: 'Trad',       emoji: '⛰️' },
]

export default function SessionFormModal({ visible, onClose, onSubmit, initial }: Props) {
  const today = format(new Date(), 'yyyy-MM-dd')

  const [date,     setDate]     = useState(initial?.sessionDate   ?? today)
  const [location, setLocation] = useState(initial?.locationName  ?? '')
  const [lat,      setLat]      = useState<number | null>(initial?.latitude ?? null)
  const [lng,      setLng]      = useState<number | null>(initial?.longitude ?? null)
  const [type,     setType]     = useState<ClimbingType>(initial?.climbingType ?? 'BOULDERING')
  const [duration, setDuration] = useState(initial?.durationMinutes?.toString() ?? '')
  const [partners, setPartners] = useState(initial?.partners?.join(', ') ?? '')
  const [notes,    setNotes]    = useState(initial?.notes ?? '')
  const [saving,   setSaving]   = useState(false)
  const [locating, setLocating] = useState(false)

  async function detectLocation() {
    setLocating(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to auto-detect your position.')
        return
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      setLat(pos.coords.latitude)
      setLng(pos.coords.longitude)

      // Reverse geocode to get a place name
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      })
      if (place) {
        const name = [place.name, place.city, place.country].filter(Boolean).join(', ')
        if (!location) setLocation(name)
      }
    } catch {
      Alert.alert('Error', 'Could not get your location.')
    } finally {
      setLocating(false)
    }
  }

  async function handleSubmit() {
    if (!location.trim()) {
      Alert.alert('Location required', 'Please enter a location name.')
      return
    }
    setSaving(true)
    try {
      const partnerList = partners
        .split(',')
        .map(p => p.trim())
        .filter(Boolean)

      await onSubmit({
        sessionDate:     date,
        locationName:    location.trim(),
        latitude:        lat,
        longitude:       lng,
        climbingType:    type,
        notes:           notes.trim() || null,
        durationMinutes: duration ? parseInt(duration, 10) : null,
        partners:        partnerList,
        photoURLs:       initial?.photoURLs ?? [],
      })
      onClose()
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save session')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Log Session</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={saving} style={styles.saveBtn}>
            {saving
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Text style={styles.saveText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          {/* Climbing type */}
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeBtn, type === t.value && styles.typeBtnActive]}
                onPress={() => setType(t.value)}
              >
                <Text style={styles.typeEmoji}>{t.emoji}</Text>
                <Text style={[styles.typeLabel, type === t.value && styles.typeLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date */}
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={Colors.rock[300]}
          />

          {/* Location */}
          <Text style={styles.label}>Location</Text>
          <View style={styles.locationRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Fontainebleau, France"
              placeholderTextColor={Colors.rock[300]}
            />
            <TouchableOpacity
              style={styles.gpsBtn}
              onPress={detectLocation}
              disabled={locating}
            >
              {locating
                ? <ActivityIndicator size="small" color={Colors.summit[500]} />
                : <Text style={styles.gpsEmoji}>📍</Text>
              }
            </TouchableOpacity>
          </View>
          {lat != null && (
            <Text style={styles.coords}>
              📌 {lat.toFixed(4)}, {lng?.toFixed(4)}
            </Text>
          )}

          {/* Duration */}
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g. 120"
            placeholderTextColor={Colors.rock[300]}
            keyboardType="numeric"
          />

          {/* Partners */}
          <Text style={styles.label}>Climbing partners</Text>
          <TextInput
            style={styles.input}
            value={partners}
            onChangeText={setPartners}
            placeholder="Alice, Bob (comma separated)"
            placeholderTextColor={Colors.rock[300]}
          />

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="How did it go? Any memorable moments…"
            placeholderTextColor={Colors.rock[300]}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.rock[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Platform.OS === 'ios' ? Spacing[6] : Spacing[4],
    paddingBottom: Spacing[4],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
  },
  title: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.semibold,
    color: Colors.rock[900],
  },
  cancelBtn: { padding: Spacing[1] },
  cancelText: { fontSize: Fonts.size.base, color: Colors.rock[500] },
  saveBtn: {
    backgroundColor: Colors.summit[500],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: Radius.full,
    minWidth: 60,
    alignItems: 'center',
  },
  saveText: { fontSize: Fonts.size.base, fontWeight: Fonts.weight.semibold, color: Colors.white },
  form: { flex: 1 },
  formContent: { padding: Spacing[5], gap: 4 },
  label: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semibold,
    color: Colors.rock[600],
    marginTop: Spacing[4],
    marginBottom: Spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.rock[200],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: Fonts.size.base,
    color: Colors.rock[900],
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing[3],
  },
  locationRow: {
    flexDirection: 'row',
    gap: Spacing[2],
    alignItems: 'center',
  },
  gpsBtn: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.rock[200],
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsEmoji: { fontSize: 22 },
  coords: {
    fontSize: Fonts.size.xs,
    color: Colors.summit[600],
    marginTop: 4,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  typeBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.rock[200],
    paddingVertical: Spacing[3],
    alignItems: 'center',
    gap: 4,
  },
  typeBtnActive: {
    borderColor: Colors.summit[500],
    backgroundColor: Colors.summit[50],
  },
  typeEmoji: { fontSize: 22 },
  typeLabel: {
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.medium,
    color: Colors.rock[500],
  },
  typeLabelActive: {
    color: Colors.summit[700],
    fontWeight: Fonts.weight.semibold,
  },
})
