import { useState, useEffect } from 'react';
import Desktop from '@/components/Desktop';
import Taskbar from '@/components/Taskbar';
import StartMenu from '@/components/StartMenu';
import Window from '@/components/Window';
import Browser from '@/components/apps/Browser';
import Notepad from '@/components/apps/Notepad';
import Settings from '@/components/apps/Settings';
import Explorer from '@/components/apps/Explorer';
import Calculator from '@/components/apps/Calculator';
import Paint from '@/components/apps/Paint';
import ImageViewer from '@/components/apps/ImageViewer';

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
  fileId?: string;
}

const Index = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [windows, setWindows] = useState<AppWindow[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [globalVolume, setGlobalVolume] = useState(50);
  const [globalMuted, setGlobalMuted] = useState(false);

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
        { id: '3', name: 'Calculator', type: 'file', x: 50, y: 250 },
        { id: '4', name: 'Explorer', type: 'file', x: 50, y: 350 },
        { id: '5', name: 'Paint', type: 'file', x: 50, y: 450 },
      ];
      setFiles(defaultFiles);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('windows-files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    const allMedia = document.querySelectorAll('audio, video');
    allMedia.forEach((media) => {
      const element = media as HTMLMediaElement;
      if (globalMuted) {
        element.muted = true;
      } else {
        element.muted = false;
        element.volume = globalVolume / 100;
      }
    });
  }, [globalVolume, globalMuted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('windows-theme', newTheme);
    
    // Update Settings window if it's open
    setWindows(windows.map(w => 
      w.title === 'Settings' 
        ? { ...w, component: <Settings theme={newTheme} onThemeChange={toggleTheme} /> }
        : w
    ));
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
        component = (
          <Notepad 
            fileName='Новый документ'
            initialContent=''
            onSave={saveFileContent}
          />
        );
        icon = 'FileText';
        width = 700;
        height = 500;
        break;
      case 'Calculator':
        component = <Calculator />;
        icon = 'Calculator';
        width = 400;
        height = 600;
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
      case 'Paint':
        component = <Paint fileName='Рисунок' onSave={saveFileContent} />;
        icon = 'Paintbrush';
        width = 900;
        height = 700;
        break;
      default:
        if (files.find(f => f.name === appName && f.type === 'folder')) {
          component = <Explorer />;
          icon = 'FolderOpen';
          width = 900;
          height = 650;
        } else if (files.find(f => f.name === appName && f.type === 'file')) {
          // Check file extension to determine which app to open
          if (appName.endsWith('.png') || appName.endsWith('.jpg') || appName.endsWith('.jpeg') || appName.endsWith('.gif')) {
            const file = files.find(f => f.name === appName);
            component = <ImageViewer imagePath={file?.content || ''} fileName={file?.name || appName} />;
            icon = 'Image';
            width = 900;
            height = 700;
          } else {
            openFileInNotepad(appName);
            return;
          }
        } else {
          return;
        }
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

  const createNewFile = (name: string, type: 'file' | 'folder'): { success: boolean; error?: string } => {
    // Проверить, существует ли файл/папка с таким именем
    const existingFile = files.find(f => f.name === name);
    if (existingFile) {
      return { success: false, error: `${type === 'folder' ? 'Папка' : 'Файл'} "${name}" уже существует` };
    }
    
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
    return { success: true };
  };

  const deleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const renameFile = (id: string, newName: string): { success: boolean; error?: string } => {
    // Проверить, существует ли файл/папка с таким именем
    const existingFile = files.find(f => f.name === newName && f.id !== id);
    if (existingFile) {
      return { success: false, error: `Файл или папка "${newName}" уже существует` };
    }
    
    setFiles(files.map(f => 
      f.id === id ? { ...f, name: newName } : f
    ));
    return { success: true };
  };

  const updateFilePosition = (id: string, x: number, y: number) => {
    setFiles(files.map(f => 
      f.id === id ? { ...f, x, y } : f
    ));
  };

  const saveFileContent = (content: string, fileName: string, fileId?: string): { success: boolean; error?: string } => {
    // Determine file extension - if no extension, add .txt
    const hasExtension = /\.\w+$/.test(fileName);
    const finalFileName = hasExtension ? fileName : `${fileName}.txt`;
    
    if (fileId) {
      // Save to existing file
      setFiles(files.map(f => 
        f.id === fileId ? { ...f, content } : f
      ));
      return { success: true };
    } else {
      // Check if file with this name already exists
      const existingFile = files.find(f => f.name === finalFileName);
      if (existingFile) {
        return { success: false, error: `Файл "${finalFileName}" уже существует на этом ПК` };
      }
      
      // Create new file
      const newFile: FileItem = {
        id: `file-${Date.now()}`,
        name: finalFileName,
        type: 'file',
        content,
        x: 50,
        y: 50 + files.length * 100,
      };
      setFiles([...files, newFile]);
      return { success: true };
    }
  };

  const openFileInNotepad = (fileName: string) => {
    const file = files.find(f => f.name === fileName && f.type === 'file');
    if (file) {
      const component = (
        <Notepad 
          fileId={file.id}
          fileName={file.name}
          initialContent={file.content || ''}
          onSave={saveFileContent}
        />
      );
      
      const newWindow: AppWindow = {
        id: `window-${Date.now()}`,
        title: file.name,
        icon: 'FileText',
        component,
        isMinimized: false,
        isMaximized: false,
        x: 100 + windows.length * 30,
        y: 50 + windows.length * 30,
        width: 700,
        height: 500,
        zIndex: nextZIndex,
        fileId: file.id,
      };
      
      setWindows([...windows, newWindow]);
      setNextZIndex(nextZIndex + 1);
    }
  };

  const copyFile = (id: string): { success: boolean; error?: string } => {
    const file = files.find(f => f.id === id);
    if (!file) {
      return { success: false, error: 'Файл не найден' };
    }

    // Get file extension
    const extMatch = file.name.match(/\.(txt|png|jpg|jpeg|gif)$/);
    const nameWithoutExt = file.name.replace(/\.(txt|png|jpg|jpeg|gif)$/, '');
    const ext = extMatch ? extMatch[0] : '';

    // Find unique name for copy
    let copyNumber = 1;
    let newName = `${nameWithoutExt} - копия${ext}`;
    
    while (files.find(f => f.name === newName)) {
      copyNumber++;
      newName = `${nameWithoutExt} - копия (${copyNumber})${ext}`;
    }

    // Create copy
    const newFile: FileItem = {
      id: `file-${Date.now()}`,
      name: newName,
      type: file.type,
      content: file.content,
      children: file.children ? [...file.children] : undefined,
      x: (file.x || 50) + 20,
      y: (file.y || 50) + 20,
    };

    setFiles([...files, newFile]);
    return { success: true };
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-desktop">
      <Desktop 
        files={files}
        onFileDoubleClick={openApp}
        onFilePositionChange={updateFilePosition}
        onCreateFile={createNewFile}
        onDeleteFile={deleteFile}
        onRenameFile={renameFile}
        onCopyFile={copyFile}
      />
      
      {windows.map(window => {
        let component = window.component;
        
        // Always use current theme for Settings window
        if (window.title === 'Settings') {
          component = <Settings theme={theme} onThemeChange={toggleTheme} />;
        }
        
        // Always use current file content for Notepad windows
        if (window.fileId) {
          const file = files.find(f => f.id === window.fileId);
          if (file) {
            component = (
              <Notepad 
                fileId={file.id}
                fileName={file.name}
                initialContent={file.content || ''}
                onSave={saveFileContent}
              />
            );
          }
        }
          
        return (
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
              {component}
            </Window>
          )
        );
      })}

      <Taskbar
        windows={windows}
        onStartClick={() => setStartMenuOpen(!startMenuOpen)}
        onWindowClick={focusWindow}
        volume={globalVolume}
        isMuted={globalMuted}
        onVolumeChange={setGlobalVolume}
        onMutedChange={setGlobalMuted}
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