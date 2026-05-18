# Firebase Integration - Quick Start Guide

## Fastest Way to Get Started

### 1. Environment Setup (5 minutes)
```bash
# Copy environment template
cp .env.example .env

# Fill in your Firebase credentials in .env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Deploy Security Rules (2 minutes)
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### 3. Use in Components (Examples)

#### Listen to User Profile in Real-time
```typescript
import { useUserListener } from '@/hooks/useUserListener';

function ProfileComponent() {
  const [profile, setProfile] = useState(null);
  
  useUserListener({
    userId: currentUser.uid,
    onUpdate: setProfile,
  });
  
  return <div>{profile?.name}</div>;
}
```

#### Upload User Avatar
```typescript
import { UploadAvatar } from '@/components/UploadAvatar';

<UploadAvatar
  currentAvatar={user.avatar}
  onUploadComplete={(url) => {
    updateUserProfile(userId, { avatar: url });
  }}
/>
```

#### Edit User Profile
```typescript
import { ProfileEditor } from '@/components/ProfileEditor';

<ProfileEditor userId={currentUser.uid} />
```

#### Track User Activity
```typescript
import { useActivityLog } from '@/hooks/useActivity';

const { logActivity } = useActivityLog(userId);

// Log when user follows someone
await logActivity('follow', targetUserId, 'user');

// Get activity feed
const { activities } = useUserActivityFeed(userId);
```

#### Track Analytics Event
```typescript
import { trackEvent, trackPurchase } from '@/services/analyticsService';

// Custom event
await trackEvent(userId, 'button_click', {
  category: 'engagement',
  label: 'subscribe_button'
});

// Purchase event
await trackPurchase(userId, 'nft', 99.99, 'USD');
```

#### Get/Update User Preferences
```typescript
import { 
  getUserPreferences, 
  updateNotificationPreferences 
} from '@/services/preferencesService';

const prefs = await getUserPreferences(userId);
console.log(prefs.notifications.emailNotifications);

// Update preferences
await updateNotificationPreferences(userId, {
  emailNotifications: false,
  pushNotifications: true,
});
```

#### Track User Presence
```typescript
import { usePresence } from '@/hooks/usePresence';

const { presenceData, recordActivity } = usePresence(userId);

// Record that user performed an action
await recordActivity('viewed_track', { trackId: '123' });

// Check if user is online
console.log(presenceData?.isOnline);
```

#### Call Cloud Function
```typescript
import { userApi } from '@/services/apiService';

// Follow a user
const result = await userApi.followUser(currentUserId, targetUserId);

// Update preferences via Cloud Function
const result = await userApi.updateUserPreferences(userId, {
  theme: 'dark',
});

// Batch update stats
await userApi.updateUserStats(userId, {
  followers: 150,
  earnings: 1000,
});
```

---

## Common Tasks

### Task: Upload and Display User Avatar
```typescript
const [avatarUrl, setAvatarUrl] = useState(user.avatar);

<UploadAvatar
  currentAvatar={avatarUrl}
  onUploadComplete={async (url) => {
    setAvatarUrl(url);
    await updateUserProfile(userId, { avatar: url });
  }}
/>

<img src={avatarUrl} alt="User avatar" className="w-24 h-24 rounded-full" />
```

### Task: Show User Online Status
```typescript
const { presenceMap } = useMultiplePresence([userId1, userId2, userId3]);

{presenceMap[userId1]?.isOnline ? (
  <span className="text-green-500">Online</span>
) : (
  <span className="text-gray-500">Offline</span>
)}
```

### Task: Display Activity Feed
```typescript
import { useUserActivityFeed } from '@/hooks/useActivity';

function ActivityFeed({ userId }) {
  const { activities, isLoading } = useUserActivityFeed(userId, 20);
  
  return (
    <div>
      {activities.map(activity => (
        <div key={activity.id}>
          <p>{formatActivityDescription(activity)}</p>
          <time>{new Date(activity.timestamp).toLocaleString()}</time>
        </div>
      ))}
    </div>
  );
}
```

### Task: Show Follower Activities
```typescript
import { useFollowingActivityFeed } from '@/hooks/useActivity';

