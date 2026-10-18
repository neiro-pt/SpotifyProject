const CONFIG = {
  // Add your short-lived Spotify user access token here.
  accessToken: "bbb8eb22a59f4d9bb00817482689c6ab",
  recentlyPlayedLimit: 6,
};

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

const currentTrackEl = document.getElementById("current-track");
const recentTracksEl = document.getElementById("recent-tracks");
const statusEl = document.getElementById("status");
const refreshBtn = document.getElementById("refresh-btn");

function setStatus(message) {
  statusEl.textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function isSafeImageUrl(value) {
  return typeof value === "string" && value.startsWith("https://");
}

function createTrackMarkup(track, playedAt) {
  const title = escapeHtml(track?.name ?? "Unknown track");
  const artists = escapeHtml(track?.artists?.map((artist) => artist.name).join(", ") || "Unknown artist");
  const album = escapeHtml(track?.album?.name ?? "Unknown album");
  const image = track?.album?.images?.[2]?.url || track?.album?.images?.[0]?.url;
  const safeImage = isSafeImageUrl(image) ? image : null;
  const safePlayedAt = playedAt ? escapeHtml(playedAt) : "";

  return `
    ${safeImage ? `<img class="track__cover" src="${safeImage}" alt="Album cover for ${title}" />` : '<div class="track__cover" aria-hidden="true"></div>'}
    <div>
      <p class="track__title">${title}</p>
      <p class="track__meta">${artists} · ${album}${safePlayedAt ? ` · ${safePlayedAt}` : ""}</p>
    </div>
  `;
}

async function spotifyFetch(endpoint) {
  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    headers: {
      Authorization: "Bearer " + CONFIG.accessToken,
    },
  });

  if (response.status === 204) return null;

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Spotify API error (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}

function renderCurrentTrack(data) {
  if (!data || !data.item) {
    currentTrackEl.innerHTML = '<p class="muted">Nothing is currently playing.</p>';
    return;
  }

  currentTrackEl.innerHTML = createTrackMarkup(data.item);
}

function renderRecentTracks(data) {
  const items = data?.items || [];
  if (items.length === 0) {
    recentTracksEl.innerHTML = '<li class="muted">No recently played tracks available.</li>';
    return;
  }

  recentTracksEl.innerHTML = items
    .map((item) => {
      const playedAt = new Date(item.played_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `<li>${createTrackMarkup(item.track, playedAt)}</li>`;
    })
    .join("");
}

async function refreshSpotifyData() {
  if (!CONFIG.accessToken.trim()) {
    setStatus("Add your Spotify access token in app.js to load your listening data.");
    currentTrackEl.innerHTML = '<p class="muted">Token missing.</p>';
    recentTracksEl.innerHTML = '<li class="muted">Token missing.</li>';
    return;
  }

  setStatus("Loading Spotify data…");
  refreshBtn.disabled = true;

  try {
    const [current, recent] = await Promise.all([
      spotifyFetch("/me/player/currently-playing"),
      spotifyFetch(`/me/player/recently-played?limit=${CONFIG.recentlyPlayedLimit}`),
    ]);

    renderCurrentTrack(current);
    renderRecentTracks(recent);
    setStatus(`Last updated: ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    setStatus(error.message);
  } finally {
    refreshBtn.disabled = false;
  }
}

refreshBtn.addEventListener("click", refreshSpotifyData);
refreshSpotifyData();
