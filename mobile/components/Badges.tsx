import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import type { ClimbingType, ClimbStatus } from '../types'
import { Colors, Fonts, Radius, Spacing } from '../constants/Colors'

interface BadgeProps {
  label: string
  color: string
  bg: string
}

function Badge({ label, color, bg }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  )
}

const TYPE_MAP: Record<ClimbingType, { label: string; color: string; bg: string }> = {
  BOULDERING: { label: '🪨 Boulder',  color: Colors.summit[700], bg: Colors.summit[100] },
  SPORT:      { label: '🧗 Sport',    color: Colors.send[700],   bg: Colors.send[100] },
  TRAD:       { label: '⚓ Trad',     color: '#7c3aed',          bg: '#ede9fe' },
}

const STATUS_MAP: Record<ClimbStatus, { label: string; color: string; bg: string }> = {
  FLASHED:  { label: '⚡ Flash',    color: '#92400e', bg: '#fef3c7' },
  SENT:     { label: '✅ Sent',     color: Colors.summit[700], bg: Colors.summit[50] },
  PROJECT:  { label: '🎯 Project',  color: Colors.project[600], bg: '#dbeafe' },
  ATTEMPTED:{ label: '🔄 Attempt',  color: Colors.rock[600],   bg: Colors.rock[100] },
}

export function ClimbingTypeBadge({ type }: { type: ClimbingType }) {
  const cfg = TYPE_MAP[type]
  return <Badge {...cfg} />
}

export function ClimbStatusBadge({ status }: { status: ClimbStatus }) {
  const cfg = STATUS_MAP[status]
  return <Badge {...cfg} />
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.semibold,
  },
})
