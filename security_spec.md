# TonJam Security Specification

## Data Invariants
1. A **User** must have a unique `uid` and `username`.
2. A **Track** must belong to an artist.
3. An **NFT** must reference a valid `trackId` or `creator`.
4. **Transactions** are immutable after creation.
5. **Admin** status can only be granted by the system/admin, not the user.

## The Dirty Dozen (Attacker Payloads)

1. **Privilege Escalation**: Attempt to create a user profile with `role: "admin"`.
2. **Identity Spoofing**: Attempt to update another user's profile metadata.
3. **Ghost Artist**: Attempt to mark oneself as `isVerifiedArtist: true` without admin approval.
4. **ID Poisoning**: Attempt to create a document with an ID that is 1MB of junk characters.
5. **Orphaned Track**: Create a track for an artist that doesn't exist or isn't the caller.
6. **Double Spend (Virtual)**: Updating own `jamBalance` without a corresponding transaction record.
7. **Social Sybil**: Following a user 1,000 times by flooding the `follows` collection.
8. **Shadow Field Injection**: Injecting `isVerified: true` into an NFT document.
9. **State Shortcutting**: Updating a `songRequest` directly to `fulfilled` without being the artist.
10. **Terminal Lock Breach**: Trying to update an NFT's `price` after it's marked as `sold`.
11. **Denial of Wallet**: Infinite recursive `get()` calls via relational cycles (if any).
12. **PII Leak**: Querying the `users` collection to scrape email addresses.

## Test Runner (Draft)
A `firestore.rules.test.ts` will be created using the Firebase Emulators for verification.
