'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const client_id = 'b7c2ca4230194b81aea3585a001d106a';
const client_secret = '5a30555a90d542a1b69bfdaeebad56b3';
const redirect_uri = 'http://localhost:3000'; // Update based on your deployment URL
const scopes = 'user-top-read';

interface SpotifyArtist {
  name: string;
}

interface SpotifyAlbum {
  name: string;
  images: { url: string }[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
}

interface SpotifyPlaylistResponse {
  tracks: {
    items: {
      track: SpotifyTrack;
    }[];
  };
}

interface SpotifyUserTopTracksResponse {
  items: SpotifyTrack[];
}

interface Song {
  name: string;
  artist: string;
  album: string;
  image: string;
  id: string;
}

const TopSongs = () => {
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getToken = async (code?: string): Promise<string | null> => {
    try {
      if (code) {
        const response = await axios.post<{ access_token: string }>(
          'https://accounts.spotify.com/api/token',
          new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri,
            client_id,
            client_secret,
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return response.data.access_token;
      }
      return null;
    } catch (error) {
      console.error('Error fetching token:', error);
      setError('Failed to fetch access token');
      return null;
    }
  };

  const fetchUserTopSongs = async (token: string) => {
    try {
      const response = await axios.get<SpotifyUserTopTracksResponse>(
        'https://api.spotify.com/v1/me/top/tracks',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const topTracks: Song[] = response.data.items.slice(0, 10).map((item) => ({
        name: item.name,
        artist: item.artists.map((artist: SpotifyArtist) => artist.name).join(', '),
        album: item.album.name,
        image: item.album.images[0]?.url || '',
        id: item.id,
      }));

      setUserSongs(topTracks);
    } catch (error) {
      console.error('Error fetching user top songs:', error);
      setError('Failed to fetch user top songs');
    }
  };

  const fetchPlaylistSongs = async (token: string) => {
    try {
      const response = await axios.get<SpotifyPlaylistResponse>(
        'https://api.spotify.com/v1/playlists/28jmBP66fq7vAzcXlyJvZU',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const topTracks: Song[] = response.data.tracks.items.slice(0, 10).map((item) => ({
        name: item.track.name,
        artist: item.track.artists.map((artist: SpotifyArtist) => artist.name).join(', '),
        album: item.track.album.name,
        image: item.track.album.images[0]?.url || '',
        id: item.track.id,
      }));

      setPlaylistSongs(topTracks);
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      setError('Failed to fetch playlist songs');
    }
  };

  const handleLogin = () => {
    const url = `https://accounts.spotify.com/authorize?client_id=${client_id}&response_type=code&redirect_uri=${encodeURIComponent(
      redirect_uri
    )}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = url;
  };

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        const token = await getToken(code);
        if (token) {
          await fetchUserTopSongs(token);
          await fetchPlaylistSongs(token);
        }
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Spotify Top Songs</h1>
      {!userSongs.length && (
        <button onClick={handleLogin} style={{ marginBottom: '20px' }}>
          Login with Spotify
        </button>
      )}
      {userSongs.length > 0 && (
        <>
          <h2>Your Top 10 Songs</h2>
          <ul>
            {userSongs.map((song) => (
              <li key={song.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <img src={song.image} alt={song.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                <div>
                  <p><strong>{song.name}</strong></p>
                  <p>Artist: {song.artist}</p>
                  <p>Album: {song.album}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <h2>Playlist Top 10 Songs</h2>
      <ul>
        {playlistSongs.map((song) => (
          <li key={song.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <img src={song.image} alt={song.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
            <div>
              <p><strong>{song.name}</strong></p>
              <p>Artist: {song.artist}</p>
              <p>Album: {song.album}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopSongs;
