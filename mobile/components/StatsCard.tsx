import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, Fonts, Radius, Spacing } from '../constants/Colors'

interface Props {
  icon: string
  label: string
  value: string | number
  accent?: string
}

export default function StatsCard({ icon, label, value, accent = Colors.summit[500] }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing[4],
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    margin: Spacing[1],
  },
  icon: {
    fontSize: 26,
    marginBottom: Spacing[2],
  },
  value: {
    fontSize: Fonts.size['2xl'],
    fontWeight: Fonts.weight.black,
  },
  label: {
    fontSize: Fonts.size.xs,
    color: Colors.rock[400],
    marginTop: 2,
    textAlign: 'center',
  },
})
