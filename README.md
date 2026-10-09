

# 🎵 TonJam

### Own Afrobeats Forever on TON Blockchain.

TonJam is a Web3 music streaming platform and Music NFT marketplace built to connect artists, music lovers, and digital collectors through the TON blockchain ecosystem.

Our mission is to empower artists, transform music discovery, and explore new opportunities for digital music ownership.

🌐 **Website:** https://ton-jam.vercel.app/
💻 **GitHub:** https://github.com/Ton-Jam/TonJam
📧 **Email:** info.tonjam@gmail.com

---

## 🚀 About TonJam

The music industry is evolving, and artists deserve more opportunities to share their work, reach audiences, and build sustainable careers.

TonJam combines music streaming, social discovery, and blockchain technology to create a music-focused digital ecosystem.

With TonJam, users can discover music, connect with artists, explore music NFTs, and participate in a growing community built around music and Web3.

### 🎯 Our Mission

- 🎤 Empower artists with new digital distribution and monetization opportunities.
- 🎧 Make music discovery accessible and engaging.
- 🌍 Connect African music culture with a global audience.
- 🪙 Explore blockchain-powered music ownership.
- 🤝 Build stronger connections between artists and fans.
- 🚀 Contribute to the growth of the TON ecosystem.

---

## ✨ Features

### 🎧 Music Streaming

Discover and enjoy music through the TonJam platform.

Features include:

- Music discovery and browsing.
- Track artwork and artist information.
- Audio playback controls.
- Mini-player and full-player experiences.
- Playback navigation and seeking.
- Music libraries and playlists.
- Recently played music and listening history, where supported.

### 🪙 Music NFT Marketplace

Explore digital music collectibles and blockchain-powered ownership.

Marketplace functionality is designed to support:

- Music NFT discovery.
- NFT detail pages.
- Digital music collectibles.
- Artist and collection discovery.
- NFT ownership information.
- Buying and selling workflows, where implemented.
- Future expansion into auctions, bidding, and peer-to-peer trading.

Blockchain ownership and transactions must be verified against the relevant smart contracts and network.

### 🎤 Artist Dashboard

TonJam is designed to give artists tools to manage their presence on the platform.

Artist functionality includes:

- Artist profiles.
- Music upload interfaces.
- Track and album management.
- Music NFT creation workflows.
- Artist analytics.
- Artist verification.
- Artist portfolio management.

Feature availability depends on the current implementation and account permissions.

### ☑️ Artist Verification

TonJam includes an artist verification workflow designed to help establish artist authenticity.

The workflow supports:

- Artist verification requests.
- Portfolio and social links.
- Verification status tracking.
- Administrative review.
- Approval and rejection workflows.
- Review feedback and status updates.

Verification permissions should be enforced through trusted backend authorization and Firestore Security Rules.

### 🌐 JamSpace

JamSpace is TonJam's social experience for music lovers and creators.

Community functionality includes:

- Creating posts.
- Following users.
- Liking and commenting.
- Sharing and reposting.
- Discovering artists and community content.
- Reporting inappropriate content.

Individual features depend on the current application implementation and user permissions.

### 👛 TON Wallet Integration

TonJam integrates with the TON ecosystem through TON Connect.

Wallet functionality is designed to support:

- Connecting compatible TON wallets.
- Displaying wallet information.
- Accessing blockchain-related features.
- Interacting with supported NFT workflows.
- Exploring future blockchain-powered music experiences.

**Network safety:** Development and testing should use TON Testnet. Mainnet transactions should only be enabled after the network configuration, smart contracts, and transaction flows have been verified.

Connecting a wallet does not, by itself, verify blockchain ownership.

### 🎁 Earn TJ

TonJam includes an Earn TJ experience designed around user engagement and rewards.

The feature is intended to support task-based participation and future rewards functionality.

Points, displayed balances, and rewards should not be considered transferable blockchain tokens unless their on-chain issuance and transferability have been implemented and verified.

### 🔔 Notifications and User Profiles

Additional platform functionality includes:

- User profiles.
- Artist profiles.
- Notifications.
- Wallet screens.
- Settings.
- Music libraries.
- NFT collections.
- Search and discovery.

---

## 🛠️ Technology Stack

TonJam uses a modern web development stack.

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Development server and production builds |
| Tailwind CSS | Styling and responsive layouts |
| Firebase Authentication | User authentication |
| Cloud Firestore | Application database |
| Firebase Storage | File and media storage |
| TON Connect | TON wallet connectivity |
| TON Blockchain | Blockchain ecosystem integration |
| Vercel | Web application deployment |

Additional libraries may support routing, audio playback, state management, testing, and UI components.

Refer to `package.json` for the current dependency list.

---

## 🏗️ Project Structure

The project follows a component-based React architecture.

```text
TonJam/
├── public/
│   ├── tonconnect-manifest.json
│   └── ...
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── router/
│   ├── lib/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md