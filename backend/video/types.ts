export interface Video {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  destinationUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVideoRequest {
  title: string;
  description?: string;
  destinationUrl: string;
}

export interface UploadVideoResponse {
  uploadUrl: string;
  videoId: number;
}

export interface VideoMetadata {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  destinationUrl: string;
}
