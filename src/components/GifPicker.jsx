import { useState, useEffect } from 'react';

function GifPicker({ onGifSelect, onClose }) {
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchGifs = (searchTerm = '') => {
    setLoading(true);
    const endpoint = searchTerm 
      ? `https://api.giphy.com/v1/gifs/search?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&q=${searchTerm}&limit=20`
      : 'https://api.giphy.com/v1/gifs/trending?api_key=GlVGYHkr3WSBnllca54iNt0yFbjz7L65&limit=20';

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setGifs(data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching GIFs:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGifs();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout to debounce search
    setSearchTimeout(setTimeout(() => {
      fetchGifs(value);
    }, 500));
  };

  return (
    <div className="gif-picker">
      <button className="close-button" onClick={onClose}>×</button>
      <input
        type="text"
        className="gif-search"
        placeholder="Search GIFs..."
        value={search}
        onChange={handleSearch}
      />
      {loading ? (
        <div className="loading">Loading GIFs...</div>
      ) : (
        <div className="gif-grid">
          {gifs.map(gif => (
            <div 
              key={gif.id} 
              className="gif-item"
              onClick={() => onGifSelect(gif.images.fixed_height.url)}
            >
              <img 
                src={gif.images.fixed_height.url} 
                alt="GIF"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GifPicker; 