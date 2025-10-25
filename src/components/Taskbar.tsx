import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { AppWindow } from '@/pages/Index';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

interface TaskbarProps {
  windows: AppWindow[];
  onStartClick: () => void;
  onWindowClick: (id: string) => void;
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (volume: number) => void;
  onMutedChange?: (muted: boolean) => void;
}

const Taskbar = ({ 
  windows, 
  onStartClick, 
  onWindowClick,
  volume: externalVolume,
  isMuted: externalMuted,
  onVolumeChange,
  onMutedChange
}: TaskbarProps) => {
  const [time, setTime] = useState(new Date());
  const [brightness, setBrightness] = useState(100);
  
  const volume = externalVolume ?? 50;
  const isMuted = externalMuted ?? false;
  
  const setVolume = (value: number) => {
    onVolumeChange?.(value);
  };
  
  const setIsMuted = (value: boolean) => {
    onMutedChange?.(value);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateString = time.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const getWindowTitle = (title: string) => {
    const translations: { [key: string]: string } = {
      'Browser': 'Браузер',
      'Notepad': 'Блокнот',
      'Calculator': 'Калькулятор',
      'Settings': 'Настройки',
      'Explorer': 'Проводник',
      'Documents': 'Проводник'
    };
    return translations[title] || title;
  };

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
            <span className="text-sm max-w-[150px] truncate">{getWindowTitle(window.title)}</span>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3 px-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
              <Icon name="Wifi" size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-[10001]">
            <div className="space-y-3">
              <h4 className="font-medium">Сетевые подключения</h4>
              <div className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                <Icon name="Wifi" size={20} className="text-primary" />
                <div className="flex-1">
                  <div className="font-medium">Wi-Fi</div>
                  <div className="text-xs text-muted-foreground">Подключено</div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
              <Icon name={isMuted ? "VolumeX" : volume > 50 ? "Volume2" : "Volume1"} size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-[10001]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Громкость</h4>
                <span className="text-sm text-muted-foreground">{isMuted ? 0 : volume}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  <Icon name={isMuted ? "VolumeX" : "Volume2"} size={16} />
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={(value) => {
                    setVolume(value[0]);
                    if (value[0] > 0) setIsMuted(false);
                  }}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
              <Icon name="Sun" size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 z-[10001]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Яркость</h4>
                <span className="text-sm text-muted-foreground">{brightness}%</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Sun" size={16} />
                <Slider
                  value={[brightness]}
                  onValueChange={(value) => {
                    setBrightness(value[0]);
                    document.documentElement.style.filter = `brightness(${value[0]}%)`;
                  }}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="text-xs text-right">
          <div className="font-medium">{timeString}</div>
          <div className="text-muted-foreground">{dateString}</div>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;