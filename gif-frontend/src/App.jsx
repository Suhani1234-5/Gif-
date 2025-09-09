// import React, { useState, useEffect } from 'react';
// import { Search, Heart, Smile, Frown, Zap, Star, Coffee, Music } from 'lucide-react';

// const API_BASE_URL = 'http://127.0.0.1:8000';

// const GifReactionPicker = () => {
//   const [emotion, setEmotion] = useState('');
//   const [currentGif, setCurrentGif] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [popularEmotions, setPopularEmotions] = useState([]);
//   const [trendingGifs, setTrendingGifs] = useState([]);
//   const [showTrending, setShowTrending] = useState(false);

//   // Emotion icons mapping
//   const emotionIcons = {
//     happy: <Smile className="w-4 h-4" />,
//     sad: <Frown className="w-4 h-4" />,
//     excited: <Zap className="w-4 h-4" />,
//     love: <Heart className="w-4 h-4" />,
//     cool: <Star className="w-4 h-4" />,
//     tired: <Coffee className="w-4 h-4" />,
//     dance: <Music className="w-4 h-4" />
//   };

//   // Fetch popular emotions on component mount
//   useEffect(() => {
//     fetchPopularEmotions();
//     fetchTrendingGifs();
//   }, []);

//   const fetchPopularEmotions = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/emotions`);
//       if (response.ok) {
//         const data = await response.json();
//         setPopularEmotions(data.emotions);
//       }
//     } catch (err) {
//       console.error('Failed to fetch emotions:', err);
//     }
//   };

//   const fetchTrendingGifs = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/gif/trending?limit=12`);
//       if (response.ok) {
//         const data = await response.json();
//         setTrendingGifs(data.gifs);
//       }
//     } catch (err) {
//       console.error('Failed to fetch trending GIFs:', err);
//     }
//   };

//   const fetchRandomGif = async (emotionText) => {
//     if (!emotionText.trim()) {
//       setError('Please enter an emotion!');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setCurrentGif(null);

//     try {
//       const response = await fetch(`${API_BASE_URL}/gif/random`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ emotion: emotionText }),
//       });

//       if (response.ok) {
//         const gifData = await response.json();
//         setCurrentGif(gifData);
//         setShowTrending(false);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.detail || 'Failed to fetch GIF');
//       }
//     } catch (err) {
//       setError('Network error. Please check if backend is running.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = () => {
//     fetchRandomGif(emotion);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   const handleEmotionClick = (emotionText) => {
//     setEmotion(emotionText);
//     fetchRandomGif(emotionText);
//   };

//   const handleTrendingClick = (gif) => {
//     setCurrentGif(gif);
//     setShowTrending(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
//             🎭 GIF Reaction Picker
//           </h1>
//           <p className="text-white/90 text-lg md:text-xl">
//             Express your emotions with the perfect GIF!
//           </p>
//         </div>

//         {/* Search Section */}
//         <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
//           <div className="space-y-4">
//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
//               <input
//                 type="text"
//                 value={emotion}
//                 onChange={(e) => setEmotion(e.target.value)}
//                 onKeyPress={handleKeyPress}
//                 placeholder="Enter your emotion (e.g., happy, excited, confused)"
//                 className="w-full pl-12 pr-4 py-4 bg-white/30 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
//               />
//             </div>
//             <div className="flex gap-4">
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="flex-1 bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
//               >
//                 {loading ? '🔍 Finding GIF...' : '🎯 Get Random GIF'}
//               </button>
//               <button
//                 onClick={() => setShowTrending(!showTrending)}
//                 className="px-6 py-4 bg-white/20 border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-200"
//               >
//                 {showTrending ? 'Hide' : 'Trending'}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Popular Emotions */}
//         {popularEmotions.length > 0 && (
//           <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
//             <h2 className="text-xl font-semibold text-white mb-4">
//               🌟 Popular Emotions
//             </h2>
//             <div className="flex flex-wrap gap-2">
//               {popularEmotions.map((emotionText) => (
//                 <button
//                   key={emotionText}
//                   onClick={() => handleEmotionClick(emotionText)}
//                   className="flex items-center gap-2 px-4 py-2 bg-white/30 hover:bg-white/40 rounded-full text-white font-medium transition-all duration-200 capitalize"
//                 >
//                   {emotionIcons[emotionText]}
//                   {emotionText}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-500/20 backdrop-blur-lg border border-red-300 rounded-xl p-4 mb-8">
//             <p className="text-white font-medium">⚠️ {error}</p>
//           </div>
//         )}

