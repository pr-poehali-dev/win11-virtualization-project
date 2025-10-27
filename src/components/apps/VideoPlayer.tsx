import Icon from '@/components/ui/icon';

interface VideoPlayerProps {
  videoSrc: string;
  fileName: string;
}

const VideoPlayer = ({ videoSrc, fileName }: VideoPlayerProps) => {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Video" size={20} className="text-primary" />
          <span className="font-medium">{fileName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center bg-black">
        <video
          src={videoSrc}
          controls
          className="max-w-full max-h-full"
          style={{ width: 'auto', height: 'auto' }}
        >
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      </div>
    </div>
  );
};

export default VideoPlayer;
