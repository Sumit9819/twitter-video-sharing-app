import { api, APIError } from "encore.dev/api";
import { videoDB } from "./db";
import type { Video, VideoMetadata } from "./types";

interface GetVideoRequest {
  id: number;
}

// Retrieves a video by ID.
export const getVideo = api<GetVideoRequest, Video>(
  { expose: true, method: "GET", path: "/videos/:id" },
  async (req) => {
    const video = await videoDB.queryRow<{
      id: number;
      title: string;
      description: string | null;
      video_url: string;
      thumbnail_url: string;
      destination_url: string;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, title, description, video_url, thumbnail_url, destination_url, created_at, updated_at
      FROM videos 
      WHERE id = ${req.id}
    `;

    if (!video) {
      throw APIError.notFound("Video not found");
    }

    return {
      id: video.id,
      title: video.title,
      description: video.description || undefined,
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url,
      destinationUrl: video.destination_url,
      createdAt: video.created_at,
      updatedAt: video.updated_at,
    };
  }
);

// Retrieves video metadata for Twitter cards.
export const getVideoMetadata = api<GetVideoRequest, VideoMetadata>(
  { expose: true, method: "GET", path: "/videos/:id/metadata" },
  async (req) => {
    const video = await videoDB.queryRow<{
      title: string;
      description: string | null;
      video_url: string;
      thumbnail_url: string;
      destination_url: string;
    }>`
      SELECT title, description, video_url, thumbnail_url, destination_url
      FROM videos 
      WHERE id = ${req.id}
    `;

    if (!video) {
      throw APIError.notFound("Video not found");
    }

    return {
      title: video.title,
      description: video.description || undefined,
      videoUrl: video.video_url,
      thumbnailUrl: video.thumbnail_url,
      destinationUrl: video.destination_url,
    };
  }
);
