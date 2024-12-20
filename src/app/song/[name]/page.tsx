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
  const [rating, setRating] = useState<number | null>(null); // Store user rating
  const [ratingInput, setRatingInput] = useState<string>(""); // Input field value

  const router = useRouter();
  const { name } = useParams(); // Get song name from URL

  useEffect(() => {
    if (name) {
      const songName = Array.isArray(name) ? name[0] : name;

      const fetchSongDetails = async () => {
        try {
          // Fetch initial song data
          const searchResponse = await axios.get<GeniusSearchResponse>(
            `https://api.genius.com/search?q=${songName}&access_token=nRcjQIdNTbrESyGeqG5NNMoCPODzH-9_od2T-8G4c7pFD_J3sz7ehCjzv-ImXHW9`
          );

          const song = searchResponse.data.response.hits[0]?.result;
          if (song) {
            // Fetch additional song details using song ID
            const songDetailsResponse = await axios.get<GeniusSongDetailsResponse>(
              `https://api.genius.com/songs/${song.id}?access_token=nRcjQIdNTbrESyGeqG5NNMoCPODzH-9_od2T-8G4c7pFD_J3sz7ehCjzv-ImXHW9`
            );

            const songDetailsData = songDetailsResponse.data.response.song;

            setSongDetails({
              title: song.full_title,
              artist: song.artist_names,
              releaseDate: song.release_date_for_display,
              imageUrl: song.header_image_thumbnail_url,
              lyricsUrl: song.url,
              albumName: songDetailsData.album?.name || 'Unknown Album',
              primaryArtist: songDetailsData.primary_artist.name,
              writerArtists: songDetailsData.writer_artists.map((writer) => writer.name),
            });
          } else {
            setError("Song not found on Genius");
          }
        } catch (error) {
          console.error("Error fetching song details:", error);
          setError("Failed to fetch song details");
        }
      };

      fetchSongDetails();
    }
  }, [name]);

  const handleRating = (star: number) => {
    setRating(star);
    console.log(`User rated this song: ${star} star(s)`);
  };

  const handleRatingInput = () => {
    const parsedRating = parseInt(ratingInput);
    if (!isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5) {
      handleRating(parsedRating);
    } else {
      alert("Please enter a rating between 1 and 5.");
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!songDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-bold mb-4 text-center text-gray-100">{songDetails.title}</h1>
      <p className="text-lg text-gray-300 mb-2">Artist: {songDetails.artist}</p>
      <p className="text-lg text-gray-300 mb-4">Release Date: {songDetails.releaseDate}</p>
      <img
        src={songDetails.imageUrl}
        alt={songDetails.title}
        className="w-72 h-auto rounded-lg shadow-lg object-cover"
      />

      {/* Ratings Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-100">Rate this Song</h2>
        <div className="flex space-x-4 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className={`text-3xl transition-all ${rating && rating >= star ? "text-yellow-500" : "text-gray-500 hover:text-yellow-400"
                }`}
              onClick={() => handleRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        {/* Input Rating */}
        <div className="flex items-center space-x-4">
          <input
            type="number"
            placeholder="Enter rating (1-5)"
            value={ratingInput}
            onChange={(e) => setRatingInput(e.target.value)}
            className="bg-gray-800 text-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <button
            onClick={handleRatingInput}
            className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600 transition"
          >
            Submit
          </button>
        </div>
        {rating && (
          <p className="text-lg text-gray-300 mt-4">
            You rated this song: <strong>{rating} star(s)</strong>
          </p>
        )}
      </div>
      <div>
        <h1>{songDetails.title}</h1>
        <p>Artist: {songDetails.artist}</p>
        <p>Primary Artist: {songDetails.primaryArtist}</p>
        <p>Release Date: {songDetails.releaseDate}</p>
        <p>Album: {songDetails.albumName}</p>
        <img src={songDetails.imageUrl} alt={songDetails.title} style={{ width: '300px' }} />
        <p>
          <a href={songDetails.lyricsUrl} target="_blank" rel="noopener noreferrer">
            View Lyrics on Genius
          </a>
        </p>
      </div>
    </div>
  );
};

export default SongDetails;
