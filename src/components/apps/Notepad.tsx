import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface NotepadProps {
  fileId?: string;
  fileName?: string;
  initialContent?: string;
  onSave: (content: string, fileName: string, fileId?: string) => { success: boolean; error?: string };
}

const Notepad = ({ fileId, fileName: initialFileName = 'Новый документ', initialContent = '', onSave }: NotepadProps) => {
  const [content, setContent] = useState(initialContent);
  const [fileName, setFileName] = useState(initialFileName);
  const [currentFileId, setCurrentFileId] = useState(fileId);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [saveAsDialogOpen, setSaveAsDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  useEffect(() => {
    setContent(initialContent);
    setFileName(initialFileName);
    setCurrentFileId(fileId);
  }, [initialContent, initialFileName, fileId]);

  const handleSave = () => {
    if (!currentFileId) {
      // Если файл еще не сохранялся, открываем диалог "Сохранить как"
      setSaveAsDialogOpen(true);
      return;
    }
    
    const result = onSave(content, fileName, currentFileId);
    if (result.success) {
      toast.success('Файл сохранен!');
    } else {
      toast.error(result.error || 'Ошибка сохранения');
    }
  };

  const handleSaveAs = () => {
    setNewFileName(fileName.replace('.txt', ''));
    setSaveAsDialogOpen(true);
  };

  const handleSaveAsConfirm = () => {
    if (newFileName.trim()) {
      const finalFileName = newFileName.endsWith('.txt') ? newFileName : `${newFileName}.txt`;
      const result = onSave(content, finalFileName, undefined); // undefined означает создание нового файла
      
      if (result.success) {
        setFileName(finalFileName);
        setCurrentFileId(`file-${Date.now()}`);
        setSaveAsDialogOpen(false);
        toast.success('Файл сохранен как ' + finalFileName);
      } else {
        setSaveAsDialogOpen(false);
        toast.error(result.error || 'Ошибка сохранения');
      }
    }
  };

  const handleNew = () => {
    if (content && !confirm('Вы уверены? Несохраненные данные будут потеряны.')) {
      return;
    }
    setContent('');
    setFileName('Новый документ');
    setCurrentFileId(undefined);
    toast.info('Создан новый документ');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-1 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={handleNew}
        >
          <Icon name="FilePlus" size={16} />
          Новый
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={handleSave}
        >
          <Icon name="Save" size={16} />
          Сохранить
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          onClick={handleSaveAs}
        >
          <Icon name="Save" size={16} />
          Сохранить как
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />

        <Button
          variant={isBold ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsBold(!isBold)}
        >
          <Icon name="Bold" size={16} />
        </Button>
        <Button
          variant={isItalic ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsItalic(!isItalic)}
        >
          <Icon name="Italic" size={16} />
        </Button>
        <Button
          variant={isUnderline ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsUnderline(!isUnderline)}
        >
          <Icon name="Underline" size={16} />
        </Button>
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Начните печатать..."
        className={`flex-1 border-0 rounded-none focus-visible:ring-0 resize-none p-4 font-mono ${
          isBold ? 'font-bold' : ''
        } ${isItalic ? 'italic' : ''} ${isUnderline ? 'underline' : ''}`}
      />

      <Dialog open={saveAsDialogOpen} onOpenChange={setSaveAsDialogOpen}>
        <DialogContent className="z-[10000]">
          <DialogHeader>
            <DialogTitle>Сохранить как</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Введите имя файла..."
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveAsConfirm()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveAsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveAsConfirm}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notepad;