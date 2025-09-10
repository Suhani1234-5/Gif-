import React, { useState, useEffect } from 'react';
import { Search, Heart, Smile, Zap, Coffee, Star, ThumbsUp, PartyPopper, Camera, Sparkles } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const GifGenerator = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [showTrending, setShowTrending] = useState(true);

  const popularEmotions = [
    { name: 'happy', icon: Smile, color: 'bg-yellow-500' },
    { name: 'love', icon: Heart, color: 'bg-pink-500' },
    { name: 'excited', icon: Zap, color: 'bg-orange-500' },
    { name: 'celebrate', icon: PartyPopper, color: 'bg-purple-500' },
    { name: 'coffee', icon: Coffee, color: 'bg-amber-600' },
    { name: 'awesome', icon: Star, color: 'bg-blue-500' },
    { name: 'cool', icon: ThumbsUp, color: 'bg-green-500' },
    { name: 'amazing', icon: Sparkles, color: 'bg-indigo-500' }
  ];

  useEffect(() => {
    loadTrendingGifs();
  }, []);

  const loadTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/gif/trending?limit=20`, {
        headers: {
          'Cache-Control': 'public, max-age=31536000'
        }
      });
      const data = await response.json();
      setGifs(data.gifs || []);
      setShowTrending(true);
    } catch (error) {
      console.error('Error loading trending GIFs:', error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (emotion) => {
    if (!emotion.trim()) return;
    setLoading(true);
    setSelectedEmotion(emotion);
    setShowTrending(false);
    try {
      const promises = Array(12).fill().map(() =>
        fetch(`${API_BASE_URL}/gif/random`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ emotion })
        }).then(res => res.json())
      );

      const results = await Promise.all(promises);
      const uniqueGifs = results.filter((gif, index, self) =>
        index === self.findIndex(g => g.id === gif.id)
      );

      setGifs(uniqueGifs);
    } catch (error) {
      console.error('Error searching GIFs:', error);
      setGifs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchGifs(searchTerm);
    }
  };

  const handleEmotionClick = (emotion) => {
    setSearchTerm(emotion);
    searchGifs(emotion);
  };

  const copyGifUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('GIF URL copied!');
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-blue-900 text-white">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            GIF Generator
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Search for any GIF you can imagine
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to search for GIFs..."
                className="w-full pl-12 pr-4 py-4 text-lg rounded-full border-0 bg-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                type="submit"
                aria-label="Search GIFs"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Emotion Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {popularEmotions.map(({ name, icon: Icon, color }) => (
              <button
                key={name}
                onClick={() => handleEmotionClick(name)}
                aria-label={name}
                className={`${color} hover:scale-105 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-transform shadow-lg`}
              >
                <Icon className="w-4 h-4" />
                <span className="capitalize font-medium">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {showTrending ? 'Trending GIFs' : `Results for "${selectedEmotion}"`}
          </h2>
          {!showTrending && (
            <button
              onClick={loadTrendingGifs}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              Show Trending
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="mt-4 text-gray-300">Loading GIFs...</p>
          </div>
        ) : gifs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {gifs.map(gif => (
              <div
                key={gif.id}
                className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => copyGifUrl(gif.url)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={gif.preview_url || gif.url}
                    alt={gif.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-xs font-medium truncate">{gif.title}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤷‍♀️</div>
            <h3 className="text-2xl font-bold mb-2">No GIFs found</h3>
            <p className="text-gray-400 mb-6">Try searching for something else</p>
            <button
              onClick={loadTrendingGifs}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full transition-colors"
            >
              Browse Trending GIFs
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 border-t border-gray-700">
        <div className="max-w-4xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>Made with ❤️</p>
          <p>© {new Date().getFullYear()} GIF Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default GifGenerator;
