# Spotify Pulse

A clean, low-key, single-page Spotify dashboard that shows:

- what is currently playing
- what was recently played

The UI is intentionally minimal, dark, and modern, with no full-page scrolling.

## Features

- One-page layout
- Muted, professional visual style (no vibrant colors)
- Current track from Spotify API (`/me/player/currently-playing`)
- Recent tracks from Spotify API (`/me/player/recently-played`)
- Manual refresh button

## Project Structure

- `index.html` — page structure
- `styles.css` — visual style and layout
- `app.js` — Spotify API requests and rendering

## Setup

1. Generate a Spotify user access token with scopes:
   - `user-read-currently-playing`
   - `user-read-recently-played`
2. Open `app.js` and set:
   ```js
   const CONFIG = {
     accessToken: "YOUR_SPOTIFY_ACCESS_TOKEN",
     recentlyPlayedLimit: 6,
   };
   ```
3. Open `index.html` in your browser.

## Notes

- Spotify access tokens expire; refresh/regenerate when requests fail.
- Do not commit real tokens or secrets.

## License

This project is licensed under the terms in `LICENSE`.
