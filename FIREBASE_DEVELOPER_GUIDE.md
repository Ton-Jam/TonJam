# Firebase Integration - Developer Guide

## For TonJam Development Team

### Pre-Development Checklist

- [ ] Firebase project created at `firebase.google.com`
- [ ] Google Cloud Console project linked
- [ ] Firestore database enabled
- [ ] Cloud Storage bucket created
- [ ] Authentication providers enabled:
  - [ ] Email/Password
  - [ ] Google OAuth
  - [ ] Anonymous (for wallet users)
- [ ] Service account key downloaded and stored safely
- [ ] Environment variables configured in `.env`
- [ ] All team members have Firebase console access

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         React Components                 │
│  (ProfileEditor, UploadAvatar, etc)     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Custom Hooks                     │
│  (useUserListener, usePresence, etc)    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Service Layer                    │
│  (apiService, preferencesService, etc)  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Firebase SDKs                    │
│  (Firestore, Storage, Auth, Functions)  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Firebase Backend                 │
│  (Database, Storage, Cloud Functions)   │
└─────────────────────────────────────────┘
```

---

## Key Concepts

### 1. Real-time Listeners
Real-time listeners automatically update component state when Firestore data changes.

```typescript
// ✅ Good: Automatic sync with database
useUserListener({ userId, onUpdate: setProfile });

// ❌ Avoid: Manual polling is outdated
useEffect(() => {
  const interval = setInterval(() => fetchProfile(), 5000);
}, []);
```

**When to use**:
- User profiles that update frequently
- Activity feeds
- Presence tracking
- Any data that should sync in real-time

**When NOT to use**:
- Large datasets (1000+ documents)
- Historical data (analytics, logs)
- One-time operations

### 2. Cloud Functions vs Direct SDK Calls

**Cloud Functions** (Preferred for complex operations):
```typescript
const result = await userApi.followUser(currentUserId, targetUserId);
// Server-side validation, atomic operations, audit logs
```

**Direct SDK** (For simple CRUD):
```typescript
await updateUserProfile(userId, { bio: 'New bio' });
// Direct write, fewer network round trips
```

### 3. Security Rules as Gatekeepers
Never trust client-side checks; Firestore rules enforce permissions.

```typescript
// Client-side check (not enough!)
if (user.isAdmin) {
  // But Firestore rules will block anyway if user isn't admin
  await deleteUser(targetUserId);
}
```

---

## Common Development Patterns

### Pattern 1: Listen and Display Profile
```typescript
import { useUserListener } from '@/hooks/useUserListener';
import { useAuth } from '@/context/AuthContext';

function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  
  // Real-time listener automatically updates state
  useUserListener({
    userId: user.uid,
    onUpdate: setProfile,
  });
  
  if (!profile) return <Loader />;
  
  return <div>{profile.name}</div>;
}
```

### Pattern 2: Form with Server Sync
```typescript
import { ProfileEditor } from '@/components/ProfileEditor';

function EditProfile() {
  return (
    <ProfileEditor 
      userId={userId}
      onSaveComplete={(profile) => {
        toast.success('Profile updated');
      }}
      onError={(error) => {
        toast.error(error);
      }}
    />
  );
}
```

### Pattern 3: Activity Feed
```typescript
import { useUserActivityFeed } from '@/hooks/useActivity';

function ActivityFeed() {
  const { activities, isLoading } = useUserActivityFeed(userId, 20);
  
  return (
    <div>
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
      {isLoading && <Skeleton />}
    </div>
  );
}
```

### Pattern 4: Presence Tracking
```typescript
import { usePresence } from '@/hooks/usePresence';

function UserStatus() {
  const { presenceData, recordActivity } = usePresence(userId);
  
  const handleAction = async () => {
    // Record action and update presence
    await recordActivity('played_track', { trackId: '123' });
  };
  
  return (
    <div>
      Status: {presenceData?.isOnline ? 'Online' : 'Offline'}
    </div>
  );
}
```

### Pattern 5: Settings Management
```typescript
import { getUserPreferences, updateNotificationPreferences } from '@/services/preferencesService';

