import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import backend from '~backend/client';
import type { VideoMetadata } from '~backend/video/types';

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVideoMetadata(parseInt(id));
    }
  }, [id]);

  const loadVideoMetadata = async (videoId: number) => {
    try {
      const metadata = await backend.video.getVideoMetadata({ id: videoId });
      setVideo(metadata);
    } catch (error) {
      console.error('Failed to load video metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (video) {
      // Redirect to the destination URL when clicked
      window.top.location.href = video.destinationUrl;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <p className="text-white">Video not found</p>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full bg-gray-900 relative cursor-pointer group"
      onClick={handleClick}
      style={{
        backgroundImage: `url(${video.thumbnailUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-200"></div>
      
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:bg-opacity-100 group-hover:scale-110 transition-all duration-200">
          <Play className="w-8 h-8 text-gray-900 ml-1" />
        </div>
      </div>

      {/* Title overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <h3 className="text-white font-semibold text-lg">{video.title}</h3>
        {video.description && (
          <p className="text-gray-300 text-sm mt-1 line-clamp-2">{video.description}</p>
        )}
      </div>
    </div>
  );
}
