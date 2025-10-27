import Icon from '@/components/ui/icon';

interface AudioPlayerProps {
  audioSrc: string;
  fileName: string;
}

const AudioPlayer = ({ audioSrc, fileName }: AudioPlayerProps) => {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Music" size={20} className="text-primary" />
          <span className="font-medium">{fileName}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
            <Icon name="Music" size={64} className="text-white" />
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-1">{fileName}</h3>
            <p className="text-sm text-muted-foreground">Аудиофайл</p>
          </div>

          <audio
            src={audioSrc}
            controls
            className="w-full"
          >
            Ваш браузер не поддерживает воспроизведение аудио.
          </audio>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
