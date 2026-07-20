import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/LoadingSpinner'

export default function RootLayout() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="session/[id]"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="log"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  )
}