function FollowingFeed({ userId, followingUserIds }) {
  const { activities } = useFollowingActivityFeed(userId, followingUserIds);
  
  return activities.map(a => (
    <ActivityItem key={a.id} activity={a} />
  ));
}
```

### Task: Settings Page with Preferences
```typescript
import { getUserPreferences, updateNotificationPreferences } from '@/services/preferencesService';

function SettingsPage() {
  const [prefs, setPrefs] = useState(null);
  
  useEffect(() => {
    getUserPreferences(userId).then(setPrefs);
  }, [userId]);
  
  const handleToggleEmail = async (value) => {
    await updateNotificationPreferences(userId, {
      emailNotifications: value
    });
    setPrefs(prev => ({
      ...prev,
      notifications: { ...prev.notifications, emailNotifications: value }
    }));
  };
  
  return (
    <label>
      <input 
        type="checkbox" 
        checked={prefs?.notifications.emailNotifications}
        onChange={(e) => handleToggleEmail(e.target.checked)}
      />
      Email Notifications
    </label>
  );
}
```

### Task: Track Custom Analytics Events
```typescript
import { trackEvent } from '@/services/analyticsService';

async function handleTrackPlay(trackId) {
  await trackEvent(userId, 'track_played', {
    category: 'music',
    label: trackId,
    value: 1,
    metadata: { timestamp: Date.now() }
  });
}
```

---

## File Structure Reference

```
src/
├── hooks/
│   ├── useUserListener.ts      # Profile & activity listeners
│   ├── usePresence.ts          # Presence tracking
│   └── useActivity.ts          # Activity logging & feeds
├── services/
│   ├── apiService.ts           # Cloud Functions API
│   ├── userService.ts          # User profile CRUD
│   ├── preferencesService.ts   # User settings
│   ├── analyticsService.ts     # Event tracking
│   └── storageService.ts       # File uploads
├── components/
│   ├── UploadAvatar.tsx        # Avatar upload component
│   ├── ProfileEditor.tsx       # Full profile editor
│   └── ...existing components...
└── lib/
    └── firebase.ts             # Firebase initialization

/
├── firestore.rules             # Firestore security rules
├── storage.rules               # Cloud Storage security rules
├── docs/firebase-setup.md      # Detailed setup guide
└── .env.example                # Environment template
```

---

## Deployment Checklist

- [ ] Firebase credentials in `.env`
- [ ] Firestore database created
- [ ] Cloud Storage bucket created
- [ ] Auth methods enabled (Google, Email)
- [ ] Run `firebase deploy --only firestore:rules`
- [ ] Run `firebase deploy --only storage`
- [ ] Cloud Functions deployed (when ready)
- [ ] Tested in local development
- [ ] Deploy to production

---

## Important Notes

1. **Real-time Listeners**: Always clean up subscriptions (hooks do this automatically)
2. **File Uploads**: Keep within size limits (5MB avatars, 100MB audio)
3. **Security Rules**: Never bypass rules, they protect user data
4. **Cloud Functions**: Implement validation on the server side
5. **Analytics**: Don't track sensitive user data

---

## Debugging

### Check Real-time Connection
```typescript
import { setLogLevel } from 'firebase/firestore';
setLogLevel('debug');  // Enable debug logging
```

### Verify Auth Status
```typescript
import { useAuth } from '@/context/AuthContext';

const { user, userProfile, loading } = useAuth();
console.log('User:', user?.uid);
console.log('Profile:', userProfile);
```

### Monitor Firestore Writes
- Go to Firebase Console → Firestore → Monitoring
- Check "Bytes written" and "Bytes read" for quota usage

### Test Storage Upload
```typescript
import { uploadFile } from '@/services/storageService';

const { downloadUrl } = await uploadFile(
  file,
  `test/${Date.now()}.txt`
);
console.log('Upload successful:', downloadUrl);
```

---

## Links

- Full Setup Guide: `docs/firebase-setup.md`
- Implementation Summary: `FIREBASE_INTEGRATION_SUMMARY.md`
- Firebase Docs: https://firebase.google.com/docs
- Firestore Best Practices: https://firebase.google.com/docs/firestore/best-practices

---

**Tip**: Start with the example code snippets above and customize for your needs. The security rules and real-time listeners are already configured and production-ready.
