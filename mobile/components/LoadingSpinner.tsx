import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors'

export default function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.summit[500]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.rock[50],
  },
})
