import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Play, ExternalLink } from 'lucide-react';
import backend from '~backend/client';
import type { Video } from '~backend/video/types';

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await backend.video.listVideos({
        limit: 20,
        offset: 0,
      });
      setVideos(response.videos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video Sharing Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Share videos on Twitter with embedded players that drive traffic to your site
          </p>
          <Link to="/upload">
            <Button size="lg" className="gap-2">
              <Upload className="w-5 h-5" />
              Upload Video
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Videos</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
                <p className="text-gray-600 mb-4">Upload your first video to get started</p>
                <Link to="/upload">
                  <Button>Upload Video</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <Card key={video.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-video bg-gray-900 rounded-t-lg overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {video.description || 'No description'}
                    </CardDescription>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(video.createdAt)}
                      </span>
                      <div className="flex gap-2">
                        <Link to={`/videos/${video.id}`}>
                          <Button variant="outline" size="sm" className="gap-1">
                            <ExternalLink className="w-4 h-4" />
                            Share
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
