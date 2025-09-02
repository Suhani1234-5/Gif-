from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import random
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI(title="GIF Reaction Picker API", version="1.0.0")

# CORS middleware to allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
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

# Giphy API configuration
GIPHY_API_KEY = os.getenv("GIPHY_API_KEY")
GIPHY_BASE_URL = "https://api.giphy.com/v1/gifs"

if not GIPHY_API_KEY:
    print("Warning: GIPHY_API_KEY not found in environment variables")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "GIF Reaction Picker API is running!"}

@app.post("/gif/random", response_model=GifResponse)
async def get_random_gif(request: EmotionRequest):
    """
    Get a random GIF based on emotion/keyword
    """
    if not GIPHY_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Giphy API key not configured"
        )
    
    emotion = request.emotion.strip()
    if not emotion:
        raise HTTPException(
            status_code=400, 
            detail="Emotion cannot be empty"
        )
    
    try:
        # Search for GIFs using Giphy API
        async with httpx.AsyncClient() as client:
            params = {
                "api_key": GIPHY_API_KEY,
                "q": emotion,
                "limit": 50,  # Get multiple results to pick random
                "rating": "pg-13",
                "lang": "en"
            }
            
            response = await client.get(f"{GIPHY_BASE_URL}/search", params=params)
            response.raise_for_status()
            
            data = response.json()
            gifs = data.get("data", [])
            
            if not gifs:
                raise HTTPException(
                    status_code=404, 
                    detail=f"No GIFs found for emotion: {emotion}"
                )
            
            # Pick a random GIF
            selected_gif = random.choice(gifs)
            
            # Extract GIF information
            gif_data = GifResponse(
                id=selected_gif["id"],
                title=selected_gif.get("title", ""),
                url=selected_gif["images"]["original"]["url"],
                preview_url=selected_gif["images"]["preview_gif"]["url"],
                width=int(selected_gif["images"]["original"]["width"]),
                height=int(selected_gif["images"]["original"]["height"])
            )
            
            return gif_data
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching GIF from Giphy: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error: {str(e)}"
        )

@app.get("/gif/trending")
async def get_trending_gifs(limit: int = 10):
    """
    Get trending GIFs
    """
    if not GIPHY_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Giphy API key not configured"
        )
    
    try:
        async with httpx.AsyncClient() as client:
            params = {
                "api_key": GIPHY_API_KEY,
                "limit": min(limit, 25),  # Max 25 as per Giphy limits
                "rating": "pg-13"
            }
            
            response = await client.get(f"{GIPHY_BASE_URL}/trending", params=params)
            response.raise_for_status()
            
            data = response.json()
            gifs = data.get("data", [])
            
            trending_gifs = []
            for gif in gifs:
                gif_data = {
                    "id": gif["id"],
                    "title": gif.get("title", ""),
                    "url": gif["images"]["original"]["url"],
                    "preview_url": gif["images"]["preview_gif"]["url"],
                    "width": int(gif["images"]["original"]["width"]),
                    "height": int(gif["images"]["original"]["height"])
                }
                trending_gifs.append(gif_data)
            
            return {"gifs": trending_gifs}
            
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching trending GIFs: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error: {str(e)}"
        )

@app.get("/emotions")
async def get_popular_emotions():
    """
    Get a list of popular emotions for quick selection
    """
    emotions = [
        "happy", "sad", "excited", "angry", "surprised", "confused",
        "love", "laugh", "cry", "dance", "celebrate", "tired",
        "shocked", "nervous", "proud", "grateful", "silly", "cool"
    ]
    return {"emotions": emotions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)