import Icon from '@/components/ui/icon';
import { AppWindow } from '@/pages/Index';
import { Button } from '@/components/ui/button';

interface TaskbarProps {
  windows: AppWindow[];
  onStartClick: () => void;
  onWindowClick: (id: string) => void;
}

const Taskbar = ({ windows, onStartClick, onWindowClick }: TaskbarProps) => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateString = now.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 bg-taskbar/80 acrylic-blur border-t border-taskbar-border taskbar-shadow z-50 flex items-center px-2 gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 hover:bg-white/10"
        onClick={onStartClick}
      >
        <Icon name="Grid3x3" size={20} className="text-primary" />
      </Button>

      <div className="h-8 w-px bg-border/50" />

      <div className="flex gap-1 flex-1 overflow-x-auto">
        {windows.map((window) => (
          <Button
            key={window.id}
            variant="ghost"
            className={`h-10 px-4 flex items-center gap-2 hover:bg-white/10 transition-all ${
              window.isMinimized ? 'opacity-50' : ''
            }`}
            onClick={() => onWindowClick(window.id)}
          >
            <Icon name={window.icon} size={16} />
            <span className="text-sm max-w-[150px] truncate">{window.title}</span>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3 px-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
          <Icon name="Wifi" size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
          <Icon name="Volume2" size={16} />
        </Button>
        <div className="text-xs text-right">
          <div className="font-medium">{timeString}</div>
          <div className="text-muted-foreground">{dateString}</div>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
