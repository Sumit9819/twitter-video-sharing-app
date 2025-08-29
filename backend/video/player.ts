import { api } from "encore.dev/api";
import { videoDB } from "./db";

interface GetPlayerRequest {
  id: number;
}

interface PlayerResponse {
  html: string;
}

// Generates embeddable player HTML for Twitter cards.
export const getPlayer = api<GetPlayerRequest, PlayerResponse>(
  { expose: true, method: "GET", path: "/player/:id" },
  async (req) => {
    const video = await videoDB.queryRow<{
      id: number;
      title: string;
      description: string | null;
      video_url: string;
      thumbnail_url: string;
      destination_url: string;
    }>`
      SELECT id, title, description, video_url, thumbnail_url, destination_url
      FROM videos 
      WHERE id = ${req.id}
    `;

    if (!video) {
      return {
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Video Not Found</title>
  <style>
    body { margin: 0; padding: 0; background: #000; color: white; font-family: Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }
  </style>
</head>
<body>
  <div>Video not found</div>
</body>
</html>`
      };
    }

    const description = video.description || `Watch ${video.title}`;

    return {
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${video.title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #000;
    }
    
    .player-container {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .thumbnail {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }
    
    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    }
    
    .player-container:hover .play-overlay {
      background: rgba(0, 0, 0, 0.3);
    }
    
    .play-button {
      width: 80px;
      height: 80px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .player-container:hover .play-button {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.1);
    }
    
    .play-icon {
      width: 0;
      height: 0;
      border-left: 25px solid #333;
      border-top: 15px solid transparent;
      border-bottom: 15px solid transparent;
      margin-left: 5px;
    }
    
    .video-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      color: white;
      padding: 40px 20px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .video-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 5px;
      line-height: 1.3;
    }
    
    .video-description {
      font-size: 14px;
      opacity: 0.9;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    @media (max-width: 480px) {
      .play-button {
        width: 60px;
        height: 60px;
      }
      
      .play-icon {
        border-left-width: 20px;
        border-top-width: 12px;
        border-bottom-width: 12px;
        margin-left: 4px;
      }
      
      .video-title {
        font-size: 16px;
      }
      
      .video-description {
        font-size: 13px;
      }
    }
  </style>
</head>
<body>
  <div class="player-container" onclick="redirectToDestination()">
    <img src="${video.thumbnail_url}" alt="${video.title}" class="thumbnail">
    <div class="play-overlay">
      <div class="play-button">
        <div class="play-icon"></div>
      </div>
    </div>
    <div class="video-info">
      <div class="video-title">${video.title}</div>
      <div class="video-description">${description}</div>
    </div>
  </div>

  <script>
    function redirectToDestination() {
      // For iframe context, try to redirect parent window
      if (window.parent && window.parent !== window) {
        try {
          window.parent.location.href = '${video.destination_url}';
        } catch (e) {
          // If cross-origin, open in new tab
          window.open('${video.destination_url}', '_blank');
        }
      } else {
        // Direct navigation
        window.location.href = '${video.destination_url}';
      }
    }
    
    // Allow keyboard interaction
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        redirectToDestination();
      }
    });
    
    // Make container focusable for accessibility
    document.querySelector('.player-container').setAttribute('tabindex', '0');
  </script>
</body>
</html>`
      };
    }
  );
