
import { useEffect, useState } from "react";
import "./App.css";
import SpotifyCallback from "./SpotifyCallback";
import { loginWithSpotify } from "./spotifyAuth";
import { searchSpotifySongs } from "./spotifyApi";

function App() {
  const [search, setSearch] = useState("");
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("alcove_playlists")) || [];
    } catch {
      return [];
    }
  });
  const [playlistName, setPlaylistName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("alcove_playlists", JSON.stringify(playlists));
  }, [playlists]);

  if (window.location.pathname === "/callback") {
    return <SpotifyCallback />;
  }

  async function handleSearch() {
    if (!search.trim()) {
      setError("Please enter a song or artist name.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setSongs([]);

    try {
      const results = await searchSpotifySongs(search);
      setSongs(results);

      if (results.length === 0) {
        setMessage("No songs found. Try another search.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function createPlaylist() {
    const name = playlistName.trim();

    if (!name) {
      setMessage("Please enter a playlist name.");
      return;
    }

    if (
      playlists.some(
        (playlist) => playlist.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setMessage("A playlist with that name already exists.");
      return;
    }

    setPlaylists((current) => [
      ...current,
      { id: crypto.randomUUID(), name, songs: [] },
    ]);

    setPlaylistName("");
    setMessage(`Playlist "${name}" created!`);
  }

  function addSongToPlaylist(song, playlistId) {
    const selected = playlists.find(
      (playlist) => playlist.id === playlistId
    );

    const alreadyAdded = selected?.songs.some(
      (savedSong) => savedSong.id === song.id
    );

    if (alreadyAdded) {
      setMessage(`"${song.name}" is already in that playlist.`);
      return;
    }

    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId
          ? { ...playlist, songs: [...playlist.songs, song] }
          : playlist
      )
    );

    setMessage(`Added "${song.name}" to "${selected?.name}".`);
  }

  function removeSong(playlistId, songId) {
    setPlaylists((current) =>
      current.map((playlist) =>
        playlist.id === playlistId
          ? {
              ...playlist,
              songs: playlist.songs.filter((song) => song.id !== songId),
            }
          : playlist
      )
    );

    setMessage("Song removed from playlist.");
  }

  function deletePlaylist(playlistId) {
    setPlaylists((current) =>
      current.filter((playlist) => playlist.id !== playlistId)
    );

    setMessage("Playlist deleted.");
  }

  return (
    <div className="app dashboard">
      <aside className="sidebar">
        <a className="brand" href="#home">
          <span className="brand-icon">♫</span>
          <span>alcove</span>
        </a>

        <div className="sidebar-group">
          <p className="sidebar-label">MENU</p>
          <a className="nav-link active" href="#home">
            <span>⌂</span> Home
          </a>
          <a className="nav-link" href="#search">
            <span>⌕</span> Discover music
          </a>
          <a className="nav-link" href="#library">
            <span>♫</span> Your library
          </a>
        </div>

        <div className="sidebar-group sidebar-library">
          <p className="sidebar-label">YOUR PLAYLISTS</p>

          <a className="nav-link create-link" href="#create-playlist">
            <span>＋</span> Create playlist
          </a>

          {playlists.length === 0 ? (
            <p className="sidebar-empty">Your playlists will appear here.</p>
          ) : (
            playlists.map((playlist) => (
              <a
                className="nav-link playlist-nav-link"
                href={`#playlist-${playlist.id}`}
                key={playlist.id}
                title={playlist.name}
              >
                <span>♫</span>
                <span className="nav-playlist-name">{playlist.name}</span>
              </a>
            ))
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-icon">♫</span>
            <p>Your music.<br />Your own little space.</p>
          </div>
          <button className="spotify-button" onClick={loginWithSpotify}>
            Connect Spotify
          </button>
        </div>
      </aside>

      <div className="dashboard-content">
        <header className="topbar">
          <div>
            <p className="topbar-eyebrow">YOUR PERSONAL MUSIC SPACE</p>
            <h1>Welcome to Alcove <span>✦</span></h1>
          </div>
          <div className="profile-mark">A</div>
        </header>

        <main className="main dashboard-main">
          <section className="welcome" id="home">
            <p className="tagline">YOUR SOUNDTRACK STARTS HERE</p>
            <h2>Every mood deserves a playlist.</h2>
            <p>
              Discover your next favourite song and build a collection
              that feels like you.
            </p>

            <div className="search-box" id="search">
              <input
                type="text"
                placeholder="Search songs or artists..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
              />
              <button onClick={handleSearch} disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            {error && <p className="error-message">{error}</p>}
            {message && <p className="status-message">{message}</p>}
          </section>

          <section className="dashboard-section" id="create-playlist">
            <div className="section-heading">
              <div>
                <p className="section-kicker">MAKE IT YOURS</p>
                <h2>Create a playlist</h2>
              </div>
              <span className="section-symbol">＋</span>
            </div>

            <p className="section-description">
              A playlist for every mood, moment, and memory.
            </p>

            <div className="create-playlist">
              <input
                type="text"
                placeholder="Give your playlist a name..."
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") createPlaylist();
                }}
              />
              <button onClick={createPlaylist}>＋ Create playlist</button>
            </div>
          </section>

          <section className="dashboard-section" id="search-results">
            <div className="section-heading">
              <div>
                <p className="section-kicker">FIND YOUR NEXT FAVOURITE</p>
                <h2>Search results</h2>
              </div>
              <span className="section-symbol">♫</span>
            </div>

            {loading && <p className="section-description">Finding songs for you...</p>}

            {!loading && songs.length === 0 && (
              <div className="empty-state">
                <div className="music-icon">♫</div>
                <h3>Your next favourite is waiting</h3>
                <p>Search for a song or artist to see results here.</p>
              </div>
            )}

            <div className="song-list">
              {songs.map((song) => (
                <div className="song-card" key={song.id}>
                  {song.album.images?.length > 0 && (
                    <img
                      src={song.album.images[0].url}
                      alt={`${song.album.name} cover`}
                    />
                  )}

                  <div className="song-info">
                    <h3>{song.name}</h3>
                    <p>
                      {song.artists.map((artist) => artist.name).join(", ")}
                    </p>

                    <a
                      href={song.external_urls.spotify}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Spotify ↗
                    </a>

                    {playlists.length > 0 ? (
                      <select
                        defaultValue=""
                        aria-label={`Add ${song.name} to a playlist`}
                        onChange={(event) => {
                          const playlistId = event.target.value;
                          if (playlistId) {
                            addSongToPlaylist(song, playlistId);
                            event.target.value = "";
                          }
                        }}
                      >
                        <option value="" disabled>
                          Add to playlist...
                        </option>
                        {playlists.map((playlist) => (
                          <option key={playlist.id} value={playlist.id}>
                            {playlist.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="small-note">
                        Create a playlist to save this song.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-section" id="library">
            <div className="section-heading">
              <div>
                <p className="section-kicker">YOUR PERSONAL COLLECTION</p>
                <h2>Your playlists</h2>
              </div>
              <span className="section-symbol">♡</span>
            </div>

            <p className="section-description">
              {playlists.length === 0
                ? "Your personal soundtrack starts here."
                : `${playlists.length} playlist(s) in your library`}
            </p>

            {playlists.length === 0 && (
              <div className="empty-state">
                <div className="music-icon">♫</div>
                <h3>A space for your music</h3>
                <p>Create your first playlist to get started.</p>
              </div>
            )}

            <div className="playlist-grid">
              {playlists.map((playlist) => (
                <article
                  className="playlist-card"
                  id={`playlist-${playlist.id}`}
                  key={playlist.id}
                >
                  <div className="playlist-heading">
                    <div className="playlist-cover">
                      {playlist.songs[0]?.album.images?.length > 0 ? (
                        <img
                          src={playlist.songs[0].album.images[0].url}
                          alt=""
                        />
                      ) : (
                        <span>♫</span>
                      )}
                    </div>

                    <div className="playlist-title">
                      <h3>{playlist.name}</h3>
                      <p>
                        {playlist.songs.length}{" "}
                        {playlist.songs.length === 1 ? "song" : "songs"}
                      </p>
                    </div>

                    <button
                      className="delete-button"
                      onClick={() => deletePlaylist(playlist.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {playlist.songs.length === 0 ? (
                    <p className="playlist-empty">
                      No songs yet. Find a song and add it here.
                    </p>
                  ) : (
                    <div className="saved-songs">
                      {playlist.songs.map((song) => (
                        <div className="saved-song" key={song.id}>
                          {song.album.images?.length > 0 && (
                            <img
                              src={
                                song.album.images[
                                  song.album.images.length - 1
                                ].url
                              }
                              alt=""
                            />
                          )}

                          <div className="saved-song-info">
                            <strong>{song.name}</strong>
                            <p>
                              {song.artists
                                .map((artist) => artist.name)
                                .join(", ")}
                            </p>
                            <a
                              href={song.external_urls.spotify}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open in Spotify ↗
                            </a>
                          </div>

                          <button
                            className="remove-button"
                            onClick={() => removeSong(playlist.id, song.id)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <footer>Made with ♡ for music lovers</footer>
        </main>
      </div>
    </div>
  );
}

export default App;