
export async function searchSpotifySongs(query) {
  const token = sessionStorage.getItem("spotify_access_token");

  if (!token) {
    throw new Error("Please connect to Spotify first.");
  }

  const response = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Spotify search failed.");
  }

  return data.tracks.items;
}