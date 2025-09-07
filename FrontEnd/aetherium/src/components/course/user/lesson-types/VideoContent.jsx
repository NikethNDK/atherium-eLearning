

import { useRef, useEffect } from "react";

const VideoContent = ({ content, lessonId }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !lessonId) return;

    // Load saved video position from localStorage
    const savedPosition = localStorage.getItem(`video_position_${lessonId}`);
    if (savedPosition) {
      video.currentTime = parseFloat(savedPosition);
    }

    // Save video position every 5 seconds
    const savePosition = () => {
      if (video && !video.paused) {
        localStorage.setItem(`video_position_${lessonId}`, video.currentTime.toString());
      }
    };

    // Save position on pause and when user seeks
    const handlePause = () => {
      localStorage.setItem(`video_position_${lessonId}`, video.currentTime.toString());
    };

    const handleSeeked = () => {
      localStorage.setItem(`video_position_${lessonId}`, video.currentTime.toString());
    };

    // Save position every 5 seconds while playing
    const interval = setInterval(savePosition, 5000);

    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeeked);

    return () => {
      clearInterval(interval);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, [lessonId]);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      {content?.file_url ? (
        <video
          ref={videoRef}
          src={content.file_url}
          controls
          className="w-full h-full"
          preload="metadata"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white">
          Video content not available
        </div>
      )}
    </div>
  );
};

export default VideoContent;