import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface ExeRunnerProps {
  fileName: string;
}

const ExeRunner = ({ fileName }: ExeRunnerProps) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Cog" size={20} className="text-primary animate-spin" />
          <span className="font-medium">{fileName}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-6">
          {loading ? (
            <>
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="Cog" size={64} className="text-white animate-spin" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Запуск программы...</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {fileName}
                </p>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{progress}%</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="CheckCircle2" size={64} className="text-white" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Программа запущена</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {fileName}
                </p>
                <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Статус:</span>
                    <span className="text-green-500 font-medium">Работает</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Режим:</span>
                    <span className="font-medium">Виртуальная среда</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Безопасность:</span>
                    <span className="text-green-500 font-medium">Изолировано</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  ⚠️ Программа работает в изолированной виртуальной среде браузера. 
                  Она НЕ имеет доступа к вашей реальной операционной системе и файлам.
                </p>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" disabled>
                  <Icon name="Pause" size={16} className="mr-2" />
                  Приостановить
                </Button>
                <Button variant="outline" disabled>
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Перезапустить
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExeRunner;
