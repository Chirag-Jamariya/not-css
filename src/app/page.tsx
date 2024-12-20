'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface SpotifyPlaylistResponse {
  tracks: {
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
  };
}

interface Song {
  name: string;
  artist: string;
  album: string;
  image: string;
  id: string;
}

const client_id = 'f8b957b592d74a6dacb876d35fbf8eaf'; 
const client_secret = '44214d0fc6dd454d89bfba9af1e0cd11'; 

const TopSongs = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      setError('Failed to fetch access token');
      return null;
    }
  };

  const fetchTopSongs = async (token: string) => {
    try {
      const response = await axios.get<SpotifyPlaylistResponse>(
        'https://api.spotify.com/v1/playlists/28jmBP66fq7vAzcXlyJvZU',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const topTracks: Song[] = response.data.tracks.items.slice(0, 10).map((item) => ({
        name: item.track.name,
        artist: item.track.artists.map((artist) => artist.name).join(', '),
        album: item.track.album.name,
        image: item.track.album.images[0].url,
        id: item.track.id,
      }));

      setSongs(topTracks);
    } catch (error) {
      console.error('Error fetching top songs:', error);
      setError('Failed to fetch top songs');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      if (token) {
        await fetchTopSongs(token);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Top 10 Songs</h1>
      <ul>
        {songs.map((song) => (
          <li key={song.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <img src={song.image} alt={song.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
            <div>
              <p><strong>{song.name}</strong></p>
              <p>Artist: {song.artist}</p>
              <p>Album: {song.album}</p>
              <p>Song ID: {song.id}</p>
              <Link href={`/song/${song.name}`}>More details</Link> {/* Link to song details */}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopSongs;
