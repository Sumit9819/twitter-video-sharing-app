import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Copy, ExternalLink, Twitter, CheckCircle } from 'lucide-react';
import backend from '~backend/client';
import type { Video } from '~backend/video/types';

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadVideo(parseInt(id));
    }
  }, [id]);

  const loadVideo = async (videoId: number) => {
    try {
      const videoData = await backend.video.getVideo({ id: videoId });
      setVideo(videoData);
    } catch (error) {
      console.error('Failed to load video:', error);
      toast({
        title: 'Error',
        description: 'Failed to load video. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const shareUrl = video ? `${window.location.origin}/videos/${video.id}` : '';

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Share URL copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: 'Copy failed',
        description: 'Failed to copy URL to clipboard',
        variant: 'destructive',
      });
    }
  };

  const shareOnTwitter = () => {
    if (video) {
      const tweetText = `Check out this video: ${video.title}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="aspect-video bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h1>
          <p className="text-gray-600 mb-6">The video you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Meta tags for Twitter Card */}
      <head>
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={video.title} />
        <meta name="twitter:description" content={video.description || 'Watch this video'} />
        <meta name="twitter:player" content={`${window.location.origin}/player/${video.id}`} />
        <meta name="twitter:image" content={video.thumbnailUrl} />
        <meta name="twitter:player:width" content="1280" />
        <meta name="twitter:player:height" content="720" />
        
        <meta property="og:title" content={video.title} />
        <meta property="og:description" content={video.description || 'Watch this video'} />
        <meta property="og:image" content={video.thumbnailUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="video.other" />
      </head>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
                <video
                  src={video.videoUrl}
                  poster={video.thumbnailUrl}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{video.title}</h1>
                {video.description && (
                  <p className="text-gray-700 mb-4">{video.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Uploaded {new Date(video.createdAt).toLocaleDateString()}</span>
                  <a
                    href={video.destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit destination
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Share this video</CardTitle>
                  <CardDescription>
                    Share on Twitter to show an embedded video player
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="shareUrl">Share URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="shareUrl"
                        value={shareUrl}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={copyToClipboard}
                        className="shrink-0"
                      >
                        {copied ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={shareOnTwitter}
                    className="w-full gap-2 bg-blue-500 hover:bg-blue-600"
                  >
                    <Twitter className="w-4 h-4" />
                    Share on Twitter
                  </Button>

                  <div className="text-sm text-gray-600 space-y-2">
                    <p className="font-medium">How it works:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Copy the share URL above</li>
                      <li>• Paste it in a Twitter post</li>
                      <li>• Twitter will show an embedded video player</li>
                      <li>• Clicking the video redirects to your destination URL</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
