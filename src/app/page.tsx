'use client';
import SearchBar from './search/searchbar';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Import Link for dynamic routing

interface Song {
  id: string;
  name: string;
  artists: string[];
  album: string;
  image: string;
}

interface PlaylistResponse {
  items: {
    track: {
      id: string;
      name: string;
      artists: { name: string }[];
      album: {
        name: string;
        images: { url: string }[];
      };
    };
  }[];
}

interface TopTracksResponse {
  items: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string }[];
    };
  }[];
}

const client_id = 'b7c2ca4230194b81aea3585a001d106a';
const client_secret = '5a30555a90d542a1b69bfdaeebad56b3';
const redirect_uri = 'http://localhost:3000'; // Change to your deployed URL
const playlist_id = '28jmBP66fq7vAzcXlyJvZU';

const getToken = async (): Promise<string | null> => {
  try {
    const response = await axios.post<{ access_token: string }>(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'client_credentials' }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(`${client_id}:${client_secret}`)}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
};

const fetchPlaylistSongs = async (token: string): Promise<Song[]> => {
  try {
    const response = await axios.get<PlaylistResponse>(
      `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data.items.slice(0, 10).map((item) => ({
      id: item.track.id,
      name: item.track.name,
      artists: item.track.artists.map((artist) => artist.name),
      album: item.track.album.name,
      image: item.track.album.images[0]?.url || '',
    }));
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    return [];
  }
};

const fetchUserTopSongs = async (token: string): Promise<Song[]> => {
  try {
    const response = await axios.get<TopTracksResponse>(
      'https://api.spotify.com/v1/me/top/tracks',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10 },
      }
    );

    return response.data.items.map((track) => ({
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist) => artist.name),
      album: track.album.name,
      image: track.album.images[0]?.url || '',
    }));
  } catch (error) {
    console.error('Error fetching user top songs:', error);
    throw new Error('Failed to fetch user top songs');
  }
};

const SpotifyApp = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      const accessToken = await getToken();
      if (!accessToken) {
        setError('Failed to fetch access token');
        setLoading(false);
        return;
      }

      setToken(accessToken);
      const playlistSongs = await fetchPlaylistSongs(accessToken);
      setSongs(playlistSongs);
      setLoading(false);
    };

    fetchSongs();
  }, []);

  const handleLogin = () => {
    const scope = 'user-top-read';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=token&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
        setSongs([]); // Clear playlist songs
        setUserLoading(true); // Start loading user songs
        (async () => {
          try {
            const userTopSongs = await fetchUserTopSongs(accessToken);
            setUserSongs(userTopSongs);
          } catch (err: unknown) {
            // Type assertion to handle the error properly
            if (err instanceof Error) {
              setError(err.message);
            } else {
              setError('An unknown error occurred');
            }
          } finally {
            setUserLoading(false); // Stop loading
          }
        })();
      }
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6 bg-black text-white min-h-screen">
      <SearchBar/>
  <h1 className="text-3xl font-bold text-center text-yellow-400 mb-6">Spotify Playlist & User Top Songs</h1>

  {userLoading ? (
    <div className="text-center text-white">Loading your top songs...</div>
  ) : userSongs.length === 0 ? (
    <>
      <h2 className="text-2xl font-bold text-center text-white mb-4">Top 10 Songs Globally</h2>
      <ul className="space-y-6">
        {songs.map((song) => (
          <li
            key={song.id}
            className="flex items-center p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-all"
          >
            <img
              src={song.image}
              alt={song.name}
              className="w-16 h-16 rounded-md object-cover mr-6"
            />
            <div>
              <p className="text-lg font-semibold text-white">{song.name}</p>
              <p className="text-sm text-gray-400">Artists: {song.artists.join(', ')}</p>
              <p className="text-sm text-gray-400">Album: {song.album}</p>
              <Link href={`/song/${song.name}`} passHref>
                <button className="mt-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400 transition-all">
                  More Details
                </button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
      <button
        onClick={handleLogin}
        className="mt-6 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-400 transition-all"
      >
        Login to see your top songs
      </button>
    </>
  ) : (
    <>
      <h2 className="text-2xl font-bold text-center text-white mb-4">Your Top 10 Songs</h2>
      <ul className="space-y-6">
        {userSongs.map((song) => (
          <li
            key={song.id}
            className="flex items-center p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-all"
          >
            <img
              src={song.image}
              alt={song.name}
              className="w-16 h-16 rounded-md object-cover mr-6"
            />
            <div>
              <p className="text-lg font-semibold text-white">{song.name}</p>
              <p className="text-sm text-gray-400">Artists: {song.artists.join(', ')}</p>
              <p className="text-sm text-gray-400">Album: {song.album}</p>
              <Link href={`/song/${song.name}`} passHref>
                <button className="mt-2 px-4 py-2 bg-yellow-500 text-black rounded-md hover:bg-yellow-400 transition-all">
                  More Details
                </button>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  )}
</div>

  );
};

export default SpotifyApp;
