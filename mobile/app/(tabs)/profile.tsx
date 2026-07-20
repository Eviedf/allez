import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { format } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { getProfile, upsertProfile, getDashboardStats } from '../../lib/firestore'
import type { UserProfile, DashboardStats } from '../../types'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Colors, Fonts, Radius, Spacing } from '../../constants/Colors'

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Professional']

export default function ProfileScreen() {
  const { user }     = useAuth()
  const [profile,  setProfile]  = useState<UserProfile | null>(null)
  const [stats,    setStats]    = useState<DashboardStats | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({ displayName: '', bio: '', climbingLevel: '' })

  useFocusEffect(
    useCallback(() => {
      if (!user) return
      setLoading(true)
      Promise.all([getProfile(user.uid), getDashboardStats(user.uid)])
        .then(([p, s]) => {
          if (p) {
            setProfile(p)
            setForm({ displayName: p.displayName, bio: p.bio ?? '', climbingLevel: p.climbingLevel ?? '' })
          }
          setStats(s)
        })
        .finally(() => setLoading(false))
    }, [user]),
  )

  async function saveEdit() {
    if (!user) return
    setSaving(true)
    try {
      await upsertProfile(user.uid, {
        displayName:  form.displayName,
        bio:          form.bio || null,
        climbingLevel:form.climbingLevel || null,
      })
      setProfile(prev => prev ? { ...prev, ...form, bio: form.bio || null, climbingLevel: form.climbingLevel || null } : prev)
      setEditing(false)
    } catch (e) {
      Alert.alert('Error', 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero header */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>🧗</Text>
          </View>
          <Text style={styles.displayName}>{profile?.displayName ?? 'Climber'}</Text>
          <Text style={styles.username}>@{profile?.username ?? 'climber'}</Text>
          {profile?.climbingLevel && (
            <Text style={styles.level}>{profile.climbingLevel} climber</Text>
          )}
        </View>

        {/* Quick stats */}
        {stats && (
          <View style={styles.quickStats}>
            <QuickStat value={stats.totalSessions} label="Sessions" />
            <View style={styles.divider} />
            <QuickStat value={stats.totalClimbs} label="Climbs" />
            <View style={styles.divider} />
            <QuickStat value={stats.highestGradeSent ?? '—'} label="Best grade" />
            <View style={styles.divider} />
            <QuickStat value={stats.favoriteLocations.length} label="Locations" />
          </View>
        )}

        {/* Bio */}
        {profile?.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.bio}>"{profile.bio}"</Text>
          </View>
        )}

        {/* Favorite locations */}
        {(stats?.favoriteLocations?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite spots</Text>
            <View style={styles.tagsRow}>
              {stats!.favoriteLocations.map(loc => (
                <View key={loc} style={styles.tag}>
                  <Text style={styles.tagText}>📍 {loc}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Member since */}
        {profile?.createdAt && (
          <View style={styles.section}>
            <InfoRow label="Climbing since" value={format(profile.createdAt.toDate?.() ?? new Date(), 'MMMM yyyy')} />
          </View>
        )}

        {/* Edit button / form */}
        {editing ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit Profile</Text>

            <Text style={styles.fieldLabel}>Display name</Text>
            <TextInput
              style={styles.input}
              value={form.displayName}
              onChangeText={v => setForm(f => ({ ...f, displayName: v }))}
            />

            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.bio}
              onChangeText={v => setForm(f => ({ ...f, bio: v }))}
              placeholder="Your climbing story…"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.fieldLabel}>Climbing level</Text>
            <View style={styles.levelRow}>
              {LEVEL_OPTIONS.map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.levelBtn, form.climbingLevel === l && styles.levelBtnActive]}
                  onPress={() => setForm(f => ({ ...f, climbingLevel: l }))}
                >
                  <Text style={[styles.levelText, form.climbingLevel === l && styles.levelTextActive]}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveEdit} disabled={saving}>
                {saving
                  ? <ActivityIndicator size="small" color={Colors.white} />
                  : <Text style={styles.saveBtnText}>Save changes</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
            <Text style={styles.editBtnText}>✏️  Edit profile</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function QuickStat({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={styles.quickStatItem}>
      <Text style={styles.quickStatValue}>{value}</Text>
      <Text style={styles.quickStatLabel}>{label}</Text>
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.rock[50] },
  content: { paddingBottom: Spacing[10] },
  hero: {
    alignItems: 'center',
    backgroundColor: Colors.rock[900],
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[5],
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.rock[700],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[3],
  },
  avatarEmoji: { fontSize: 42 },
  displayName: { fontSize: Fonts.size['2xl'], fontWeight: Fonts.weight.bold, color: Colors.white },
  username: { fontSize: Fonts.size.sm, color: Colors.rock[400], marginTop: 2 },
  level: {
    marginTop: Spacing[2],
    backgroundColor: Colors.summit[600],
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.semibold,
    color: Colors.white,
    overflow: 'hidden',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
  },
  quickStatItem: { flex: 1, paddingVertical: Spacing[4], alignItems: 'center' },
  quickStatValue: { fontSize: Fonts.size.xl, fontWeight: Fonts.weight.black, color: Colors.rock[900] },
  quickStatLabel: { fontSize: Fonts.size.xs, color: Colors.rock[400], marginTop: 2 },
  divider: { width: 1, backgroundColor: Colors.rock[100], marginVertical: Spacing[3] },
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing[5],
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semibold,
    color: Colors.rock[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing[3],
  },
  bio: { fontSize: Fonts.size.base, color: Colors.rock[700], fontStyle: 'italic', lineHeight: 22 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2] },
  tag: { backgroundColor: Colors.rock[50], borderRadius: 999, paddingHorizontal: Spacing[3], paddingVertical: Spacing[1] },
  tagText: { fontSize: Fonts.size.sm, color: Colors.rock[700] },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: Fonts.size.sm, color: Colors.rock[400] },
  infoValue: { fontSize: Fonts.size.base, color: Colors.rock[800], fontWeight: Fonts.weight.medium },
  editBtn: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.rock[200],
  },
  editBtnText: { fontSize: Fonts.size.base, color: Colors.rock[700], fontWeight: Fonts.weight.medium },
  fieldLabel: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semibold,
    color: Colors.rock[600],
    marginTop: Spacing[4],
    marginBottom: Spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.rock[50],
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.rock[200],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: Fonts.size.base,
    color: Colors.rock[900],
  },
  textArea: { minHeight: 80, paddingTop: Spacing[3] },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginTop: Spacing[1] },
  levelBtn: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.rock[200],
    backgroundColor: Colors.rock[50],
  },
  levelBtnActive: { borderColor: Colors.summit[500], backgroundColor: Colors.summit[50] },
  levelText: { fontSize: Fonts.size.sm, color: Colors.rock[600] },
  levelTextActive: { color: Colors.summit[700], fontWeight: Fonts.weight.semibold },
  editActions: { flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[5] },
  saveBtn: {
    flex: 1,
    backgroundColor: Colors.summit[500],
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  saveBtnText: { color: Colors.white, fontWeight: Fonts.weight.semibold, fontSize: Fonts.size.base },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.rock[100],
    borderRadius: Radius.full,
    paddingVertical: Spacing[3],
    alignItems: 'center',
  },
  cancelBtnText: { color: Colors.rock[700], fontWeight: Fonts.weight.medium, fontSize: Fonts.size.base },
})