function NotificationSettings() {
  const [prefs, setPrefs] = useState(null);
  
  useEffect(() => {
    getUserPreferences(userId).then(setPrefs);
  }, []);
  
  const toggleEmail = async () => {
    const newValue = !prefs.notifications.emailNotifications;
    await updateNotificationPreferences(userId, {
      emailNotifications: newValue,
    });
    setPrefs(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        emailNotifications: newValue,
      }
    }));
  };
  
  return (
    <Toggle 
      checked={prefs?.notifications.emailNotifications}
      onChange={toggleEmail}
    />
  );
}
```

---

## Data Flow Examples

### Example 1: User Follows Another User
```
User clicks "Follow" button
       ↓
frontend: trackUserAction('follow', targetUserId)
       ↓
backend: Cloud Function processes follow
       ↓
Firestore updates follow relationship
       ↓
Real-time listener detects change
       ↓
UI updates with new follower count
```

### Example 2: Upload Profile Picture
```
User selects image file
       ↓
<UploadAvatar /> validates and previews
       ↓
uploadFile() uploads to Cloud Storage
       ↓
updateUserProfile() updates avatar URL
       ↓
useUserListener() detects profile change
       ↓
Avatar displayed throughout app
```

### Example 3: Track Analytics Event
```
User performs action (play track, like NFT, etc)
       ↓
trackEvent() or trackPurchase()
       ↓
Event written to analytics collection
       ↓
Batch process aggregates data (nightly)
       ↓
Analytics dashboard displays metrics
```

---

## Testing Strategies

### 1. Unit Test: Preference Updates
```typescript
import { updateNotificationPreferences } from '@/services/preferencesService';

test('should update notification preferences', async () => {
  const userId = 'test-user-123';
  await updateNotificationPreferences(userId, {
    emailNotifications: false,
  });
  
  const prefs = await getUserPreferences(userId);
  expect(prefs.notifications.emailNotifications).toBe(false);
});
```

### 2. Integration Test: Real-time Updates
```typescript
test('should sync profile updates in real-time', async () => {
  const { result, waitForNextUpdate } = renderHook(() =>
    useUserListener({ userId })
  );
  
  // Initial state is null
  expect(result.current).toBeNull();
  
  // Update in Firestore
  await updateUserProfile(userId, { name: 'New Name' });
  
  // Hook should update
  await waitForNextUpdate();
  expect(result.current.name).toBe('New Name');
});
```

### 3. E2E Test: Upload Avatar
```typescript
test('user can upload and see avatar', async () => {
  // Navigate to profile page
  await page.goto('/profile');
  
  // Upload file
  await page.setInputFiles('input[type="file"]', 'avatar.jpg');
  
  // Wait for upload and check display
  await page.waitForSelector('img[src*="avatar"]');
  const avatarSrc = await page.getAttribute('img', 'src');
  expect(avatarSrc).toContain('firebasestorage');
});
```

---

## Performance Optimization

### 1. Lazy Load Activities
```typescript
// Only load when user scrolls to activities section
const [showActivities, setShowActivities] = useState(false);
const { activities } = useUserActivityFeed(userId, showActivities ? 50 : 0);
```

### 2. Pagination for Large Lists
```typescript
const [page, setPage] = useState(0);
const ITEMS_PER_PAGE = 20;

const { activities } = useUserActivityFeed(
  userId,
  ITEMS_PER_PAGE * (page + 1)
);
```

### 3. Debounce Preference Updates
```typescript
import { useDebounce } from '@/hooks/use-debounce';

const [theme, setTheme] = useState('light');
const debouncedTheme = useDebounce(theme, 1000);

