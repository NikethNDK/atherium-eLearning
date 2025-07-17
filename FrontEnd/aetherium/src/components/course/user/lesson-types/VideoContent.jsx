

const VideoContent = ({ content }) => {
  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      {content?.file_url ? (
        <video
          src={content.file_url}
          controls
          className="w-full h-full"
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