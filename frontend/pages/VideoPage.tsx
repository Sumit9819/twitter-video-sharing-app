import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Copy, ExternalLink, Twitter, CheckCircle, Globe } from 'lucide-react';
import backend from '~backend/client';
import type { Video } from '~backend/video/types';

export default function VideoPage() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const baseUrl = window.location.origin;
  const shareUrl = video ? `${baseUrl}/api/video/meta/${video.id}` : '';
  const playerUrl = video ? `${baseUrl}/api/video/player/${video.id}` : '';
  const frontendUrl = video ? `${baseUrl}/videos/${video.id}` : '';

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

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: 'Copied!',
        description: `${type} URL copied to clipboard`,
      });
      setTimeout(() => setCopied(null), 2000);
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

  const testTwitterCard = () => {
    const cardValidatorUrl = `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(shareUrl)}`;
    window.open(cardValidatorUrl, '_blank');
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

          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Share on Twitter</CardTitle>
                <CardDescription>
                  Use this URL to share on Twitter with an embedded video player
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter Share URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="twitterUrl"
                      value={shareUrl}
                      readOnly
                      className="flex-1 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(shareUrl, 'Twitter')}
                      className="shrink-0"
                    >
                      {copied === 'Twitter' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={shareOnTwitter}
                    className="flex-1 gap-2 bg-blue-500 hover:bg-blue-600"
                  >
                    <Twitter className="w-4 h-4" />
                    Share on Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={testTwitterCard}
                    className="gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Test Card
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional URLs</CardTitle>
                <CardDescription>
                  Other URLs for testing and sharing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="playerUrl">Player URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="playerUrl"
                      value={playerUrl}
                      readOnly
                      className="flex-1 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(playerUrl, 'Player')}
                      className="shrink-0"
                    >
                      {copied === 'Player' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frontendUrl">Frontend URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="frontendUrl"
                      value={frontendUrl}
                      readOnly
                      className="flex-1 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(frontendUrl, 'Frontend')}
                      className="shrink-0"
                    >
                      {copied === 'Frontend' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How to use</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-3">
                <div>
                  <p className="font-medium text-gray-900 mb-1">For Twitter:</p>
                  <ol className="space-y-1 text-xs list-decimal list-inside">
                    <li>Copy the "Twitter Share URL" above</li>
                    <li>Paste it in a new Twitter post</li>
                    <li>Twitter will automatically generate a video card</li>
                    <li>Clicking the video redirects to your destination URL</li>
                  </ol>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-1">Testing:</p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>Use the "Test Card" button to validate with Twitter</li>
                    <li>Twitter may take a few minutes to fetch the card</li>
                    <li>Make sure your video URLs are publicly accessible</li>
                  </ul>
                </div>

                <div className="border-t pt-3">
                  <p className="font-medium text-gray-900 mb-1">Troubleshooting:</p>
                  <ul className="space-y-1 text-xs list-disc list-inside">
                    <li>Clear Twitter's cache using the Card Validator</li>
                    <li>Ensure video files are properly uploaded and processed</li>
                    <li>Check that all URLs return 200 status codes</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