//         {/* Trending GIFs */}
//         {showTrending && trendingGifs.length > 0 && (
//           <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
//             <h2 className="text-xl font-semibold text-white mb-4">
//               🔥 Trending GIFs
//             </h2>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//               {trendingGifs.map((gif) => (
//                 <div
//                   key={gif.id}
//                   onClick={() => handleTrendingClick(gif)}
//                   className="relative group cursor-pointer rounded-xl overflow-hidden bg-white/10 hover:scale-105 transition-transform duration-200"
//                 >
//                   <img
//                     src={gif.preview_url}
//                     alt={gif.title}
//                     className="w-full h-32 object-cover"
//                   />
//                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
//                     <span className="text-white font-medium text-sm text-center p-2">
//                       Click to view
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Current GIF Display */}
//         {currentGif && (
//           <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold text-white mb-4">
//                 🎬 Your Perfect GIF Reaction
//               </h2>
//               <div className="relative inline-block max-w-full">
//                 <img
//                   src={currentGif.url}
//                   alt={currentGif.title}
//                   className="max-w-full max-h-96 rounded-xl shadow-lg"
//                 />
//               </div>
//               {currentGif.title && (
//                 <p className="text-white/80 mt-4 text-lg font-medium">
//                   "{currentGif.title}"
//                 </p>
//               )}
//               <div className="flex gap-4 justify-center mt-6">
//                 <button
//                   onClick={() => fetchRandomGif(emotion || 'random')}
//                   className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200"
//                 >
//                   🎲 Get Another
//                 </button>
//                 <button
//                   onClick={() => window.open(currentGif.url, '_blank')}
//                   className="px-6 py-3 bg-white/20 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200"
//                 >
//                   📱 Open Full Size
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Footer */}
//         <div className="text-center mt-12">
//           <p className="text-white/70">
//             Powered by Giphy API • Made with ❤️ using React + FastAPI
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default GifReactionPicker;
import React, { useState, useEffect } from 'react';
import { Search, Heart, Smile, Frown, Zap, Star, Coffee, Music, AlertCircle, Loader2, ExternalLink, RotateCcw, TrendingUp, Sparkles } from 'lucide-react';

// API configuration - change this if your backend runs on a different port
const API_BASE_URL = 'http://127.0.0.1:8000';

