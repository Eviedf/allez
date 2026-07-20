import { Tabs } from 'expo-router'
import { Text, View, StyleSheet } from 'react-native'
import { Colors, Fonts } from '../../constants/Colors'

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[iconStyles.wrap, focused && iconStyles.active]}>
      <Text style={iconStyles.emoji}>{emoji}</Text>
    </View>
  )
}

const iconStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, padding: 4 },
  active: { backgroundColor: Colors.summit[50] },
  emoji: { fontSize: 22 },
})

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.rock[100],
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.summit[600],
        tabBarInactiveTintColor: Colors.rock[400],
        tabBarLabelStyle: {
          fontSize: Fonts.size.xs,
          fontWeight: Fonts.weight.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏔️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
