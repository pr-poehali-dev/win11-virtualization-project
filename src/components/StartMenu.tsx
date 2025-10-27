import { useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface StartMenuProps {
  onAppClick: (appName: string) => void;
  onClose: () => void;
}

const apps = [
  { name: 'Browser', displayName: 'Браузер', icon: 'Globe', color: 'bg-blue-500' },
  { name: 'Notepad', displayName: 'Блокнот', icon: 'FileText', color: 'bg-yellow-500' },
  { name: 'Calculator', displayName: 'Калькулятор', icon: 'Calculator', color: 'bg-purple-500' },
  { name: 'Explorer', displayName: 'Проводник', icon: 'FolderOpen', color: 'bg-orange-500' },
  { name: 'Paint', displayName: 'Paint', icon: 'Paintbrush', color: 'bg-pink-500' },
  { name: 'CMD', displayName: 'Командная строка', icon: 'Terminal', color: 'bg-black' },
  { name: 'Settings', displayName: 'Настройки', icon: 'Settings', color: 'bg-gray-500' },
];

const StartMenu = ({ onAppClick, onClose }: StartMenuProps) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.start-menu') && !target.closest('button')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="start-menu absolute bottom-14 left-2 w-[600px] h-[600px] bg-card/95 acrylic-blur rounded-xl window-shadow border border-border animate-slide-up overflow-hidden z-[10002]">
      <div className="p-6 h-full flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Закрепленные</h2>
        </div>

        <div className="grid grid-cols-4 gap-4 flex-1">
          {apps.map((app) => (
            <Button
              key={app.name}
              variant="ghost"
              className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-accent/50 rounded-lg transition-all group"
              onClick={() => onAppClick(app.name)}
            >
              <div className={`w-12 h-12 ${app.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon name={app.icon} size={24} className="text-white" />
              </div>
              <span className="text-sm">{app.displayName}</span>
            </Button>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <Icon name="User" size={20} className="text-white" />
              </div>
              <span className="font-medium">Пользователь</span>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-accent/50">
              <Icon name="Power" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;