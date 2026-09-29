# NexusHunt 🔐

> **Cryptographic campus treasure hunt PWA** — Zairzest 6.0 by Zairza

A production-ready Progressive Web Application for large-scale university tech treasure hunts. Features a **Matrix/terminal hacker aesthetic** with black & neon green design.

---

## ⚡ Quick Start

### 1. Install Dependencies

First, make sure you're connected to the internet, then:

```bash
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore** and **Authentication** (Email/Password)
3. Copy `.env.local.example` → `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

### 3. Set Up Firestore Security Rules

In Firebase Console → Firestore → Rules, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin has full access (authenticated via Firebase Auth)
    match /{document=**} {
      allow read, write: if request.auth != null && request.auth.token.email != null;
    }
    // Teams can read their own mission pack
    match /missionPacks/{teamId} {
      allow read: if true; // Team auth is app-level (PIN-based)
    }
    // Teams can read checkpoints
    match /checkpoints/{cpId} {
      allow read: if true;
    }
    // Teams can read their own team doc
    match /teams/{teamId} {
      allow read: if true;
    }
    // Teams can write completion events
    match /completionEvents/{evId} {
      allow create: if true;
    }
  }
}
```

### 4. Create Admin Account

In Firebase Console → Authentication → Users → Add User, create your admin email/password account.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── layout.jsx              # Root layout — NavBar + NetworkStatusBar
│   ├── page.jsx                # Redirects to /player
│   ├── globals.css             # Black & neon green design system
│   ├── player/
│   │   └── page.jsx            # Player login + game state machine
│   └── admin/
│       ├── page.jsx            # Admin login (Firebase Auth)
│       └── dashboard/
│           ├── layout.jsx      # Sidebar + auth guard
│           ├── page.jsx        # Overview stats
│           ├── checkpoints/    # Checkpoint CRUD
│           ├── register/       # Team registration
│           ├── radar/          # Live campus radar
│           └── qr-generator/   # QR code printer
├── components/
│   ├── layout/                 # NavBar, NetworkStatusBar
│   ├── player/                 # LoginForm, GameStateMachine, 5 states, QRScanner
│   └── admin/                  # CheckpointManager, CheckpointForm, TeamReg, CampusRadar, QRGen
├── lib/
│   ├── crypto.js               # SHA-256 + AES-256-GCM (Web Crypto API)
│   ├── db.js                   # Dexie.js IndexedDB (offline queue + cache)
│   ├── firebase.js             # Firestore + Auth helpers
│   └── routing.js              # Latin Square route assignment
└── hooks/
    ├── useGameState.js         # 6-state game machine
    ├── useNetworkStatus.js     # Online/offline + manual override
    ├── useOfflineSync.js       # Auto-flush Dexie → Firestore
    └── useCheckpoints.js       # Real-time checkpoint list
```

---

## 🎮 How It Works

### Admin Flow
1. Login at `/admin` with Firebase email/password
2. **Create checkpoints** at `/admin/dashboard/checkpoints` — each gets a riddle, hints, answer (SHA-256 hashed), and auto-generated secret token
3. **Register teams** at `/admin/dashboard/register` — auto-assigns Latin Square routes and encrypts mission packs
4. **Print QR codes** at `/admin/dashboard/qr-generator`
5. **Monitor** at `/admin/dashboard/radar` — live real-time grid

### Player Flow
1. Login at `/player` with Team Name + 4-digit PIN
2. Mission pack cached in IndexedDB (Dexie)
3. **Scan QR** at each checkpoint → riddle revealed
4. **Submit answer** → SHA-256 verified, next riddle AES-256-GCM decrypted
5. Works fully **offline** — completion events queue in Dexie, sync when back online

---

## 🔐 Security Design

| Feature | Implementation |
|---------|---------------|
| Answer storage | SHA-256 hash only — plaintext never stored |
| Riddle encryption | AES-256-GCM via Web Crypto API (PBKDF2 key derivation) |
| Team auth | Firestore PIN hash lookup (no Firebase Auth for players) |
| Admin auth | Firebase Authentication (email/password) |
| Offline | Dexie.js IndexedDB queue, auto-sync on reconnect |

---

## 📱 PWA Installation

On Android/Chrome: "Add to Home Screen" prompt appears automatically.
On iOS Safari: Share → Add to Home Screen.

---

## 🏗 Build for Production

```bash
npm run build
npm run start
```

PWA service worker and manifest are automatically generated in `public/`.

---

## 🧪 Verification Checklist

- [ ] `npm run build` — zero errors
- [ ] Admin login works
- [ ] Create 5+ checkpoints in dashboard
- [ ] Register 5 teams — each starts at different checkpoint (Latin Square)
- [ ] Player login fetches mission pack, caches in IndexedDB
- [ ] QR scan + correct answer → padlock animation, next state
- [ ] Wrong QR → error banner with shake
- [ ] Offline toggle → complete station → events queue in Dexie
- [ ] Online toggle → Dexie auto-flushes to Firestore
- [ ] Radar grid updates in real time
- [ ] QR codes render and download correctly
- [ ] PWA installs on mobile

---

*Built for Zairza — Zairzest 6.0*
