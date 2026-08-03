# Syncvas

Syncvas is a real-time collaborative whiteboard built for students and software
developers to design high-level diagrams and sketches together on a shared canvas —
draw, discuss, and iterate live, with everyone seeing the same board update in
real time.

🔗 **Live demo:** [syncvas-eight.vercel.app](https://syncvas-eight.vercel.app/)

## Features

- **Freeform canvas drawing** — shapes (rectangle, circle, diamond), lines/arrows,
  freehand strokes, and text boxes, with customizable fill styles, stroke styles,
  and a hand-drawn "sketchy" look
- **Real-time collaboration** — every stroke, shape, and edit syncs instantly
  across all participants via WebSockets
- **Multi-cursor presence** — see exactly where everyone else is working, live
- **Built-in video & audio chat** — peer-to-peer WebRTC conferencing right inside
  the room, with per-user mute/camera controls
- **Room-based access** — create or join boards with room codes
- **In-room chat** — text chat alongside the whiteboard for quick coordination
- **Persistent boards** — save, reload, and manage your boards from a dashboard
- **Element controls** — resize, rotate, and layer (bring-to-front/send-to-back)
  any element on the canvas

## Tech Stack

| Layer          | Tech                              |
|----------------|------------------------------------|
| Frontend       | React, TypeScript, Vite            |
| Backend        | Express.js, TypeScript             |
| Database       | MongoDB                            |
| Real-time sync | Socket.IO                          |
| Video/Audio    | WebRTC (P2P)                       |
| Auth           | JWT                                |
| Media storage  | Cloudinary                         |

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- A MongoDB instance (local or Atlas)
- A Cloudinary account (for image uploads)

### Clone the repo

```bash
git clone https://github.com/THEJAS-BK/syncvas.git
cd syncvas
```

### Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:

```dotenv
VITE_BASE_URL="http://localhost:8080"
VITE_SOCKET_URL="http://localhost:8080"
```

Run the frontend:

```bash
npm run dev
```

### Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```dotenv
# Server
PORT=8080

# CORS - frontend origin
ORIGIN=http://localhost:5173

# MongoDB
MONGODB_URL=your_mongodb_connection_string

# Auth (JWT)
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run the backend:

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`, connected to the
backend at `http://localhost:8080`.

## Known Issues / Roadmap

- WebRTC video conferencing has a few unresolved edge cases still being ironed out
- Further performance optimizations planned for canvas redraw at scale

## License

This project is licensed under the MIT License.
