import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { videoDB } from "./db";
import { videoBucket, thumbnailBucket } from "./storage";

interface ProcessVideoRequest {
  videoId: number;
  authorization: Header<"Authorization">;
}

interface ProcessVideoResponse {
  success: boolean;
  videoUrl: string;
  thumbnailUrl: string;
}

// Processes an uploaded video and generates thumbnail.
export const processVideo = api<ProcessVideoRequest, ProcessVideoResponse>(
  { expose: true, method: "POST", path: "/videos/:videoId/process" },
  async (req) => {
    // Simple token verification (matching the auth service logic)
    const token = req.authorization?.replace("Bearer ", "");
    
    if (!token) {
      throw APIError.unauthenticated("Missing authentication token");
    }

    try {
      // Decode the simple token (matching auth service logic)
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [user, timestamp] = decoded.split(':');
      
      if (user !== 'admin') {
        throw APIError.unauthenticated("Invalid token");
      }

      // Check if token is not older than 24 hours
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (now - tokenTime > twentyFourHours) {
        throw APIError.unauthenticated("Token expired");
      }
    } catch (error) {
      throw APIError.unauthenticated("Invalid authentication token");
    }

    const video = await videoDB.queryRow<{ id: number; title: string }>`
      SELECT id, title FROM videos WHERE id = ${req.videoId}
    `;

    if (!video) {
      throw APIError.notFound("Video not found");
    }

    const videoFileName = `video-${req.videoId}.mp4`;
    const thumbnailFileName = `thumbnail-${req.videoId}.jpg`;

    // Check if video file exists
    const videoExists = await videoBucket.exists(videoFileName);
    if (!videoExists) {
      throw APIError.notFound("Video file not found");
    }

    // Generate public URLs
    const videoUrl = videoBucket.publicUrl(videoFileName);
    
    // For now, we'll create a simple placeholder thumbnail
    // In a real implementation, you would extract a frame from the video
    const placeholderThumbnail = Buffer.from(
      `<svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="48" font-family="Arial">
          ${video.title}
        </text>
        <circle cx="640" cy="360" r="60" fill="rgba(255,255,255,0.8)"/>
        <polygon points="620,340 620,380 660,360" fill="#1a1a1a"/>
      </svg>`,
      'utf-8'
    );

    // Upload thumbnail
    await thumbnailBucket.upload(thumbnailFileName, placeholderThumbnail, {
      contentType: 'image/svg+xml',
    });

    const thumbnailUrl = thumbnailBucket.publicUrl(thumbnailFileName);

    // Update video record with URLs
    await videoDB.exec`
      UPDATE videos 
      SET video_url = ${videoUrl}, thumbnail_url = ${thumbnailUrl}, updated_at = NOW()
      WHERE id = ${req.videoId}
    `;

    return {
      success: true,
      videoUrl,
      thumbnailUrl,
    };
  }
);
