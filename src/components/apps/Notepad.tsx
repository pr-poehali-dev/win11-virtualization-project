import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Notepad = () => {
  const [content, setContent] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Файл сохранен!');
  };

  const handleNew = () => {
    if (content && !confirm('Вы уверены? Несохраненные данные будут потеряны.')) {
      return;
    }
    setContent('');
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
          variant="ghost"
          size="icon"
          className="h-8 w-8"
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
        } ${isItalic ? 'italic' : ''}`}
      />
    </div>
  );
};

export default Notepad;
