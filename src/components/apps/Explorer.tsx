import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified?: string;
  children?: FileItem[];
}

interface FolderStructure {
  [key: string]: FileItem[];
}

const Explorer = () => {
  const [currentPath, setCurrentPath] = useState(['Этот компьютер']);
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({
    'Этот компьютер': [
      { id: '1', name: 'Документы', type: 'folder', modified: '25.10.2025', children: [] },
      { id: '2', name: 'Загрузки', type: 'folder', modified: '25.10.2025', children: [] },
      { id: '3', name: 'Изображения', type: 'folder', modified: '25.10.2025', children: [] },
      { id: '4', name: 'Музыка', type: 'folder', modified: '25.10.2025', children: [] },
      { id: '5', name: 'Видео', type: 'folder', modified: '25.10.2025', children: [] },
      { id: '6', name: 'Рабочий стол', type: 'folder', modified: '25.10.2025', children: [] },
    ]
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('folder');

  useEffect(() => {
    const saved = localStorage.getItem('explorer-structure');
    if (saved) {
      setFolderStructure(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('explorer-structure', JSON.stringify(folderStructure));
  }, [folderStructure]);

  const getCurrentFiles = (): FileItem[] => {
    const pathKey = currentPath.join(' > ');
    return folderStructure[pathKey] || [];
  };

  const handleNavigate = (folderName: string) => {
    const newPath = [...currentPath, folderName];
    const pathKey = newPath.join(' > ');
    
    if (!folderStructure[pathKey]) {
      setFolderStructure({
        ...folderStructure,
        [pathKey]: []
      });
    }
    
    setCurrentPath(newPath);
  };

  const handleBack = () => {
    if (currentPath.length > 1) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const handleCreateNew = (type: 'file' | 'folder') => {
    setNewItemType(type);
    setNewItemName('');
    setCreateDialogOpen(true);
  };

  const handleCreateConfirm = () => {
    if (newItemName.trim()) {
      const pathKey = currentPath.join(' > ');
      const newItem: FileItem = {
        id: `item-${Date.now()}`,
        name: newItemName,
        type: newItemType,
        modified: new Date().toLocaleDateString('ru-RU'),
        size: newItemType === 'file' ? '0 КБ' : undefined,
        children: newItemType === 'folder' ? [] : undefined,
      };
      
      const currentFiles = folderStructure[pathKey] || [];
      setFolderStructure({
        ...folderStructure,
        [pathKey]: [...currentFiles, newItem]
      });
      
      setCreateDialogOpen(false);
      setNewItemName('');
      toast.success(`${newItemType === 'folder' ? 'Папка' : 'Файл'} создан!`);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
      const pathKey = currentPath.join(' > ');
      const currentFiles = folderStructure[pathKey] || [];
      
      setFolderStructure({
        ...folderStructure,
        [pathKey]: currentFiles.filter(f => f.id !== id)
      });
      
      toast.success('Элемент удален');
    }
  };

  const currentFiles = getCurrentFiles();

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleBack}
          disabled={currentPath.length <= 1}
        >
          <Icon name="ChevronLeft" size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled
        >
          <Icon name="ChevronRight" size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Icon name="RotateCw" size={18} />
        </Button>

        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-1">
          <Icon name="Folder" size={14} className="text-muted-foreground" />
          <Input
            value={currentPath.join(' > ')}
            readOnly
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-7 px-0"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Icon name="Search" size={18} />
        </Button>
      </div>

      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={() => handleCreateNew('folder')}
        >
          <Icon name="FolderPlus" size={16} />
          Новая папка
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={() => handleCreateNew('file')}
        >
          <Icon name="FilePlus" size={16} />
          Новый файл
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {currentFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Icon name="FolderOpen" size={64} className="mb-4 opacity-20" />
            <p>Эта папка пуста</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-1">
            {currentFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer group"
                onDoubleClick={() => file.type === 'folder' && handleNavigate(file.name)}
              >
                <Icon
                  name={file.type === 'folder' ? 'Folder' : 'FileText'}
                  size={20}
                  className={file.type === 'folder' ? 'text-yellow-500' : 'text-blue-500'}
                />
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {file.type === 'folder' ? 'Папка с файлами' : file.size} • {file.modified}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.id);
                  }}
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default Explorer;