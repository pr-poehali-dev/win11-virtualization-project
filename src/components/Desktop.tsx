import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { FileItem } from '@/pages/Index';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DesktopProps {
  files: FileItem[];
  onFileDoubleClick: (name: string) => void;
  onFilePositionChange: (id: string, x: number, y: number) => void;
  onCreateFile: (name: string, type: 'file' | 'folder') => { success: boolean; error?: string };
  onDeleteFile: (id: string) => void;
  onRenameFile: (id: string, newName: string) => { success: boolean; error?: string };
  onCopyFile: (id: string) => { success: boolean; error?: string };
  onImportFile: (name: string, content: string, size: number) => { success: boolean; error?: string };
}

const Desktop = ({
  files,
  onFileDoubleClick,
  onFilePositionChange,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onCopyFile,
  onImportFile,
}: DesktopProps) => {
  const [draggingFile, setDraggingFile] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingFileId, setRenamingFileId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [copiedFileId, setCopiedFileId] = useState<string | null>(null);
  const [lastTap, setLastTap] = useState<{ time: number; fileId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseDown = (e: React.MouseEvent, file: FileItem) => {
    if (e.button !== 0) return;
    setSelectedFileId(file.id);
    setDraggingFile(file.id);
    setDragOffset({
      x: e.clientX - (file.x || 0),
      y: e.clientY - (file.y || 0),
    });
  };

  const handleTouchStart = (e: React.TouchEvent, file: FileItem) => {
    const now = Date.now();
    const touch = e.touches[0];
    
    // Проверяем двойное касание
    if (lastTap && now - lastTap.time < 300 && lastTap.fileId === file.id) {
      onFileDoubleClick(file.name);
      setLastTap(null);
      return;
    }
    
    setLastTap({ time: now, fileId: file.id });
    setSelectedFileId(file.id);
    setDraggingFile(file.id);
    setDragOffset({
      x: touch.clientX - (file.x || 0),
      y: touch.clientY - (file.y || 0),
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingFile) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    onFilePositionChange(draggingFile, newX, newY);
  };

  const handleTouchEnd = () => {
    if (draggingFile) {
      const file = files.find(f => f.id === draggingFile);
      if (file) {
        let snappedX = snapToGrid(file.x || 0);
        let snappedY = snapToGrid(file.y || 0);
        
        while (isPositionOccupied(snappedX, snappedY, file.id)) {
          snappedY += GRID_SIZE;
          if (snappedY > window.innerHeight - 100) {
            snappedY = 0;
            snappedX += GRID_SIZE;
          }
        }
        
        onFilePositionChange(draggingFile, snappedX, snappedY);
      }
      setDraggingFile(null);
    }
  };

  const GRID_SIZE = 100;

  const snapToGrid = (value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingFile) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    onFilePositionChange(draggingFile, newX, newY);
  };

  const isPositionOccupied = (x: number, y: number, excludeId: string) => {
    return files.some(f => f.id !== excludeId && f.x === x && f.y === y);
  };

  const handleMouseUp = () => {
    if (draggingFile) {
      const file = files.find(f => f.id === draggingFile);
      if (file) {
        let snappedX = snapToGrid(file.x || 0);
        let snappedY = snapToGrid(file.y || 0);
        
        // Если позиция занята, найти ближайшую свободную
        while (isPositionOccupied(snappedX, snappedY, draggingFile)) {
          snappedY += GRID_SIZE;
          // Если вышли за границы экрана по Y, переходим на следующую колонку
          if (snappedY > window.innerHeight - 150) {
            snappedY = 20;
            snappedX += GRID_SIZE;
          }
        }
        
        onFilePositionChange(draggingFile, snappedX, snappedY);
      }
    }
    setDraggingFile(null);
  };

  const handleCreateNew = (type: 'file' | 'folder') => {
    setNewItemType(type);
    setNewItemName('');
    setCreateDialogOpen(true);
  };

  const handleCreateConfirm = () => {
    if (newItemName.trim()) {
      const result = onCreateFile(newItemName, newItemType);
      if (result.success) {
        setCreateDialogOpen(false);
        setNewItemName('');
      } else {
        toast.error(result.error || 'Ошибка создания');
      }
    }
  };

  const handleRename = (file: FileItem) => {
    setRenamingFileId(file.id);
    // Remove extension from name for editing
    const nameWithoutExt = file.name.replace(/\.(txt|png|jpg|jpeg|gif)$/, '');
    setRenameValue(nameWithoutExt);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = () => {
    if (renameValue.trim() && renamingFileId) {
      const file = files.find(f => f.id === renamingFileId);
      
      // Get original extension
      const extMatch = file?.name.match(/\.(txt|png|jpg|jpeg|gif)$/);
      const originalExt = extMatch ? extMatch[0] : '';
      
      // If user didn't provide extension, add the original one
      let finalName = renameValue;
      if (file?.type === 'file' && !renameValue.match(/\.(txt|png|jpg|jpeg|gif)$/)) {
        finalName = originalExt ? `${renameValue}${originalExt}` : `${renameValue}.txt`;
      }
      
      const result = onRenameFile(renamingFileId, finalName);
      if (result.success) {
        setRenameDialogOpen(false);
        setRenamingFileId(null);
        setRenameValue('');
      } else {
        toast.error(result.error || 'Ошибка переименования');
      }
    }
  };

  const handleCopy = (fileId: string) => {
    const result = onCopyFile(fileId);
    if (result.success) {
      toast.success('Файл скопирован');
    } else {
      toast.error(result.error || 'Ошибка копирования');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 54 * 1024 * 1024; // 54 MB

    if (file.size > MAX_SIZE) {
      toast.error(`Этот файл весит более 54 MB (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
      e.target.value = '';
      return;
    }

    // Check file extension
    const allowedExtensions = ['.pdf', '.pptx', '.mp4', '.mp3', '.txt', '.png', '.jpg', '.jpeg', '.gif', '.exe'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error('Неподдерживаемый формат файла');
      e.target.value = '';
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const result = onImportFile(file.name, content, file.size);
        if (result.success) {
          toast.success(`Файл "${file.name}" загружен!`);
        } else {
          toast.error(result.error || 'Ошибка загрузки файла');
        }
        e.target.value = '';
      };
      reader.onerror = () => {
        toast.error('Ошибка чтения файла');
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Ошибка загрузки файла');
      e.target.value = '';
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'c' && selectedFileId) {
        e.preventDefault();
        setCopiedFileId(selectedFileId);
        toast.success('Файл скопирован в буфер обмена');
      }
      
      if (e.ctrlKey && e.key === 'v' && copiedFileId) {
        e.preventDefault();
        handleCopy(copiedFileId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFileId, copiedFileId]);

  const getDisplayName = (name: string) => {
    const translations: { [key: string]: string } = {
      'Browser': 'Браузер',
      'Notepad': 'Блокнот',
      'Calculator': 'Калькулятор',
      'Settings': 'Настройки',
      'Documents': 'Документы',
      'Explorer': 'Проводник'
    };
    return translations[name] || name;
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedFileId(null);
              }
            }}
          >
            {files.map((file) => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className={`absolute flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 active:bg-white/20 cursor-pointer select-none transition-colors group touch-none ${
                      selectedFileId === file.id ? 'bg-white/20 ring-2 ring-white/40' : ''
                    }`}
                    style={{ 
                      left: file.x, 
                      top: file.y,
                      WebkitTapHighlightColor: 'transparent'
                    }}
                    onMouseDown={(e) => handleMouseDown(e, file)}
                    onTouchStart={(e) => handleTouchStart(e, file)}
                    onDoubleClick={() => onFileDoubleClick(file.name)}
                  >
                    <div className="w-12 h-12 flex items-center justify-center text-white">
                      <Icon
                        name={file.type === 'folder' ? 'Folder' : getFileIcon(file.name)}
                        size={48}
                        className="drop-shadow-lg"
                      />
                    </div>
                    <span className="text-white text-xs text-center max-w-[80px] truncate drop-shadow-md">
                      {getDisplayName(file.name)}
                    </span>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="z-[10000]">
                  <ContextMenuItem onClick={() => onFileDoubleClick(file.name)}>
                    <Icon name="FolderOpen" className="mr-2" size={16} />
                    Открыть
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleCopy(file.id)}>
                    <Icon name="Copy" className="mr-2" size={16} />
                    Копировать
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => handleRename(file)}>
                    <Icon name="Edit" className="mr-2" size={16} />
                    Переименовать
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onDeleteFile(file.id)}>
                    <Icon name="Trash2" className="mr-2" size={16} />
                    Удалить
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="z-[10000]">
          <ContextMenuItem onClick={() => handleCreateNew('file')}>
            <Icon name="FileText" className="mr-2" size={16} />
            Новый файл
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleCreateNew('folder')}>
            <Icon name="Folder" className="mr-2" size={16} />
            Новая папка
          </ContextMenuItem>
          <ContextMenuItem onClick={handleImportClick}>
            <Icon name="Upload" className="mr-2" size={16} />
            Загрузить файл
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.pptx,.mp4,.mp3,.txt,.png,.jpg,.jpeg,.gif,.exe"
        onChange={handleFileImport}
        className="hidden"
      />

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="z-[10000]">
          <DialogHeader>
            <DialogTitle>
              {newItemType === 'file' ? 'Создать файл' : 'Создать папку'}
            </DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Введите имя..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateConfirm()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreateConfirm}>Создать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="z-[10000]">
          <DialogHeader>
            <DialogTitle>Переименовать</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Введите новое имя..."
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameConfirm()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleRenameConfirm}>Переименовать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const getFileIcon = (name: string): string => {
  if (name === 'Browser') return 'Globe';
  if (name === 'Notepad') return 'FileText';
  if (name === 'Calculator') return 'Calculator';
  if (name === 'Settings') return 'Settings';
  if (name === 'Explorer') return 'FolderOpen';
  
  // Media files
  if (name.endsWith('.mp4')) return 'Video';
  if (name.endsWith('.mp3')) return 'Music';
  
  // Documents
  if (name.endsWith('.pdf')) return 'FileText';
  if (name.endsWith('.pptx')) return 'Presentation';
  
  // Images
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif')) return 'Image';
  
  // Text files
  if (name.endsWith('.txt')) return 'FileText';
  
  // Executables
  if (name.endsWith('.exe')) return 'Cog';
  
  return 'File';
};

export default Desktop;