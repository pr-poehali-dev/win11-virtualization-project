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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [draggingItem, setDraggingItem] = useState<FileItem | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

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

  const handleRename = (id: string, currentName: string) => {
    setRenamingItemId(id);
    setRenameValue(currentName);
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = () => {
    if (renameValue.trim() && renamingItemId) {
      const pathKey = currentPath.join(' > ');
      const currentFiles = folderStructure[pathKey] || [];
      
      // Проверить, существует ли файл/папка с таким именем
      const existingItem = currentFiles.find(f => f.name === renameValue.trim() && f.id !== renamingItemId);
      if (existingItem) {
        toast.error(`Элемент "${renameValue.trim()}" уже существует в этой папке`);
        return;
      }
      
      setFolderStructure({
        ...folderStructure,
        [pathKey]: currentFiles.map(f => 
          f.id === renamingItemId ? { ...f, name: renameValue.trim() } : f
        )
      });
      
      setRenameDialogOpen(false);
      setRenamingItemId(null);
      setRenameValue('');
      toast.success('Элемент переименован');
    }
  };

  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    e.stopPropagation();
    setDraggingItem(file);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (folderId) {
      setDragOverFolder(folderId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolder?: FileItem) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);

    if (!draggingItem) return;

    // Нельзя перетащить папку в саму себя
    if (targetFolder && draggingItem.id === targetFolder.id) {
      toast.error('Нельзя переместить папку в саму себя');
      setDraggingItem(null);
      return;
    }

    const pathKey = currentPath.join(' > ');
    const currentFiles = folderStructure[pathKey] || [];

    if (targetFolder && targetFolder.type === 'folder') {
      // Перемещаем в другую папку
      const targetPathKey = [...currentPath, targetFolder.name].join(' > ');
      const targetFiles = folderStructure[targetPathKey] || [];

      // Проверяем, есть ли уже файл с таким именем в целевой папке
      if (targetFiles.some(f => f.name === draggingItem.name)) {
        toast.error(`Файл "${draggingItem.name}" уже существует в папке "${targetFolder.name}"`);
        setDraggingItem(null);
        return;
      }

      // Удаляем из текущей папки
      const updatedCurrentFiles = currentFiles.filter(f => f.id !== draggingItem.id);
      
      // Добавляем в целевую папку
      const updatedTargetFiles = [...targetFiles, draggingItem];

      setFolderStructure({
        ...folderStructure,
        [pathKey]: updatedCurrentFiles,
        [targetPathKey]: updatedTargetFiles
      });

      toast.success(`"${draggingItem.name}" перемещён в "${targetFolder.name}"`);
    }

    setDraggingItem(null);
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

      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex-1 overflow-auto p-4">
            {currentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Icon name="FolderOpen" size={64} className="mb-4 opacity-20" />
                <p>Эта папка пуста</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-1">
            {currentFiles.map(file => (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger>
                  <div
                    draggable
                    onDragStart={(e) => handleDragStart(e, file)}
                    onDragOver={(e) => file.type === 'folder' ? handleDragOver(e, file.id) : e.preventDefault()}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => file.type === 'folder' ? handleDrop(e, file) : e.preventDefault()}
                    className={`flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer group transition-colors ${
                      dragOverFolder === file.id ? 'bg-blue-500/20 border-2 border-blue-500' : ''
                    } ${
                      draggingItem?.id === file.id ? 'opacity-50' : ''
                    }`}
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRename(file.id, file.name);
                        }}
                      >
                        <Icon name="Pencil" size={16} />
                      </Button>
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
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="z-[10000]">
                  {file.type === 'folder' && (
                    <>
                      <ContextMenuItem onClick={() => handleNavigate(file.name)}>
                        <Icon name="FolderOpen" size={16} className="mr-2" />
                        Открыть
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                    </>
                  )}
                  <ContextMenuItem onClick={() => handleRename(file.id, file.name)}>
                    <Icon name="Pencil" size={16} className="mr-2" />
                    Переименовать
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem 
                    onClick={() => handleDelete(file.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </div>
        )}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="z-[10000]">
          <ContextMenuItem onClick={() => handleCreateNew('folder')}>
            <Icon name="FolderPlus" size={16} className="mr-2" />
            Создать папку
          </ContextMenuItem>
          <ContextMenuItem onClick={() => handleCreateNew('file')}>
            <Icon name="FilePlus" size={16} className="mr-2" />
            Создать файл
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

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
    </div>
  );
};

export default Explorer;