import { useState, useRef, useEffect } from 'react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
}

interface CommandPromptProps {
  files: FileItem[];
  onCreateFile?: (name: string, type: 'file' | 'folder') => void;
  onDeleteFile?: (name: string) => void;
}

const CommandPrompt = ({ files, onCreateFile, onDeleteFile }: CommandPromptProps) => {
  const [history, setHistory] = useState<string[]>([
    'Microsoft Windows [Версия 10.0.19045.3570]',
    '(c) Корпорация Майкрософт (Microsoft Corporation). Все права защищены.',
    '',
    'C:\\Users\\User>'
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDir, setCurrentDir] = useState('C:\\Users\\User');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
    inputRef.current?.focus();
  }, [history]);

  const executeCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const newHistory = [...history, `${currentDir}> ${cmd}`];
    
    if (!trimmedCmd) {
      setHistory([...newHistory, '']);
      return;
    }

    setCommandHistory([...commandHistory, cmd]);
    setHistoryIndex(-1);

    const parts = cmd.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: string[] = [];

    switch (command) {
      case 'help':
        output = [
          'Доступные команды:',
          '',
          'DIR          - Вывод списка файлов и папок',
          'CD           - Показать текущую директорию',
          'TYPE <file>  - Показать содержимое файла',
          'ECHO <text>  - Вывести текст',
          'CLS          - Очистить экран',
          'DATE         - Показать текущую дату',
          'TIME         - Показать текущее время',
          'VER          - Показать версию системы',
          'MKDIR <name> - Создать папку',
          'DEL <name>   - Удалить файл',
          'TREE         - Показать дерево файлов',
          'HELP         - Показать эту справку',
          'EXIT         - Закрыть окно'
        ];
        break;

      case 'dir':
        output = [
          ` Содержимое папки: ${currentDir}`,
          '',
          `${new Date().toLocaleDateString('ru-RU')}  ${new Date().toLocaleTimeString('ru-RU')}    <DIR>          .`,
          `${new Date().toLocaleDateString('ru-RU')}  ${new Date().toLocaleTimeString('ru-RU')}    <DIR>          ..`,
        ];
        files.forEach(file => {
          const type = file.type === 'folder' ? '<DIR>' : '     ';
          const size = file.type === 'file' ? (file.content?.length || 0).toString().padStart(15) : '              ';
          output.push(`${new Date().toLocaleDateString('ru-RU')}  ${new Date().toLocaleTimeString('ru-RU')}    ${type}    ${size}  ${file.name}`);
        });
        output.push('', `               ${files.length} файлов`);
        break;

      case 'tree':
        output = ['Структура папок:', ''];
        files.filter(f => f.type === 'folder').forEach(folder => {
          output.push(`├── ${folder.name}/`);
        });
        files.filter(f => f.type === 'file').forEach(file => {
          output.push(`└── ${file.name}`);
        });
        break;

      case 'type':
        if (args.length === 0) {
          output = ['Использование: TYPE <имя_файла>'];
        } else {
          const fileName = args.join(' ');
          const file = files.find(f => f.name.toLowerCase() === fileName.toLowerCase() && f.type === 'file');
          if (file) {
            output = (file.content || '').split('\n');
          } else {
            output = ['Файл не найден.'];
          }
        }
        break;

      case 'echo':
        output = [args.join(' ')];
        break;

      case 'cls':
        setHistory([`${currentDir}>`]);
        return;

      case 'date':
        output = [`Текущая дата: ${new Date().toLocaleDateString('ru-RU')}`];
        break;

      case 'time':
        output = [`Текущее время: ${new Date().toLocaleTimeString('ru-RU')}`];
        break;

      case 'ver':
        output = ['Microsoft Windows [Версия 10.0.19045.3570]'];
        break;

      case 'cd':
        output = [currentDir];
        break;

      case 'mkdir':
        if (args.length === 0) {
          output = ['Использование: MKDIR <имя_папки>'];
        } else {
          const folderName = args.join(' ');
          if (onCreateFile) {
            onCreateFile(folderName, 'folder');
            output = ['Папка создана.'];
          } else {
            output = ['Ошибка: функция создания недоступна.'];
          }
        }
        break;

      case 'del':
        if (args.length === 0) {
          output = ['Использование: DEL <имя_файла>'];
        } else {
          const fileName = args.join(' ');
          if (onDeleteFile) {
            onDeleteFile(fileName);
            output = ['Файл удален.'];
          } else {
            output = ['Ошибка: функция удаления недоступна.'];
          }
        }
        break;

      case 'exit':
        output = ['Закрытие окна командной строки...'];
        setTimeout(() => window.close(), 1000);
        break;

      default:
        output = [`'${command}' не является внутренней или внешней командой,`, 'исполняемой программой или пакетным файлом.', '', 'Введите HELP для просмотра списка команд.'];
    }

    setHistory([...newHistory, ...output, '']);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(currentInput);
      setCurrentInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div 
      className="h-full bg-black text-white font-mono text-sm p-4 overflow-auto"
      ref={terminalRef}
      onClick={() => inputRef.current?.focus()}
    >
      {history.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
      <div className="flex items-center">
        <span>{currentDir}&gt; </span>
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-white ml-1"
          autoFocus
        />
      </div>
    </div>
  );
};

export default CommandPrompt;
