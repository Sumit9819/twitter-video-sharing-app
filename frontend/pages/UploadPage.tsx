import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import backend from '~backend/client';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [videoId, setVideoId] = useState<number | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        setFile(selectedFile);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please select a video file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !destinationUrl.trim() || !file) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields and select a video file.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Create video record and get upload URL
      const createResponse = await backend.video.createVideo({
        title: title.trim(),
        description: description.trim() || undefined,
        destinationUrl: destinationUrl.trim(),
      });

      setVideoId(createResponse.videoId);

      // Upload video file
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          setUploading(false);
          setProcessing(true);
          
          try {
            // Process the uploaded video
            await backend.video.processVideo({ videoId: createResponse.videoId });
            setProcessing(false);
            setCompleted(true);
            
            toast({
              title: 'Upload successful',
              description: 'Your video has been uploaded and processed successfully.',
            });
          } catch (error) {
            console.error('Failed to process video:', error);
            toast({
              title: 'Processing failed',
              description: 'Video uploaded but processing failed. Please try again.',
              variant: 'destructive',
            });
            setProcessing(false);
          }
        } else {
          throw new Error('Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        setUploading(false);
        toast({
          title: 'Upload failed',
          description: 'Failed to upload video. Please try again.',
          variant: 'destructive',
        });
      });

      xhr.open('PUT', createResponse.uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      toast({
        title: 'Upload failed',
        description: 'Failed to start upload. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewVideo = () => {
    if (videoId) {
      navigate(`/videos/${videoId}`);
    }
  };

  const handleUploadAnother = () => {
    setTitle('');
    setDescription('');
    setDestinationUrl('');
    setFile(null);
    setUploading(false);
    setUploadProgress(0);
    setProcessing(false);
    setCompleted(false);
    setVideoId(null);
  };

  if (completed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Upload Complete!</CardTitle>
              <CardDescription>
                Your video has been successfully uploaded and processed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 justify-center">
                <Button onClick={handleViewVideo}>
                  View Video
                </Button>
                <Button variant="outline" onClick={handleUploadAnother}>
                  Upload Another
                </Button>
              </div>
              <Link to="/" className="inline-block">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Upload Video</CardTitle>
            <CardDescription>
              Upload a video to share on Twitter with an embedded player
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                  disabled={uploading || processing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description (optional)"
                  disabled={uploading || processing}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destinationUrl">Destination URL *</Label>
                <Input
                  id="destinationUrl"
                  type="url"
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://example.com/page"
                  disabled={uploading || processing}
                  required
                />
                <p className="text-sm text-gray-600">
                  Users will be redirected to this URL when they click the video on Twitter
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="video">Video File *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    disabled={uploading || processing}
                    className="hidden"
                  />
                  <label
                    htmlFor="video"
                    className={`cursor-pointer ${uploading || processing ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {file ? file.name : 'Click to select a video file'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports MP4, WebM, and other video formats
                    </p>
                  </label>
                </div>
              </div>

              {(uploading || processing) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {uploading ? 'Uploading...' : 'Processing...'}
                    </span>
                    {uploading && (
                      <span>{Math.round(uploadProgress)}%</span>
                    )}
                  </div>
                  <Progress 
                    value={uploading ? uploadProgress : processing ? 50 : 100} 
                    className="w-full"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={uploading || processing || !title.trim() || !destinationUrl.trim() || !file}
              >
                {uploading ? 'Uploading...' : processing ? 'Processing...' : 'Upload Video'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
