"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

interface GeniusSearchResponse {
  response: {
    hits: {
      result: {
        id: number;
        artist_names: string;
        release_date_for_display: string;
        full_title: string;
        header_image_thumbnail_url: string;
        url: string;
      };
    }[];
  };
}

interface GeniusSongDetailsResponse {
  response: {
    song: {
      album: {
        name: string;
      };
      primary_artist: {
        name: string;
      };
      writer_artists: {
        name: string;
      }[];
    };
  };
}

const SongDetails = () => {
  const [songDetails, setSongDetails] = useState<{
    title: string;
    artist: string;
    releaseDate: string;
    imageUrl: string;
    lyricsUrl: string;
    albumName: string;
    primaryArtist: string;
    writerArtists: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();
  const { name } = useParams(); // Get song name from URL

  useEffect(() => {
    if (name) {
      const songName = Array.isArray(name) ? name[0] : name;

      const fetchSongDetails = async () => {
        try {
          // Fetch initial song data
          const searchResponse = await axios.get<GeniusSearchResponse>(
            `https://api.genius.com/search?q=${songName}&access_token=${process.env.NEXT_PUBLIC_GENIUS_ACCESS_TOKEN}`
          );

          const song = searchResponse.data.response.hits[0]?.result;
          if (song) {
            // Fetch additional song details using song ID
            const songDetailsResponse = await axios.get<GeniusSongDetailsResponse>(
              `https://api.genius.com/songs/${song.id}?access_token=${process.env.NEXT_PUBLIC_GENIUS_ACCESS_TOKEN}`
            );

            const songDetailsData = songDetailsResponse.data.response.song;

            setSongDetails({
              title: song.full_title,
              artist: song.artist_names,
              releaseDate: song.release_date_for_display,
              imageUrl: song.header_image_thumbnail_url,
              lyricsUrl: song.url,
              albumName: songDetailsData.album?.name || "Unknown Album",
              primaryArtist: songDetailsData.primary_artist.name,
              writerArtists: songDetailsData.writer_artists.map((writer) => writer.name),
            });
          } else {
            setError("Song not found on Genius");
          }
        } catch (error) {
          console.error("Error fetching song details:", error);
          setError("Failed to fetch song details");
        } finally {
          setLoading(false);
        }
      };

      fetchSongDetails();
    }
  }, [name]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!songDetails) {
    return <div>Song details not found.</div>;
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>{songDetails.title}</h1>
      <p>Artist: {songDetails.artist}</p>
      <p>Primary Artist: {songDetails.primaryArtist}</p>
      <p>Release Date: {songDetails.releaseDate}</p>
      <p>Album: {songDetails.albumName}</p>
      <img src={songDetails.imageUrl} alt={songDetails.title} style={{ width: "300px", borderRadius: "8px" }} />
      <p>
        <a href={songDetails.lyricsUrl} target="_blank" rel="noopener noreferrer">
          View Lyrics on Genius
        </a>
      </p>
    </div>
  );
};

export default SongDetails;
