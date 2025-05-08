# Spotify Offline PWA

A Progressive Web App that lets users search Spotify's catalog and download tracks, albums, and playlists for offline listening. Built with React, Redux Toolkit, and modern web technologies.

## Features

- Search Spotify's catalog for tracks, albums, artists, and playlists
- Download content for offline listening using IndexedDB storage
- Full-featured media player with custom equalizer
- Responsive, mobile-first design with bottom tab navigation
- Theme settings (light/dark/system)
- Add-to-homescreen capability for full PWA experience
- Visualizer for audio playback

## Tech Stack

- **Frontend**: React + TypeScript
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **API Communication**: Axios
- **Authentication**: Spotify Web API (Authorization Code flow)
- **Offline Storage**: IndexedDB via localforage
- **PWA Features**: Workbox (via vite-plugin-pwa)
- **Audio Processing**: Web Audio API

## Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a Spotify Developer App at https://developer.spotify.com/dashboard
4. Set the redirect URI to `http://localhost:5173/callback` for local development
5. Create a `.env` file in the root directory with your Spotify API credentials:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
```

6. Run the development server with `npm run dev`

## Building for Production

1. Build the app with `npm run build`
2. Preview the production build with `npm run preview`
3. Deploy the `dist` folder to a web server

## Legal Notice

This application is for educational purposes only. Users are responsible for ensuring they have the appropriate rights to download and store content from Spotify. The app developers do not endorse or support using this application to violate Spotify's terms of service or copyright laws.

## License

MIT