"use client"
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface GeniusSongResponse {
  response: {
    hits: {
      result: {
          artist_names: string;
          release_date_for_display: string;
          full_title: string;
          header_image_thumbnail_url: string;
        };
    }[];
  };
}

const SongDetails = () => {
  const [songDetails, setSongDetails] = useState<{
    title: string;
    artist: string;
    releaseDate: string;
    imageUrl: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { name }= useParams(); // Get song name from URL

  useEffect(() => {
    if (name) {
      // If 'name' is an array (from Next.js router), take the first element
      const songName = Array.isArray(name) ? name[0] : name;

      const fetchSongDetails = async () => {
        try {
          const response = await axios.get<GeniusSongResponse>(
            `https://api.genius.com/search?q=${songName}&access_token=nRcjQIdNTbrESyGeqG5NNMoCPODzH-9_od2T-8G4c7pFD_J3sz7ehCjzv-ImXHW9`
          );

          const song = response.data.response.hits[0]?.result;
          if (song) {
            setSongDetails({
              title: song.full_title,
              artist: song.artist_names,
              releaseDate: song.release_date_for_display,
              imageUrl: song.header_image_thumbnail_url,
            });
          } else {
            setError('Song not found on Genius');
          }
        } catch (error) {
          console.error('Error fetching song details:', error);
          setError('Failed to fetch song details');
        }
      };

      fetchSongDetails();
    }
  }, [name]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!songDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{songDetails.title}</h1>
      <p>Artist: {songDetails.artist}</p>
      <p>Release Date: {songDetails.releaseDate}</p>
      <img src={songDetails.imageUrl} alt={songDetails.title} style={{ width: '300px' }} />
    </div>
  );
};

export default SongDetails;
