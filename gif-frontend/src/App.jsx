import React, { useState, useEffect } from 'react';
import { Search, Heart, Smile, Zap, Coffee, Star, ThumbsUp, PartyPopper, Camera, Sparkles } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

const GifGenerator = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [emotions, setEmotions] = useState([]);
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [showTrending, setShowTrending] = useState(true);

  // Predefined popular emotions with icons
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

  // Load trending GIFs on component mount
  useEffect(() => {
    loadTrendingGifs();
    loadEmotions();
  }, []);

  const loadTrendingGifs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/gif/trending?limit=20`);
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

  const loadEmotions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emotions`);
      const data = await response.json();
      setEmotions(data.emotions || []);
    } catch (error) {
      console.error('Error loading emotions:', error);
    }
  };

  const searchGifs = async (emotion) => {
    if (!emotion.trim()) return;
    
    setLoading(true);
    setSelectedEmotion(emotion);
    setShowTrending(false);
    
    try {
      // For search, we'll get multiple GIFs by calling the random endpoint multiple times
      const promises = Array(12).fill().map(() => 
        fetch(`${API_BASE_URL}/gif/random`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ emotion })
        }).then(res => res.json())
      );
      
      const results = await Promise.all(promises);
      // Remove duplicates based on ID
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
      // You could add a toast notification here
      console.log('GIF URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            GIF Generator
          </h1>
          <p className="text-xl text-purple-100 mb-8">
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
                className="w-full pl-12 pr-4 py-4 text-lg rounded-full border-0 bg-white/10 backdrop-blur-md text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 hover:bg-pink-600 text-white p-2 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Quick Emotion Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {popularEmotions.map(({ name, icon: Icon, color }) => (
              <button
                key={name}
                onClick={() => handleEmotionClick(name)}
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
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">
            {showTrending ? 'Trending GIFs' : `Results for "${selectedEmotion}"`}
          </h2>
          {!showTrending && (
            <button
              onClick={loadTrendingGifs}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors backdrop-blur-md"
            >
              Show Trending
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-4">Loading amazing GIFs...</p>
          </div>
        )}

        {/* GIF Grid */}
        {!loading && gifs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {gifs.map((gif) => (
              <div
                key={`${gif.id}-${Math.random()}`}
                className="group relative bg-white/10 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-md"
                onClick={() => copyGifUrl(gif.url)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={gif.preview_url || gif.url}
                    alt={gif.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = gif.url;
                    }}
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Camera className="w-8 h-8 text-white mb-2 mx-auto" />
                    <p className="text-white text-sm font-medium text-center px-2">
                      Click to copy
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-xs font-medium truncate">
                    {gif.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && gifs.length === 0 && !showTrending && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤷‍♀️</div>
            <h3 className="text-2xl font-bold text-white mb-2">No GIFs found</h3>
            <p className="text-purple-200 mb-6">
              Try searching for a different emotion or keyword
            </p>
            <button
              onClick={loadTrendingGifs}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              Browse Trending GIFs
            </button>
          </div>
        )}
      </div>
{/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-white/70 text-sm mb-2">
            Made with ❤️ by Your Name
          </p>
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} GIF Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default GifGenerator;