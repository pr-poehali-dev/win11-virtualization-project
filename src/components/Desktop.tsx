import { useState } from 'react';
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

interface DesktopProps {
  files: FileItem[];
  onFileDoubleClick: (name: string) => void;
  onFilePositionChange: (id: string, x: number, y: number) => void;
  onCreateFile: (name: string, type: 'file' | 'folder') => void;
  onDeleteFile: (id: string) => void;
}

const Desktop = ({
  files,
  onFileDoubleClick,
  onFilePositionChange,
  onCreateFile,
  onDeleteFile,
}: DesktopProps) => {
  const [draggingFile, setDraggingFile] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file');

  const handleMouseDown = (e: React.MouseEvent, file: FileItem) => {
    if (e.button !== 0) return;
    setDraggingFile(file.id);
    setDragOffset({
      x: e.clientX - (file.x || 0),
      y: e.clientY - (file.y || 0),
    });
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

  const handleMouseUp = () => {
    if (draggingFile) {
      const file = files.find(f => f.id === draggingFile);
      if (file) {
        const snappedX = snapToGrid(file.x || 0);
        const snappedY = snapToGrid(file.y || 0);
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
      onCreateFile(newItemName, newItemType);
      setCreateDialogOpen(false);
      setNewItemName('');
    }
  };

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
          >
            {files.map((file) => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <div
                    className="absolute flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/10 cursor-pointer select-none transition-colors group"
                    style={{ left: file.x, top: file.y }}
                    onMouseDown={(e) => handleMouseDown(e, file)}
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
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onFileDoubleClick(file.name)}>
                    <Icon name="FolderOpen" className="mr-2" size={16} />
                    Открыть
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
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleCreateNew('file')}>
            <Icon name="FileText" className="mr-2" size={16} />
            Новый файл
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleCreateNew('folder')}>
            <Icon name="Folder" className="mr-2" size={16} />
            Новая папка
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
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
    </>
  );
};

const getFileIcon = (name: string): string => {
  if (name === 'Browser') return 'Globe';
  if (name === 'Notepad') return 'FileText';
  if (name === 'Calculator') return 'Calculator';
  if (name === 'Settings') return 'Settings';
  if (name === 'Explorer') return 'FolderOpen';
  return 'File';
};

export default Desktop;