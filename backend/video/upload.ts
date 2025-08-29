import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { videoDB } from "./db";
import { videoBucket } from "./storage";
import type { CreateVideoRequest, UploadVideoResponse } from "./types";

interface AuthenticatedCreateVideoRequest extends CreateVideoRequest {
  authorization?: Header<"Authorization">;
}

// Creates a new video record and returns a signed upload URL.
export const createVideo = api<AuthenticatedCreateVideoRequest, UploadVideoResponse>(
  { expose: true, method: "POST", path: "/videos" },
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

    // Insert video record into database
    const result = await videoDB.queryRow<{ id: number }>`
      INSERT INTO videos (title, description, video_url, thumbnail_url, destination_url)
      VALUES (${req.title}, ${req.description || null}, '', '', ${req.destinationUrl})
      RETURNING id
    `;

    if (!result) {
      throw new Error("Failed to create video record");
    }

    const videoId = result.id;
    const videoFileName = `video-${videoId}.mp4`;

    // Generate signed upload URL for the video
    const { url: uploadUrl } = await videoBucket.signedUploadUrl(videoFileName, {
      ttl: 3600, // 1 hour
    });

    return {
      uploadUrl,
      videoId,
    };
  }
);
