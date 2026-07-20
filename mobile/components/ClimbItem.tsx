import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import type { Climb } from '../types'
import { ClimbStatusBadge } from './Badges'
import { Colors, Fonts, Radius, Spacing } from '../constants/Colors'

interface Props {
  climb: Climb
  onEdit?: (climb: Climb) => void
  onDelete?: (id: string) => void
}

export default function ClimbItem({ climb, onEdit, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>🧗</Text>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{climb.name}</Text>
        {climb.notes ? (
          <Text style={styles.notes} numberOfLines={1}>{climb.notes}</Text>
        ) : null}
      </View>
      <View style={styles.right}>
        <Text style={styles.grade}>{climb.grade}</Text>
        <ClimbStatusBadge status={climb.status} />
        {climb.attempts > 1 && (
          <Text style={styles.attempts}>{climb.attempts}×</Text>
        )}
      </View>
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(climb)}
              style={styles.actionBtn}
              hitSlop={8}
            >
              <Text style={styles.actionText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(climb.id)}
              style={styles.actionBtn}
              hitSlop={8}
            >
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.rock[100],
    gap: Spacing[3],
  },
  emoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: Fonts.size.base,
    fontWeight: Fonts.weight.medium,
    color: Colors.rock[900],
  },
  notes: {
    fontSize: Fonts.size.xs,
    color: Colors.rock[400],
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  grade: {
    fontFamily: 'monospace',
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.bold,
    color: Colors.rock[700],
    backgroundColor: Colors.rock[50],
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  attempts: {
    fontSize: Fonts.size.xs,
    color: Colors.rock[400],
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
  actionBtn: {
    padding: Spacing[1],
  },
  actionText: {
    fontSize: 16,
  },
})
