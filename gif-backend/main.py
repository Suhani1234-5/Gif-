from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import random
from typing import Optional, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="GIF Reaction Picker API", version="1.0.0")

# CORS middleware to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # More permissive for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic models
class EmotionRequest(BaseModel):
    emotion: str

class GifResponse(BaseModel):
    id: str
    title: str
    url: str
    preview_url: str
    width: int
    height: int

class TrendingResponse(BaseModel):
    gifs: List[GifResponse]

class EmotionsResponse(BaseModel):
    emotions: List[str]

# Giphy API configuration
GIPHY_API_KEY = os.getenv("GIPHY_API_KEY", "your_giphy_api_key_here")
GIPHY_BASE_URL = "https://api.giphy.com/v1/gifs"

# Demo mode fallback data
DEMO_GIFS = [
    {
        "id": "demo1",
        "title": "Happy Demo GIF",
        "url": "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
        "preview_url": "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/200w.gif",
        "width": 480,
        "height": 270
    },
    {
        "id": "demo2", 
        "title": "Excited Demo GIF",
        "url": "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
        "preview_url": "https://media.giphy.com/media/5GoVLqeAOo6PK/200w.gif",
        "width": 500,
        "height": 281
    },
    {
        "id": "demo3",
        "title": "Celebration Demo GIF", 
        "url": "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
        "preview_url": "https://media.giphy.com/media/26u4cqiYI30juCOGY/200w.gif",
        "width": 480,
        "height": 360
    }
]

def is_demo_mode():
    """Check if we're running in demo mode (no API key)"""
    return GIPHY_API_KEY == "your_giphy_api_key_here" or not GIPHY_API_KEY

@app.get("/")
async def root():
    """Health check endpoint"""
    mode = "demo" if is_demo_mode() else "production"
    return {
        "message": "GIF Reaction Picker API is running!", 
        "status": "healthy",
        "mode": mode,
        "api_key_configured": not is_demo_mode()
    }

@app.post("/gif/random", response_model=GifResponse)
async def get_random_gif(request: EmotionRequest):
    """
    Get a random GIF based on emotion/keyword
    """
    emotion = request.emotion.strip().lower()
    if not emotion:
        raise HTTPException(
            status_code=400, 
            detail="Emotion cannot be empty"
        )
    
    # Demo mode - return random demo GIF
    if is_demo_mode():
        logger.info(f"Demo mode: Returning demo GIF for emotion: {emotion}")
        demo_gif = random.choice(DEMO_GIFS)
        return GifResponse(**demo_gif)
    
    logger.info(f"Searching for GIFs with emotion: {emotion}")
    
    try:
        # Search for GIFs using Giphy API
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "api_key": GIPHY_API_KEY,
                "q": emotion,
                "limit": 25,
                "rating": "pg-13", 
                "lang": "en",
                "fmt": "json"
            }
            
            response = await client.get(f"{GIPHY_BASE_URL}/search", params=params)
            response.raise_for_status()
            
            data = response.json()
            gifs = data.get("data", [])
            
            if not gifs:
                # Fallback to trending if no results
                logger.info(f"No GIFs found for '{emotion}', trying trending instead")
                trending_params = {
                    "api_key": GIPHY_API_KEY,
                    "limit": 25,
                    "rating": "pg-13",
                    "fmt": "json"
                }
                response = await client.get(f"{GIPHY_BASE_URL}/trending", params=trending_params)
                response.raise_for_status()
                data = response.json()
                gifs = data.get("data", [])
                
                if not gifs:
                    # Final fallback to demo data
                    logger.warning("No GIFs from API, using demo data")
                    demo_gif = random.choice(DEMO_GIFS)
                    return GifResponse(**demo_gif)
            
            # Pick a random GIF
            selected_gif = random.choice(gifs)
            
            # Safely extract GIF information with fallbacks
            try:
                images = selected_gif.get("images", {})
                original_image = images.get("original", {})
                preview_image = images.get("preview_gif") or images.get("fixed_width_small") or original_image
                
                gif_data = GifResponse(
                    id=selected_gif.get("id", "unknown"),
                    title=selected_gif.get("title", "Untitled GIF"),
                    url=original_image.get("url", ""),
                    preview_url=preview_image.get("url", original_image.get("url", "")),
                    width=int(original_image.get("width", 480)),
                    height=int(original_image.get("height", 270))
                )
                
                logger.info(f"Successfully found GIF: {gif_data.id}")
                return gif_data
                
            except (KeyError, ValueError, TypeError) as e:
                logger.error(f"Error parsing GIF data: {e}")
                # Fallback to demo data on parsing error
                demo_gif = random.choice(DEMO_GIFS)
                return GifResponse(**demo_gif)
            
    except httpx.TimeoutException:
        logger.error("Timeout while fetching GIF from Giphy")
        # Return demo data instead of error
        demo_gif = random.choice(DEMO_GIFS)
        return GifResponse(**demo_gif)
    except httpx.HTTPStatusError as e:
        logger.error(f"HTTP error from Giphy API: {e.response.status_code}")
        # Return demo data instead of error
        demo_gif = random.choice(DEMO_GIFS)
        return GifResponse(**demo_gif)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        # Return demo data instead of error
        demo_gif = random.choice(DEMO_GIFS)
        return GifResponse(**demo_gif)

