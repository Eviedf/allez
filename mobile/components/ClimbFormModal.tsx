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
import type { CreateClimbData, ClimbStatus, Climb } from '../types'
import { Colors, Fonts, Radius, Spacing } from '../constants/Colors'

interface Props {
  visible: boolean
  onClose: () => void
  onSubmit: (data: CreateClimbData) => Promise<void>
  initial?: Climb
}

const STATUSES: { value: ClimbStatus; label: string; emoji: string }[] = [
  { value: 'FLASHED',   label: 'Flash',    emoji: '⚡' },
  { value: 'SENT',      label: 'Sent',     emoji: '✅' },
  { value: 'PROJECT',   label: 'Project',  emoji: '🎯' },
  { value: 'ATTEMPTED', label: 'Tried',    emoji: '🔄' },
]

export default function ClimbFormModal({ visible, onClose, onSubmit, initial }: Props) {
  const [name,     setName]     = useState(initial?.name     ?? '')
  const [grade,    setGrade]    = useState(initial?.grade    ?? '')
  const [style,    setStyle]    = useState(initial?.style    ?? '')
  const [status,   setStatus]   = useState<ClimbStatus>(initial?.status ?? 'SENT')
  const [attempts, setAttempts] = useState(initial?.attempts?.toString() ?? '1')
  const [notes,    setNotes]    = useState(initial?.notes    ?? '')
  const [saving,   setSaving]   = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !grade.trim()) {
      Alert.alert('Required', 'Name and grade are required.')
      return
    }
    setSaving(true)
    try {
      await onSubmit({
        name:     name.trim(),
        grade:    grade.trim(),
        style:    style.trim() || null,
        status,
        attempts: parseInt(attempts, 10) || 1,
        notes:    notes.trim() || null,
      })
      onClose()
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed to save')
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
          <Text style={styles.title}>{initial ? 'Edit Climb' : 'Add Climb'}</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={saving} style={styles.saveBtn}>
            {saving
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <Text style={styles.saveText}>Save</Text>
            }
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          {/* Status */}
          <Text style={styles.label}>Result</Text>
          <View style={styles.statusRow}>
            {STATUSES.map(s => (
              <TouchableOpacity
                key={s.value}
                style={[styles.statusBtn, status === s.value && styles.statusBtnActive]}
                onPress={() => setStatus(s.value)}
              >
                <Text style={styles.statusEmoji}>{s.emoji}</Text>
                <Text style={[styles.statusLabel, status === s.value && styles.statusLabelActive]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. La Marie Rose"
            placeholderTextColor={Colors.rock[300]}
            autoFocus
          />

          {/* Grade + Style row */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Grade</Text>
              <TextInput
                style={styles.input}
                value={grade}
                onChangeText={setGrade}
                placeholder="e.g. 6B+"
                placeholderTextColor={Colors.rock[300]}
                autoCapitalize="characters"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Style</Text>
              <TextInput
                style={styles.input}
                value={style}
                onChangeText={setStyle}
                placeholder="e.g. Crimp"
                placeholderTextColor={Colors.rock[300]}
              />
            </View>
          </View>

          {/* Attempts */}
          <Text style={styles.label}>Attempts</Text>
          <View style={styles.attemptsRow}>
            <TouchableOpacity
              style={styles.attemptsBtn}
              onPress={() => setAttempts(a => String(Math.max(1, parseInt(a) - 1)))}
            >
              <Text style={styles.attemptsBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.attemptsValue}>{attempts}</Text>
            <TouchableOpacity
              style={styles.attemptsBtn}
              onPress={() => setAttempts(a => String(parseInt(a) + 1))}
            >
              <Text style={styles.attemptsBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Beta, feelings, conditions…"
            placeholderTextColor={Colors.rock[300]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.rock[50] },
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
  title: { fontSize: Fonts.size.lg, fontWeight: Fonts.weight.semibold, color: Colors.rock[900] },
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
  formContent: { padding: Spacing[5] },
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
  textArea: { minHeight: 80, paddingTop: Spacing[3] },
  row: { flexDirection: 'row', gap: Spacing[3] },
  statusRow: { flexDirection: 'row', gap: Spacing[2] },
  statusBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.rock[200],
    paddingVertical: Spacing[3],
    alignItems: 'center',
    gap: 4,
  },
  statusBtnActive: { borderColor: Colors.summit[500], backgroundColor: Colors.summit[50] },
  statusEmoji: { fontSize: 20 },
  statusLabel: { fontSize: Fonts.size.xs, fontWeight: Fonts.weight.medium, color: Colors.rock[500] },
  statusLabelActive: { color: Colors.summit[700], fontWeight: Fonts.weight.semibold },
  attemptsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.rock[200],
    overflow: 'hidden',
  },
  attemptsBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.rock[50],
  },
  attemptsBtnText: { fontSize: 22, color: Colors.rock[700], fontWeight: Fonts.weight.bold },
  attemptsValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: Fonts.size.xl,
    fontWeight: Fonts.weight.bold,
    color: Colors.rock[900],
  },
})
