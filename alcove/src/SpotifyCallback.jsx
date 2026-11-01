
import { useEffect, useState } from "react";

function SpotifyCallback() {
  const [message, setMessage] = useState("Connecting to Spotify...");

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const returnedState = params.get("state");
      const savedState = sessionStorage.getItem("spotify_auth_state");
      const codeVerifier = sessionStorage.getItem("spotify_code_verifier");

      if (params.has("error")) {
        setMessage("Spotify login was cancelled or denied.");
        return;
      }

      if (
        !code ||
        !returnedState ||
        returnedState !== savedState ||
        !codeVerifier
      ) {
        setMessage("Login verification failed. Please try again.");
        return;
      }

      try {
        const response = await fetch(
          "https://accounts.spotify.com/api/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
              grant_type: "authorization_code",
              code,
              redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
              code_verifier: codeVerifier,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error_description || "Token exchange failed.");
        }

        sessionStorage.setItem("spotify_access_token", data.access_token);

        if (data.refresh_token) {
          sessionStorage.setItem("spotify_refresh_token", data.refresh_token);
        }

        sessionStorage.removeItem("spotify_code_verifier");
        sessionStorage.removeItem("spotify_auth_state");

        window.history.replaceState({}, "", "/");
        window.location.reload();
      } catch (error) {
        setMessage(error.message || "Could not connect to Spotify.");
      }
    }

    handleCallback();
  }, []);

  return (
    <main className="main">
      <section className="welcome">
        <h2>Alcove × Spotify</h2>
        <p>{message}</p>
      </section>
    </main>
  );
}

export default SpotifyCallback;