import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import PlayerPage from './pages/PlayerPage';
import UploadPage from './pages/UploadPage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/videos/:id" element={<VideoPage />} />
          <Route path="/player/:id" element={<PlayerPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}
