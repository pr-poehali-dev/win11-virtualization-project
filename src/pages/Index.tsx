import { useState, useEffect } from 'react';
import Desktop from '@/components/Desktop';
import Taskbar from '@/components/Taskbar';
import StartMenu from '@/components/StartMenu';
import Window from '@/components/Window';
import Browser from '@/components/apps/Browser';
import Notepad from '@/components/apps/Notepad';
import Settings from '@/components/apps/Settings';
import Explorer from '@/components/apps/Explorer';

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileItem[];
  x?: number;
  y?: number;
}

export interface AppWindow {
  id: string;
  title: string;
  icon: string;
  component: React.ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

const Index = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);

  useEffect(() => {
    const savedTheme = localStorage.getItem('windows-theme') as 'light' | 'dark' | null;
    const savedFiles = localStorage.getItem('windows-files');
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
    
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    } else {
      const defaultFiles: FileItem[] = [
        { id: '1', name: 'Browser', type: 'file', x: 50, y: 50 },
        { id: '2', name: 'Notepad', type: 'file', x: 50, y: 150 },
        { id: '3', name: 'Settings', type: 'file', x: 50, y: 250 },
        { id: '4', name: 'Explorer', type: 'file', x: 50, y: 350 },
      ];
      setFiles(defaultFiles);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('windows-files', JSON.stringify(files));
  }, [files]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('windows-theme', newTheme);
  };

  const openApp = (appName: string) => {
    const existingWindow = windows.find(w => w.title === appName);
    if (existingWindow) {
      focusWindow(existingWindow.id);
      return;
    }

    let component: React.ReactNode;
    let icon: string;
    let width = 800;
    let height = 600;

    switch (appName) {
      case 'Browser':
        component = <Browser />;
        icon = 'Globe';
        width = 1000;
        height = 700;
        break;
      case 'Notepad':
        component = <Notepad />;
        icon = 'FileText';
        width = 700;
        height = 500;
        break;
      case 'Settings':
        component = <Settings theme={theme} onThemeChange={toggleTheme} />;
        icon = 'Settings';
        width = 800;
        height = 600;
        break;
      case 'Explorer':
      case 'Documents':
        component = <Explorer />;
        icon = 'FolderOpen';
        width = 900;
        height = 650;
        break;
      default:
        return;
    }

    const newWindow: AppWindow = {
      id: `window-${Date.now()}`,
      title: appName,
      icon,
      component,
      isMinimized: false,
      isMaximized: false,
      x: 100 + windows.length * 30,
      y: 50 + windows.length * 30,
      width,
      height,
      zIndex: nextZIndex,
    };

    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);
    setStartMenuOpen(false);
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMinimized: true } : w
    ));
  };

  const maximizeWindow = (id: string) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  };

  const focusWindow = (id: string) => {
    const window = windows.find(w => w.id === id);
    if (!window) return;

    if (window.isMinimized) {
      setWindows(windows.map(w => 
        w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
      ));
    } else {
      setWindows(windows.map(w => 
        w.id === id ? { ...w, zIndex: nextZIndex } : w
      ));
    }
    setNextZIndex(nextZIndex + 1);
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, x, y } : w
    ));
  };

  const updateWindowSize = (id: string, width: number, height: number) => {
    setWindows(windows.map(w => 
      w.id === id ? { ...w, width, height } : w
    ));
  };

  const createNewFile = (name: string, type: 'file' | 'folder') => {
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name,
      type,
      content: type === 'file' ? '' : undefined,
      children: type === 'folder' ? [] : undefined,
      x: 50,
      y: 50 + files.length * 100,
    };
    setFiles([...files, newFile]);
  };

  const deleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const updateFilePosition = (id: string, x: number, y: number) => {
    setFiles(files.map(f => 
      f.id === id ? { ...f, x, y } : f
    ));
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-desktop">
      <Desktop 
        files={files}
        onFileDoubleClick={openApp}
        onFilePositionChange={updateFilePosition}
        onCreateFile={createNewFile}
        onDeleteFile={deleteFile}
      />
      
      {windows.map(window => (
        !window.isMinimized && (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            icon={window.icon}
            isMaximized={window.isMaximized}
            x={window.x}
            y={window.y}
            width={window.width}
            height={window.height}
            zIndex={window.zIndex}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => minimizeWindow(window.id)}
            onMaximize={() => maximizeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            onPositionChange={(x, y) => updateWindowPosition(window.id, x, y)}
            onSizeChange={(width, height) => updateWindowSize(window.id, width, height)}
          >
            {window.component}
          </Window>
        )
      ))}

      <Taskbar
        windows={windows}
        onStartClick={() => setStartMenuOpen(!startMenuOpen)}
        onWindowClick={focusWindow}
      />

      {startMenuOpen && (
        <StartMenu
          onAppClick={openApp}
          onClose={() => setStartMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Index;