const GifReactionPicker = () => {
  const [emotion, setEmotion] = useState('');
  const [currentGif, setCurrentGif] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [popularEmotions, setPopularEmotions] = useState([]);
  const [trendingGifs, setTrendingGifs] = useState([]);
  const [showTrending, setShowTrending] = useState(false);
  const [backendStatus, setBackendStatus] = useState('unknown');

  // Emotion icons mapping
  const emotionIcons = {
    happy: <Smile className="w-4 h-4" />,
    sad: <Frown className="w-4 h-4" />,
    excited: <Zap className="w-4 h-4" />,
    love: <Heart className="w-4 h-4" />,
    cool: <Star className="w-4 h-4" />,
    tired: <Coffee className="w-4 h-4" />,
    dance: <Music className="w-4 h-4" />,
    party: <Sparkles className="w-4 h-4" />,
    awesome: <Star className="w-4 h-4" />,
    funny: <Smile className="w-4 h-4" />
  };

  // Check backend status and fetch initial data
  useEffect(() => {
    checkBackendStatus();
    fetchPopularEmotions();
    fetchTrendingGifs();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(data.api_configured ? 'ready' : 'no-api-key');
      } else {
        setBackendStatus('error');
      }
    } catch (err) {
      setBackendStatus('offline');
      console.error('Backend status check failed:', err);
    }
  };

  const fetchPopularEmotions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/emotions`);
      if (response.ok) {
        const data = await response.json();
        setPopularEmotions(data.emotions || []);
      } else {
        console.error('Failed to fetch emotions, status:', response.status);
      }
    } catch (err) {
      console.error('Failed to fetch emotions:', err);
    }
  };

  const fetchTrendingGifs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gif/trending?limit=12`);
      if (response.ok) {
        const data = await response.json();
        setTrendingGifs(data.gifs || []);
      } else {
        console.error('Failed to fetch trending GIFs, status:', response.status);
      }
    } catch (err) {
      console.error('Failed to fetch trending GIFs:', err);
    }
  };

  const fetchRandomGif = async (emotionText) => {
    if (!emotionText.trim()) {
      setError('Please enter an emotion!');
      return;
    }

    if (backendStatus === 'offline') {
      setError('Backend server is not running. Please start the FastAPI server.');
      return;
    }

    if (backendStatus === 'no-api-key') {
      setError('Giphy API key not configured. Please add GIPHY_API_KEY to your .env file.');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentGif(null);

    try {
      const response = await fetch(`${API_BASE_URL}/gif/random`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emotion: emotionText }),
      });

      const responseData = await response.json();

      if (response.ok) {
        setCurrentGif(responseData);
        setShowTrending(false);
      } else {
        setError(responseData.detail || `HTTP ${response.status}: Failed to fetch GIF`);
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to backend server. Make sure it\'s running on http://127.0.0.1:8000');
      } else {
        setError(`Network error: ${err.message}`);
      }
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    fetchRandomGif(emotion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  const handleEmotionClick = (emotionText) => {
    setEmotion(emotionText);
    fetchRandomGif(emotionText);
  };

  const handleTrendingClick = (gif) => {
    setCurrentGif(gif);
    setShowTrending(false);
    setError('');
  };

  const getStatusIndicator = () => {
    switch (backendStatus) {
      case 'ready':
        return <div className="flex items-center gap-2 text-green-400"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Ready</div>;
      case 'no-api-key':
        return <div className="flex items-center gap-2 text-yellow-400"><AlertCircle className="w-4 h-4" /> Missing API Key</div>;
      case 'offline':
        return <div className="flex items-center gap-2 text-red-400"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Backend Offline</div>;
      case 'error':
        return <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-4 h-4" /> Backend Error</div>;
      default:
        return <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" /> Checking...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            🎭 GIF Reaction Picker
          </h1>
          <p className="text-white/90 text-lg md:text-xl mb-4">
            Express your emotions with the perfect GIF!
          </p>
          
          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full text-sm">
            <span className="text-white/70">Status:</span>
            {getStatusIndicator()}
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              <input
                type="text"
                value={emotion}
                onChange={(e) => setEmotion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your emotion (e.g., happy, excited, confused)"
                className="w-full pl-12 pr-4 py-4 bg-white/30 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                disabled={loading || backendStatus === 'offline'}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !emotion.trim() || backendStatus === 'offline'}
                className="flex-1 bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Finding GIF...
                  </>
                ) : (
                  <>
                    🎯 Get Random GIF
                  </>
                )}
              </button>
              <button
                onClick={() => setShowTrending(!showTrending)}
                disabled={backendStatus === 'offline'}
                className="px-6 py-4 bg-white/20 border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                {showTrending ? 'Hide' : 'Trending'}
              </button>
            </div>
          </div>
        </div>

        {/* Backend Status Warning */}
        {(backendStatus === 'offline' || backendStatus === 'no-api-key') && (
          <div className="bg-yellow-500/20 backdrop-blur-lg border border-yellow-300 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-300 mt-0.5" />
              <div>
                <p className="text-white font-medium">
                  {backendStatus === 'offline' 
                    ? '⚠️ Backend Server Not Running' 
                    : '⚠️ API Key Missing'
                  }
                </p>
                <p className="text-white/80 text-sm mt-1">
                  {backendStatus === 'offline' 
                    ? 'Please start the FastAPI server with: python main.py'
                    : 'Please add your GIPHY_API_KEY to the .env file in your backend directory'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Popular Emotions */}
        {popularEmotions.length > 0 && (
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Popular Emotions
            </h2>
            <div className="flex flex-wrap gap-2">
              {popularEmotions.map((emotionText) => (
                <button
                  key={emotionText}
                  onClick={() => handleEmotionClick(emotionText)}
                  disabled={loading || backendStatus === 'offline'}
                  className="flex items-center gap-2 px-4 py-2 bg-white/30 hover:bg-white/40 rounded-full text-white font-medium transition-all duration-200 capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emotionIcons[emotionText] || <Smile className="w-4 h-4" />}
                  {emotionText}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-300 rounded-xl p-4 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-300 mt-0.5" />
              <p className="text-white font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Trending GIFs */}
        {showTrending && trendingGifs.length > 0 && (
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 mb-8 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Trending GIFs
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trendingGifs.map((gif) => (
                <div
                  key={gif.id}
                  onClick={() => handleTrendingClick(gif)}
                  className="relative group cursor-pointer rounded-xl overflow-hidden bg-white/10 hover:scale-105 transition-transform duration-200"
                >
                  <img
                    src={gif.preview_url}
                    alt={gif.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="text-white font-medium text-sm text-center p-2">
                      Click to view
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current GIF Display */}
        {currentGif && (
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                🎬 Your Perfect GIF Reaction
              </h2>
              <div className="relative inline-block max-w-full">
                <img
                  src={currentGif.url}
                  alt={currentGif.title}
                  className="max-w-full max-h-96 rounded-xl shadow-lg"
                  onError={(e) => {
                    setError('Failed to load GIF image');
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              {currentGif.title && (
                <p className="text-white/80 mt-4 text-lg font-medium">
                  "{currentGif.title}"
                </p>
              )}
              <p className="text-white/60 text-sm mt-2">
                {currentGif.width} × {currentGif.height} pixels
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-6">
                <button
                  onClick={() => fetchRandomGif(emotion || 'random')}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Get Another
                </button>
                <button
                  onClick={() => window.open(currentGif.url, '_blank')}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 border border-white/30 text-white rounded-xl font-semibold hover:bg-white/30 transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Full Size
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-white/70 mb-2">
            Powered by Giphy API • Made with ❤️ using React + FastAPI
          </p>
          <div className="flex justify-center gap-4 text-white/50 text-sm">
            <span>Backend: {API_BASE_URL}</span>
            <span>•</span>
            <span>Status: {backendStatus}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GifReactionPicker;