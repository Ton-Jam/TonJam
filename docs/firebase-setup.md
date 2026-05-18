# Firebase Integration Setup Guide for TonJam

This document outlines the complete Firebase integration for the TonJam platform, including authentication, Firestore, Cloud Storage, Cloud Functions, and real-time features.

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Environment Variables](#environment-variables)
3. [Firebase Project Configuration](#firebase-project-configuration)
4. [Database Structure](#database-structure)
5. [Security Rules](#security-rules)
6. [Cloud Functions](#cloud-functions)
7. [Real-time Features](#real-time-features)
8. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites

- Firebase project created at [firebase.google.com](https://firebase.google.com)
- Google Cloud Console access
- Node.js 18+ installed
- Vite development environment running

### Installation

Firebase SDK packages are already installed. Verify with:

```bash
npm list firebase firebase-admin
# or
pnpm list firebase firebase-admin
```

---

## Environment Variables

### Client-Side Environment Variables (`.env`)

These variables are used by the frontend and must be prefixed with `VITE_`:

```env
# Firebase Configuration (Required)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G_XXXXXXX  # Optional, for Analytics

# API Keys (Optional, for additional features)
GEMINI_API_KEY=your_gemini_key  # For AI features
```

### Server-Side Environment Variables

For Cloud Functions or backend operations:

```env
# Service Account Key (Required for admin operations)
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json
# OR as base64 encoded JSON
FIREBASE_SERVICE_ACCOUNT_JSON=base64_encoded_json
```

### Getting Your Credentials

#### 1. Firebase Config

Navigate to **Firebase Console → Project Settings → General**:
- Copy the config object or individual values
- These are your `VITE_FIREBASE_*` variables

#### 2. Service Account Key

Navigate to **Firebase Console → Project Settings → Service Accounts**:
1. Click "Generate New Private Key"
2. Save the JSON file securely
3. Convert to base64 (optional):
   ```bash
   cat serviceAccountKey.json | base64 > firebase-key.b64
   ```

---

## Firebase Project Configuration

### 1. Enable Authentication

In Firebase Console → Authentication:

- **Sign-in method**: Enable
  - Email/Password
  - Google
  - Anonymous (for wallet users)

### 2. Create Firestore Database

In Firebase Console → Firestore Database:

1. Click "Create database"
2. Choose "Start in test mode" (or production with security rules)
3. Select a location close to your users
4. Wait for database initialization

### 3. Enable Cloud Storage

In Firebase Console → Storage:

1. Click "Get started"
2. Choose a location for your bucket
3. Accept default security rules for now (will be updated)

### 4. Enable Cloud Functions (Optional)

For server-side operations:

```bash
firebase init functions
```

---

## Database Structure

### Firestore Collections

The TonJam database uses the following structure:

```
users/
├── {userId}
│   ├── uid: string (user ID)
│   ├── name: string
│   ├── username: string
│   ├── email: string
│   ├── avatar: string (URL)
│   ├── bio: string
│   ├── role: string (admin|artist|collector)
│   ├── walletAddress: string
│   ├── followers: number
│   ├── following: number
│   ├── isOnline: boolean
│   ├── lastActive: timestamp
│   ├── isVerifiedArtist: boolean
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   ├── preferences: {
│   │   ├── notifications: {...}
│   │   ├── privacy: {...}
│   │   ├── theme: {...}
│   │   └── language: string
│   ├── metadata/
│   │   ├── preferences: {...}
│   │   └── activities: {...}
│   └── activities/
│       ├── {activityId}
│       │   ├── type: string (follow|like|comment|share|upload|purchase|view)
│       │   ├── targetId: string
│       │   ├── targetType: string
│       │   ├── timestamp: timestamp
│       │   └── isPublic: boolean

tracks/
├── {trackId}
│   ├── title: string
│   ├── artistId: string
│   ├── duration: number
│   ├── fileUrl: string
│   ├── coverUrl: string
│   ├── genre: string
│   ├── createdAt: timestamp
│   └── plays: number

nfts/
├── {nftId}
│   ├── title: string
│   ├── creatorId: string
│   ├── description: string
│   ├── imageUrl: string
│   ├── tokenId: string
│   ├── contractAddress: string
│   ├── createdAt: timestamp
│   └── salePrice: number
```

---

## Security Rules

### Firestore Security Rules

Deploy security rules from `/firestore.rules`:

```bash
firebase deploy --only firestore:rules
```

Key security measures:
- Users can only read/write their own profiles
- Public profiles are readable by all authenticated users
- Activity feeds are protected by user ID
- Admin operations are restricted to admin role

### Cloud Storage Security Rules

Deploy storage rules from `/storage.rules`:

```bash
firebase deploy --only storage
```

Key storage paths:
- `/users/{userId}/avatar/` - User profile pictures
- `/users/{userId}/banner/` - User banners
- `/tracks/{userId}/{trackId}/` - Music files
- `/nfts/{userId}/{nftId}/` - NFT assets
- `/temp/{userId}/` - Temporary uploads
- `/public/` - Public assets

---

## Cloud Functions

### Setup

Create a `functions/` directory and initialize:

```bash
firebase init functions
```

### Available Functions

**User Management:**
- `saveUserProfile(userId, profile)` - Create/update user profile
- `followUser(followerId, followeeId)` - Add follower
- `unfollowUser(followerId, followeeId)` - Remove follower
- `updateUserPreferences(userId, preferences)` - Update user settings

**File Operations:**
- `getUploadUrl(userId, fileName, fileType, folder)` - Get signed upload URL
- `deleteFile(userId, filePath)` - Delete file from storage
- `processUploadedFile(userId, filePath, fileType)` - Process file (thumbnails, etc)

**Notifications:**
- `sendNotification(userId, title, message, type)` - Send notification
- `getUserNotifications(userId, limit)` - Get notifications
- `markNotificationAsRead(notificationId)` - Mark as read

**Activity & Analytics:**
- `logActivity(userId, activityType, data)` - Log user activity
- `getActivityFeed(userId, limit)` - Get activity feed
- `trackEvent(eventName, eventData)` - Track analytics event

### Deployment

```bash
firebase deploy --only functions
```

---

## Real-time Features

### Real-time Listeners

The app includes several real-time listening hooks:

#### 1. User Profile Listener
```typescript
import { useUserListener } from '@/hooks/useUserListener';

const { data, isLoading } = useUserListener({
  userId: currentUser.uid,
  onUpdate: (profile) => console.log('Profile updated', profile),
});
```

#### 2. Presence Tracking
```typescript
import { usePresence } from '@/hooks/usePresence';

const { presenceData, recordActivity } = usePresence(userId);
```

#### 3. Activity Feed
```typescript
import { useUserActivityFeed, useActivityLog } from '@/hooks/useActivity';

const { activities } = useUserActivityFeed(userId);
const { logActivity } = useActivityLog(userId);

// Log an activity
logActivity('follow', followedUserId, 'user');
```

#### 4. Following Activity
```typescript
import { useFollowingActivityFeed } from '@/hooks/useActivity';

const { activities } = useFollowingActivityFeed(userId, followingUserIds);
```

---

## Cloud Functions Deployment

### Example: User Profile Function

```typescript
// functions/src/users.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const saveUserProfile = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { userId, profile } = data;
  const batch = admin.firestore().batch();

  try {
    // Update user profile
    const userRef = admin.firestore().collection('users').doc(userId);
    batch.update(userRef, {
      ...profile,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await batch.commit();

    return {
      success: true,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    throw new functions.https.HttpsError(
      'internal',
      'Failed to update profile'
    );
  }
});
```

---

## Usage Examples

### Authenticate User

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { signInWithGoogle, signOut, user, userProfile } = useAuth();

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {userProfile?.name}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <button onClick={signInWithGoogle}>Sign in with Google</button>
      )}
    </div>
  );
}
```

### Upload File

```typescript
import { uploadFile } from '@/services/storageService';

async function uploadTrack(file: File) {
  const path = `tracks/${userId}/${file.name}`;
  const { downloadUrl } = await uploadFile(file, path, (progress) => {
    console.log(`Upload progress: ${progress}%`);
  });
  return downloadUrl;
}
```

### Call Cloud Function

```typescript
import { userApi } from '@/services/apiService';

async function followUser(followeeId: string) {
  const result = await userApi.followUser(currentUserId, followeeId);
  if (result.success) {
    console.log('User followed successfully');
  }
}
```

### Get Preferences

```typescript
import { getUserPreferences, updateNotificationPreferences } from '@/services/preferencesService';

async function updatePreferences() {
  const current = await getUserPreferences(userId);
  
  await updateNotificationPreferences(userId, {
    emailNotifications: false,
    pushNotifications: true,
  });
}
```

---

## Troubleshooting

### Common Issues

#### "Permission Denied" Errors

- Check Firestore security rules
- Verify user is authenticated
- Check user role for admin operations
- Ensure user ID matches document owner

#### "Quota Exceeded" Errors

- Check Firebase billing status
- Verify project has active billing
- Check for read/write spikes
- Optimize queries with indexes

#### Firestore Connection Issues

- Check browser console for errors
- Verify API keys are correct
- Check firewall/network settings
- Try clearing browser cache
- Use emulator for local development

#### Cloud Functions Not Working

- Check function logs in Firebase Console
- Verify environment variables are set
- Check function timeout settings
- Verify Firestore/Storage rules allow function access

### Enable Firestore Emulator (Local Development)

```bash
firebase emulators:start
```

Then update your Firebase config:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

---

## Best Practices

1. **Security First**: Always validate data on the server
2. **Optimize Queries**: Use indexes for complex queries
3. **Batch Operations**: Use batch writes for multiple documents
4. **Real-time Limits**: Listen only to needed data
5. **Error Handling**: Always handle errors gracefully
6. **Monitoring**: Monitor Firebase metrics in console
7. **Backups**: Regular backups of important data
8. **Testing**: Test security rules thoroughly

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Security Rules Guide](https://firebase.google.com/docs/rules)

---

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review [Firebase Documentation](https://firebase.google.com/docs)
3. Check browser console for error messages
4. Enable debug logging: `setLogLevel('debug')` in firebase.ts
5. Open an issue on the project repository
