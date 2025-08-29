import { api, APIError } from "encore.dev/api";
import { Header } from "encore.dev/api";
import { videoDB } from "./db";
import { videoBucket } from "./storage";
import { auth } from "~encore/clients";
import type { CreateVideoRequest, UploadVideoResponse } from "./types";

interface AuthenticatedCreateVideoRequest extends CreateVideoRequest {
  authorization: Header<"Authorization">;
}

// Creates a new video record and returns a signed upload URL.
export const createVideo = api<AuthenticatedCreateVideoRequest, UploadVideoResponse>(
  { expose: true, method: "POST", path: "/videos" },
  async (req) => {
    // Verify authentication
    const authResult = await auth.verifyToken({ authorization: req.authorization });
    
    if (!authResult.valid || !authResult.user?.isAdmin) {
      throw APIError.unauthenticated("Admin access required");
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