useEffect(() => {
  updateThemePreferences(userId, { theme: debouncedTheme });
}, [debouncedTheme]);
```

### 4. Memoize Expensive Computations
```typescript
const totalEarnings = useMemo(() => {
  return activities
    .filter(a => a.type.includes('earnings'))
    .reduce((sum, a) => sum + a.value, 0);
}, [activities]);
```

---

## Error Handling Best Practices

### 1. Graceful Degradation
```typescript
// If real-time listener fails, fall back to one-time fetch
useUserListener({
  userId,
  onUpdate: setProfile,
  onError: async (error) => {
    console.warn('Real-time failed, fetching once:', error);
    const profile = await getUserProfile(userId);
    setProfile(profile);
  }
});
```

### 2. User-Friendly Error Messages
```typescript
const handleUpload = async (file) => {
  try {
    await uploadFile(file, path);
  } catch (error) {
    if (error.code === 'storage/quota-exceeded') {
      setError('Storage quota exceeded. Contact support.');
    } else if (error.code === 'storage/invalid-argument') {
      setError('Invalid file type or size.');
    } else {
      setError('Upload failed. Please try again.');
    }
  }
};
```

### 3. Retry Logic for Transient Failures
```typescript
const retryWithBackoff = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};
```

---

## Debugging Tips

### Enable Firebase Debug Logging
```typescript
import { setLogLevel } from 'firebase/firestore';
setLogLevel('debug');
```

### Monitor Real-time Listener Updates
```typescript
useUserListener({
  userId,
  onUpdate: (profile) => {
    console.log('[v0] Profile updated:', profile);
    setProfile(profile);
  },
});
```

### Check Firebase Console
- **Firestore**: See document changes in real-time
- **Storage**: Monitor file uploads
- **Authentication**: View login attempts
- **Usage & Billing**: Track API calls

### Use Browser DevTools
```javascript
// In console, check current user
firebase.auth().currentUser

// Check Firestore connection
firebase.firestore().enableNetwork().then(() => console.log('Connected'))
```

---

## Security Reminders

1. **Never expose sensitive credentials** in client code
2. **Always validate on server** (don't trust client-side checks)
3. **Use Firestore rules** as primary security layer
4. **Sanitize user input** before storing
5. **Implement rate limiting** for expensive operations
6. **Log security events** (admin actions, failed auth)
7. **Regularly audit** Firestore rules

---

## Deployment Checklist

### Before Deploying to Production

- [ ] All environment variables configured
- [ ] Firestore security rules in production mode (not test mode)
- [ ] Storage rules deployed and tested
- [ ] Cloud Functions deployed
- [ ] Analytics collection enabled
- [ ] Backups configured
- [ ] Error monitoring setup (Sentry, etc)
- [ ] Load testing completed
- [ ] Security review passed
- [ ] User data privacy compliant (GDPR, etc)

### Post-Deployment Monitoring

- [ ] Monitor Firestore quota usage
- [ ] Check error logs daily
- [ ] Monitor response times
- [ ] Track user engagement metrics
- [ ] Review security logs weekly
- [ ] Update documentation
- [ ] Plan capacity for growth

---

## Useful Commands

```bash
# Deploy security rules
firebase deploy --only firestore:rules storage

# Deploy Cloud Functions
firebase deploy --only functions

# View function logs
firebase functions:log

# Start local emulator
firebase emulators:start

# Backup Firestore
gcloud firestore export gs://bucket-name/backup-folder

# Monitor live usage
watch 'gcloud firestore stats'
```

---

## Team Communication

### When Adding New Features
1. Document the Firestore schema changes
2. Update security rules
3. Create PR with updated rules
4. Test with different user roles
5. Update this guide with new patterns

### When Fixing Bugs
1. Check if it's a Firestore rules issue
2. Check if real-time listener is unsubscribing properly
3. Check Cloud Functions logs
4. Enable debug logging to trace issue
5. Document solution in this guide

### When Optimizing Performance
1. Check Firestore query costs
2. Review listener usage
3. Consider caching strategies
4. Monitor Cloud Storage bandwidth
5. Document optimizations

---

## Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firestore Best Practices**: https://firebase.google.com/docs/firestore/best-practices
- **Security Rules Guide**: https://firebase.google.com/docs/rules
- **Cloud Functions**: https://firebase.google.com/docs/functions
- **Project Setup**: `docs/firebase-setup.md`
- **Quick Start**: `FIREBASE_QUICK_START.md`
- **Implementation Summary**: `FIREBASE_INTEGRATION_SUMMARY.md`

---

## Questions or Issues?

1. Check the documentation files in order:
   - Quick Start (`FIREBASE_QUICK_START.md`)
   - Developer Guide (this file)
   - Full Setup (`docs/firebase-setup.md`)
   - Implementation Summary (`FIREBASE_INTEGRATION_SUMMARY.md`)

2. Enable debug logging and check console
3. Review Firebase Console monitoring
4. Check Cloud Functions logs
5. Ask team for help

---

**Last Updated**: May 2026
**Maintained by**: TonJam Development Team
