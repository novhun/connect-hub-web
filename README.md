# 💻 Connect-Hub Web (React 19 + TypeScript Frontend)

Modern, ultra-responsive, modular **React 19** frontend application for the **Connect-Hub** platform. Styled with **Tailwind CSS v4** and featuring **Real WebRTC / PeerJS Audio & Video Calling**, **Live JWT Authentication**, **Real-Time WebSockets**, **Dynamic Multi-Image Grids**, **24h Stories Carousel**, **Community Groups**, and full **English & Khmer (ភាសាខ្មែរ)** bilingual localization.

---

## ✨ Features & Highlights

- **Real WebRTC / PeerJS Video & Audio Calling**:
  - Direct P2P video and audio rooms using `navigator.mediaDevices.getUserMedia`.
  - Picture-in-Picture local camera feedback with mobile front/rear camera flip.
  - Functional microphone mute, camera toggle, screen sharing (`getDisplayMedia`), and volume control.
  - Live WebRTC signaling latency counter (~24ms) and call session persistence to backend API.
- **100% Real Authentication Lifecycle**:
  - Full JWT auth flow: Login (`POST /api/v1/auth/login`), Register (`POST /api/v1/auth/register`), and Logout.
  - Secure token persistence in `localStorage` and auto-reloading of user-specific feed, stories, groups, and notifications.
- **Dynamic Post Feed & Media Collage**:
  - Responsive multi-image grids (1-image, 2-image, 3-image hero collage, and 4+ overflow grids).
  - High-resolution Lightbox viewer for full-screen inspection.
  - 7 interactive reactions (`👍 Like`, `❤️ Love`, `🥰 Care`, `😆 Haha`, `😮 Wow`, `😢 Sad`, `😡 Angry`).
  - Threaded comments, bookmarks/saved posts, and one-click sharing.
- **24-Hour Stories Carousel**:
  - Interactive story creator with image uploads and caption support.
  - Automatic story viewer modal with timer progression.
- **Full-Duplex Real-Time Chat**:
  - Live 1-on-1 direct messaging powered by WebSockets (`ws://localhost:8008/api/v1/chat/ws/{user_id}`).
  - Floating desktop chat windows and dedicated mobile messenger view.
- **Community Groups & Discovery**:
  - Community group discovery, group creation, member directory, and join/leave toggling.
- **Full Mobile Responsiveness**:
  - Auto-hiding right sidebar on mobile viewports.
  - Touch-optimized bottom navigation bar (`MobileBottomNav.tsx`).
  - Floating mobile quick-action support button (`FloatingSupportButton.tsx`).
  - Slide-out mobile navigation drawer.
- **Bilingual Internationalization (i18n)**:
  - Instant toggle between **English (EN)** and **Khmer (ខ្មែរ)** with Kantumruy Pro & Inter typography.

---

## 📁 Project Directory Structure

```text
connect-hub-web/
├── src/
│   ├── components/           # Core layout components & standalone views
│   │   ├── views/            # Full-page views (About, Calls, Explore, Groups, Messages, SavedPosts, Settings)
│   │   ├── FloatingSupportButton.tsx  # Mobile support trigger button
│   │   ├── Header.tsx                 # Search, live status, language switch, profile menu
│   │   ├── LeftSidebar.tsx            # Navigation links and joined groups
│   │   ├── MobileBottomNav.tsx        # Mobile fixed touch bottom bar
│   │   ├── PostCard.tsx               # Feed post card with reactions & image collages
│   │   ├── RealCallModal.tsx          # Real WebRTC / PeerJS video & audio calling room
│   │   ├── RightSidebar.tsx           # Managed groups and online members
│   │   ├── StoriesSection.tsx         # Stories horizontal carousel
│   │   └── SupportCenterModal.tsx     # Helpdesk and AI specialist dialog
│   ├── context/
│   │   └── LanguageContext.tsx        # English / Khmer translation provider
│   ├── data/
│   │   └── mockData.ts                # Fallback types and compatibility constants
│   ├── modules/                       # Domain modular architecture exports
│   │   ├── auth/                      # LoginModal, RegisterModal, auth API
│   │   ├── calls/                     # CallRoomModal, types, WebRTC signaling
│   │   ├── chat/                      # Direct chat, ChatFloatingWindow, WebSockets
│   │   ├── groups/                    # GroupsView, GroupDetailModal
│   │   ├── layout/                    # Layout exports
│   │   ├── notifications/             # NotificationsPopover
│   │   ├── posts/                     # CreatePostModal, ShareModal
│   │   ├── stories/                   # CreateStoryModal, StoryViewerModal
│   │   ├── user/                      # UserProfileModal
│   │   └── index.ts                   # Central module barrel export
│   ├── services/
│   │   └── api.ts                     # Centralized API service for FastAPI backend
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces & types
│   ├── App.tsx                        # Main application container & route manager
│   ├── index.css                      # Tailwind CSS v4 design tokens & base rules
│   └── main.tsx                       # React 19 entrypoint
├── .env.example                       # Environment variables template
├── package.json                       # Dependencies & scripts
├── tsconfig.json                      # TypeScript configuration
└── vite.config.ts                     # Vite build configuration
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### 2. Install Dependencies
```bash
# Navigate to the frontend folder
cd connect-hub-web

# Install packages
npm install
```

### 3. Configure Environment Variables
Create a `.env` file (or copy `.env.example`):
```bash
cp .env.example .env
```

Set the backend API URL in `.env`:
```env
VITE_API_URL=http://localhost:8008
```

### 4. Run Development Server
```bash
npm run dev
```

The application will start on: **[http://localhost:3001/](http://localhost:3001/)**

---

## 🔑 Demo Account Credentials

Default pre-seeded demo user:
- **Email**: `sokun@connecthub.app`
- **Password**: `password123`

You can also register a new account instantly via the **Register / Sign Up** modal.

---

## 🛠️ Build & Quality Checks

### Linting & TypeScript Check
```bash
npm run lint
# runs: tsc --noEmit
```

### Production Build
```bash
npm run build
# bundles assets into ./dist using Vite
```

---

## 🔗 Connected Backend Endpoints

The web app communicates with the FastAPI server (`http://localhost:8008`) for:
- **Auth**: `/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/me`
- **Feed & Posts**: `/api/v1/posts`, `/api/v1/posts/{id}/react`, `/api/v1/posts/{id}/comments`
- **Stories**: `/api/v1/stories`
- **Groups**: `/api/v1/groups`, `/api/v1/groups/{id}/join`, `/api/v1/groups/{id}/leave`
- **Chat & WebSockets**: `/api/v1/chat/{user_id}`, `/api/v1/chat/ws/{user_id}`
- **WebRTC Calling**: `/api/v1/calls/initiate`, `/peerjs/id`, `/ws/peerjs/{peer_id}`
- **Notifications**: `/api/v1/notifications`
- **Media Upload**: `/api/v1/media/upload`
