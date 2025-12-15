# 📍 ProxChat

**ProxChat** is a proximity-based voice chat mobile app for iOS and Android. Connect with people within 100 meters through real-time voice communication – like a modern walkie-talkie or proximity chat from video games.

## ✨ Features

- 🎙️ **Real-time Voice Chat** - Crystal clear voice communication using Agora RTC
- 📍 **Proximity-based** - Auto-connect with people within ~100m radius
- 🔄 **Auto Zone Switching** - Seamlessly move between proximity zones
- 🎚️ **Push-to-Talk & Open Mic** - Choose your preferred communication mode
- 🚫 **Block & Mute** - Full control over who you hear
- 🛡️ **Report System** - Auto-mute users with excessive reports
- 🌙 **Dark Mode** - Beautiful dark theme optimized for all conditions
- 🔋 **Battery Efficient** - Smart location updates every 5 seconds

## 🛠️ Tech Stack

| Technology       | Purpose                               |
| ---------------- | ------------------------------------- |
| React Native     | Cross-platform mobile framework       |
| TypeScript       | Type-safe development                 |
| Firebase Auth    | Authentication (Email, Google, Apple) |
| Firestore        | Real-time database                    |
| Agora SDK        | Voice chat infrastructure             |
| Zustand          | State management                      |
| React Navigation | Navigation                            |
| ngeohash         | Location hashing                      |

## 📁 Project Structure

```
/src
  /components         # Reusable UI components
    PushToTalkButton.tsx
    UserCountBadge.tsx
    ChannelIndicator.tsx
    MicModeToggle.tsx
    BlockReportModal.tsx
  /screens            # App screens
    SplashScreen.tsx
    LoginScreen.tsx
    SignupScreen.tsx
    UsernameScreen.tsx
    PermissionsScreen.tsx
    OnboardingScreen.tsx
    HomeScreen.tsx
    SettingsScreen.tsx
  /services           # Business logic
    authService.ts
    locationService.ts
    voiceService.ts
    channelService.ts
    userService.ts
    geofenceService.ts
  /hooks              # Custom React hooks
    useAuth.ts
    useLocation.ts
    useVoiceChannel.ts
    useNearbyUsers.ts
  /store              # Zustand state
    useAppStore.ts
  /navigation         # Navigation config
    AppNavigator.tsx
    AuthStack.tsx
    MainStack.tsx
  /types              # TypeScript types
    index.ts
  /utils              # Utilities
    constants.ts
    geohash.ts
    permissions.ts
  /config             # Configuration
    firebase.ts
    agora.ts
/backend              # Token server
  index.js
  package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16
- React Native CLI
- Xcode (for iOS)
- Android Studio (for Android)
- Firebase project
- Agora account

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/ProxChat.git
cd ProxChat
npm install
```

### 2. iOS Setup

```bash
cd ios
pod install
cd ..
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password, Google, Apple)
3. Create a Firestore database
4. Download config files:
   - `GoogleService-Info.plist` → `/ios/ProxChat/`
   - `google-services.json` → `/android/app/`
5. Update `/src/config/firebase.ts` with your config

### 4. Agora Setup

1. Create an account at [Agora Console](https://console.agora.io)
2. Create a new project with APP ID + Token
3. Because `react-native-agora@4.x` is not yet Hermes-compatible, set Expo to use the JSC engine in `app.json`:

```json
{
  "expo": {
    "jsEngine": "jsc",
    ...
  }
}
```

4. Add the following entries to your `.env` or `app.config` so `src/app/config/agora.ts` can validate them:

```bash
EXPO_PUBLIC_AGORA_APP_ID=your_app_id
EXPO_PUBLIC_TOKEN_SERVER_URL=https://your-server.com/api/agora/token
# optional
EXPO_PUBLIC_AGORA_CHANNEL_PREFIX=general_
```

### 5. Backend Token Server

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Agora credentials
npm start
```

Deploy to Railway, Render, or Vercel for production.

### 6. iOS Info.plist

Add to `ios/ProxChat/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>ProxChat uses your location to connect you with people nearby.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>ProxChat uses your location in the background to keep you connected.</string>
<key>NSMicrophoneUsageDescription</key>
<string>ProxChat needs microphone access so you can talk with people nearby.</string>
<key>UIBackgroundModes</key>
<array>
  <string>location</string>
  <string>audio</string>
</array>
```

### 7. Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

### 8. Run the App

```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## 📊 Firestore Schema

### users

```javascript
{
  id: string,
  username: string,
  email: string,
  createdAt: timestamp,
  blockedUsers: string[],
  mutedUsers: string[],
  reportCount: number,
  isAutoMuted: boolean
}
```

### activeUsers

```javascript
{
  odcumentId: string,
  username: string,
  location: GeoPoint,
  geohash: string,
  proximityChannel: string,
  agoraUid: number,
  isSpeaking: boolean,
  lastUpdated: timestamp
}
```

### reports

```javascript
{
  reportedUserId: string,
  reporterUserId: string,
  channel: string,
  reason: string,
  timestamp: timestamp,
  status: 'pending' | 'reviewed'
}
```

### blockedZones

```javascript
{
  name: string,
  center: GeoPoint,
  radiusMeters: number
}
```

## 🔒 Security

- Firestore security rules enforce user permissions
- Token server generates short-lived Agora tokens
- Users can only modify their own data
- Report system auto-mutes abusive users

## 🎯 Roadmap

- [ ] Multiple channel support (categories)
- [ ] Voice activity detection
- [ ] Custom proximity radius
- [ ] Audio volume controls
- [ ] Message history (text)
- [ ] User profiles
- [ ] Friend system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [Agora](https://agora.io) for voice infrastructure
- [Firebase](https://firebase.google.com) for backend services
- [React Native](https://reactnative.dev) for the framework

---

**Made with ❤️ by the ProxChat Team**
