import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Colors, Fonts, Spacing } from '../constants/Colors'

interface Props {
  icon?: string
  title?: string
  subtitle?: string
}

export default function EmptyState({
  icon = '🧗',
  title = 'Nothing here yet',
  subtitle,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[10],
    paddingHorizontal: Spacing[6],
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing[4],
  },
  title: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.semibold,
    color: Colors.rock[700],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Fonts.size.sm,
    color: Colors.rock[400],
    marginTop: Spacing[2],
    textAlign: 'center',
  },
})
