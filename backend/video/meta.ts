import { api } from "encore.dev/api";
import { videoDB } from "./db";

interface GetVideoMetaRequest {
  id: number;
}

interface VideoMetaResponse {
  html: string;
}

// Generates HTML with proper meta tags for Twitter cards.
export const getVideoMeta = api<GetVideoMetaRequest, VideoMetaResponse>(
  { expose: true, method: "GET", path: "/videos/:id/meta" },
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
  <title>Video Not Found</title>
  <meta name="description" content="The requested video was not found.">
</head>
<body>
  <h1>Video Not Found</h1>
  <p>The video you're looking for doesn't exist.</p>
</body>
</html>`
      };
    }

    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : 'http://localhost:4000';
    
    const videoUrl = `${baseUrl}/videos/${video.id}`;
    const playerUrl = `${baseUrl}/player/${video.id}`;
    const description = video.description || `Watch ${video.title}`;

    return {
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${video.title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="video.other">
  <meta property="og:url" content="${videoUrl}">
  <meta property="og:title" content="${video.title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${video.thumbnail_url}">
  <meta property="og:video" content="${video.video_url}">
  <meta property="og:video:secure_url" content="${video.video_url}">
  <meta property="og:video:type" content="video/mp4">
  <meta property="og:video:width" content="1280">
  <meta property="og:video:height" content="720">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="player">
  <meta name="twitter:url" content="${videoUrl}">
  <meta name="twitter:title" content="${video.title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${video.thumbnail_url}">
  <meta name="twitter:player" content="${playerUrl}">
  <meta name="twitter:player:width" content="1280">
  <meta name="twitter:player:height" content="720">
  <meta name="twitter:player:stream" content="${video.video_url}">
  <meta name="twitter:player:stream:content_type" content="video/mp4">
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .video-container {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      background: #000;
    }
    video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .content {
      padding: 20px;
    }
    h1 {
      margin: 0 0 10px 0;
      color: #333;
    }
    p {
      color: #666;
      line-height: 1.5;
      margin: 0 0 15px 0;
    }
    .cta {
      display: inline-block;
      background: #1da1f2;
      color: white;
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
    }
    .cta:hover {
      background: #1991db;
    }
  </style>
  
  <script>
    // Redirect to destination URL after a short delay
    setTimeout(function() {
      window.location.href = '${video.destination_url}';
    }, 3000);
  </script>
</head>
<body>
  <div class="container">
    <div class="video-container">
      <video controls poster="${video.thumbnail_url}">
        <source src="${video.video_url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    </div>
    <div class="content">
      <h1>${video.title}</h1>
      <p>${description}</p>
      <a href="${video.destination_url}" class="cta">Continue Reading →</a>
      <p><small>You will be automatically redirected in 3 seconds...</small></p>
    </div>
  </div>
</body>
</html>`
      };
    }
  );
