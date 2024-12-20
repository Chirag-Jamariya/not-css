import React, { useState } from 'react';
import Link from 'next/link';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for a song..."
        style={{
          padding: '10px',
          width: '300px',
          marginRight: '10px',
          border: '1px solid #ccc',
          color: '#000000',
          borderRadius: '5px',
        }}
      />
      {searchQuery.trim() ? (
        <Link href={`/search/${encodeURIComponent(searchQuery.trim())}`} passHref>
          <button
            style={{
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </Link>
      ) : (
        <button
          disabled
          style={{
            padding: '10px 20px',
            backgroundColor: '#cccccc',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'not-allowed',
          }}
        >
          Search
        </button>
      )}
    </div>
  );
};

export default SearchBar;
