'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation'; // Use useParams instead of useRouter

interface Song {
  id: string;
  name: string;
  artists: string[];
  album: string;
  image: string;
}

const client_id = 'f8b957b592d74a6dacb876d35fbf8eaf';
const client_secret = '44214d0fc6dd454d89bfba9af1e0cd11';

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

const searchSongByName = async (query: string, token: string): Promise<Song | null> => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type: 'track', limit: 1 }, // Fetch the top match only
    });

    const track = response.data.tracks.items[0];
    if (!track) return null;

    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => artist.name),
      album: track.album.name,
      image: track.album.images[0]?.url || '',
    };
  } catch (error) {
    console.error('Error fetching song:', error);
    return null;
  }
};

const SearchByName = () => {
  const params = useParams();
  const name = params.name; // Retrieve the 'name' from the URL
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSong = async () => {
      if (!name) return;
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setError('Failed to retrieve access token');
        setLoading(false);
        return;
      }

      const result = await searchSongByName(name, token);
      if (!result) {
        setError('No song found');
      }

      setSong(result);
      setLoading(false);
    };

    fetchSong();
  }, [name]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Search Results for "{name}"</h1>
      {song ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={song.image}
            alt={song.name}
            style={{ width: '150px', height: '150px', marginRight: '20px' }}
          />
          <div>
            <p>
              <strong>{song.name}</strong>
            </p>
            <p>Artists: {song.artists.join(', ')}</p>
            <p>Album: {song.album}</p>
          </div>
        </div>
      ) : (
        <p>No results found.</p>
      )}
    </div>
  );
};

export default SearchByName;
