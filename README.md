# Allez 🧗

A mobile climbing adventure app inspired by Strava, Polarsteps, and Toplogger.

Capture the **story** behind climbing — where you climbed, who you were with, memorable sends, ongoing projects, and progress over time.

## Stack

| Layer | Technology |
|---|---|
| Mobile app | React Native, Expo SDK 57, TypeScript |
| Navigation | Expo Router (file-based) |
| Backend | Firebase (Auth + Cloud Firestore + Storage) |
| Maps | react-native-maps + OpenStreetMap tiles |
| Location | expo-location |

## Project structure

```
allez/
├── mobile/                        # Expo app (main project)
│   ├── app/
│   │   ├── _layout.tsx            # Root layout — auth guard + stack navigator
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx        # Bottom tab navigator
│   │   │   ├── index.tsx          # 🏔️  Feed — story cards timeline
│   │   │   ├── map.tsx            # 🗺️  Map — all climbing locations
│   │   │   ├── stats.tsx          # 📊  Stats — dashboard
│   │   │   └── profile.tsx        # 👤  Profile — user info + edit
│   │   ├── session/[id].tsx       # Session detail + climb management
│   │   └── log.tsx                # Log Climb modal
│   ├── components/
│   │   ├── SessionCard.tsx        # Story card for the feed
│   │   ├── ClimbItem.tsx          # Single climb row
│   │   ├── Badges.tsx             # ClimbingTypeBadge, ClimbStatusBadge
│   │   ├── StatsCard.tsx          # Stat tile
│   │   ├── EmptyState.tsx         # Empty placeholder
│   │   ├── LoadingSpinner.tsx     # Loading indicator
│   │   ├── SessionFormModal.tsx   # Log / edit session form
│   │   └── ClimbFormModal.tsx     # Add / edit climb form
│   ├── hooks/
│   │   ├── useAuth.ts             # Firebase Auth state + auto sign-in
│   │   └── useSessions.ts         # Sessions CRUD hook
│   ├── lib/
│   │   ├── firebase.ts            # Firebase app init
│   │   └── firestore.ts           # Typed Firestore CRUD helpers
│   ├── types/index.ts             # TypeScript types
│   ├── constants/Colors.ts        # Design tokens (colors, fonts, spacing)
│   ├── .env.example               # Required environment variables
│   └── app.json                   # Expo config
├── backend/                       # Legacy Spring Boot (reference only)
├── frontend/                      # Legacy React web app (reference only)
└── README.md
```

## Screens

| Screen | Route | Description |
|---|---|---|
| Feed | `/(tabs)/` | Chronological story cards — images, stats, notes |
| Map | `/(tabs)/map` | All session locations on an OpenStreetMap |
| Stats | `/(tabs)/stats` | Sessions, climbs, top grade, monthly activity |
| Profile | `/(tabs)/profile` | Climber profile with stats + edit |
| Session detail | `/session/:id` | Full session — climbs list, edit, delete |
| Log Climb | `/log` | New session modal |

## Firebase data model

```
users/{uid}
  displayName, username, bio, climbingLevel, photoURL, createdAt

sessions/{id}
  userId, sessionDate, locationName, latitude, longitude,
  climbingType, notes, durationMinutes, partners[], photoURLs[], createdAt

climbs/{id}
  sessionId, userId, name, grade, style, status, attempts, notes, createdAt
```

## Getting started

### 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) → **Add project**
2. Enable **Authentication** → Sign-in method → **Anonymous**
3. Enable **Cloud Firestore** → Start in **test mode** (lock down rules before production)
4. Enable **Storage**

### 2. Configure environment variables

```bash
cd mobile
cp .env.example .env
# Fill in your Firebase project values from:
# Firebase Console → Project Settings → Your apps → SDK setup and configuration
```

### 3. Install and run

**Prerequisites:** Node 20+, Expo CLI, Expo Go app on your phone (or Android/iOS simulator)

```bash
cd mobile
npm install
npm start          # starts Metro bundler
```

Then scan the QR code with **Expo Go** on your phone.

### 4. Firestore indexes

The app queries sessions and climbs with `where` + `orderBy` filters. Create composite indexes when prompted in the Expo / Metro logs (Firebase will show a direct link).

Required indexes:
- `sessions`: `userId ASC` + `sessionDate DESC`
- `climbs`: `sessionId ASC` + `createdAt ASC`
- `climbs`: `userId ASC` (for dashboard stats)

## Development

```bash
cd mobile
npm start          # Expo Go (physical device)
npm run android    # Android emulator
npm run ios        # iOS simulator (macOS only)
npm run web        # Web browser (limited — maps may not work)
```

## Firestore security rules (production)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /sessions/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    match /climbs/{climbId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
  }
}
```

## Enums

**ClimbingType:** `BOULDERING` | `SPORT` | `TRAD`

**ClimbStatus:** `ATTEMPTED` | `PROJECT` | `SENT` | `FLASHED`

## Roadmap (not yet implemented)

- Firebase Email/Password and Google sign-in
- Photo upload to Firebase Storage
- Strava integration
- Toplogger integration
- Social feed / following climbers
- Push notifications
- AI coaching suggestions

