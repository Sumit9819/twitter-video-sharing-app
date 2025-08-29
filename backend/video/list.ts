import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import { videoDB } from "./db";
import type { Video } from "./types";

interface ListVideosRequest {
  limit?: Query<number>;
  offset?: Query<number>;
}

interface ListVideosResponse {
  videos: Video[];
  total: number;
}

// Retrieves all videos with pagination.
export const listVideos = api<ListVideosRequest, ListVideosResponse>(
  { expose: true, method: "GET", path: "/videos" },
  async (req) => {
    const limit = req.limit || 20;
    const offset = req.offset || 0;

    const videos = await videoDB.queryAll<{
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
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalResult = await videoDB.queryRow<{ count: number }>`
      SELECT COUNT(*) as count FROM videos
    `;

    const total = totalResult?.count || 0;

    return {
      videos: videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description || undefined,
        videoUrl: video.video_url,
        thumbnailUrl: video.thumbnail_url,
        destinationUrl: video.destination_url,
        createdAt: video.created_at,
        updatedAt: video.updated_at,
      })),
      total,
    };
  }
);