@app.get("/gif/trending", response_model=TrendingResponse)
async def get_trending_gifs(limit: int = 10):
    """
    Get trending GIFs
    """
    # Validate limit
    limit = min(max(limit, 1), 25)
    
    # Demo mode
    if is_demo_mode():
        logger.info("Demo mode: Returning demo trending GIFs")
        demo_gifs = [GifResponse(**gif) for gif in DEMO_GIFS[:limit]]
        return TrendingResponse(gifs=demo_gifs)
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            params = {
                "api_key": GIPHY_API_KEY,
                "limit": limit,
                "rating": "pg-13",
                "fmt": "json"
            }
            
            response = await client.get(f"{GIPHY_BASE_URL}/trending", params=params)
            response.raise_for_status()
            
            data = response.json()
            gifs = data.get("data", [])
            
            trending_gifs = []
            for gif in gifs:
                try:
                    images = gif.get("images", {})
                    original_image = images.get("original", {})
                    preview_image = images.get("preview_gif") or images.get("fixed_width_small") or original_image
                    
                    gif_data = GifResponse(
                        id=gif.get("id", "unknown"),
                        title=gif.get("title", "Untitled GIF"),
                        url=original_image.get("url", ""),
                        preview_url=preview_image.get("url", original_image.get("url", "")),
                        width=int(original_image.get("width", 480)),
                        height=int(original_image.get("height", 270))
                    )
                    trending_gifs.append(gif_data)
                except (KeyError, ValueError, TypeError) as e:
                    logger.warning(f"Skipping malformed GIF data: {e}")
                    continue
            
            return TrendingResponse(gifs=trending_gifs)
            
    except Exception as e:
        logger.error(f"Error fetching trending GIFs: {e}")
        # Fallback to demo data
        demo_gifs = [GifResponse(**gif) for gif in DEMO_GIFS[:limit]]
        return TrendingResponse(gifs=demo_gifs)

@app.get("/emotions", response_model=EmotionsResponse)
async def get_popular_emotions():
    """
    Get a list of popular emotions for quick selection
    """
    emotions = [
        "happy", "sad", "excited", "angry", "surprised", "confused",
        "love", "laugh", "cry", "dance", "celebrate", "tired",
        "shocked", "nervous", "proud", "grateful", "silly", "cool",
        "amazing", "awesome", "funny", "cute", "mind blown", "facepalm"
    ]
    return EmotionsResponse(emotions=emotions)

@app.get("/test")
async def test_api_connection():
    """
    Test the API connection and configuration
    """
    if is_demo_mode():
        return {
            "status": "demo",
            "message": "Running in demo mode - no Giphy API key configured",
            "api_key_present": False,
            "demo_data_available": True
        }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            params = {
                "api_key": GIPHY_API_KEY,
                "limit": 1,
                "fmt": "json"
            }
            
            response = await client.get(f"{GIPHY_BASE_URL}/trending", params=params)
            response.raise_for_status()
            
            return {
                "status": "success",
                "message": "Giphy API connection successful",
                "api_key_present": True,
                "response_status": response.status_code
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Giphy API connection failed: {str(e)}",
            "api_key_present": True,
            "fallback_available": True
        }

if __name__ == "__main__":
    import uvicorn
    print("Starting GIF Reaction Picker API...")
    print(f"Mode: {'Demo' if is_demo_mode() else 'Production'}")
    print(f"Giphy API Key present: {not is_demo_mode()}")
    print("Server will run on: http://localhost:8000")
    print("API docs available at: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)