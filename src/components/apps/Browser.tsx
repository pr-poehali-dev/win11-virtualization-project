import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Browser = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [inputUrl, setInputUrl] = useState(url);
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = () => {
    let newUrl = inputUrl.trim();
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = 'https://' + newUrl;
    }
    setUrl(newUrl);
    setIsLoading(true);
  };

  const handleBack = () => {
    iframeRef.current?.contentWindow?.history.back();
  };

  const handleForward = () => {
    iframeRef.current?.contentWindow?.history.forward();
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = url;
      setIsLoading(true);
    }
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    try {
      const currentUrl = iframeRef.current?.contentWindow?.location.href;
      if (currentUrl && currentUrl !== 'about:blank') {
        setInputUrl(currentUrl);
      }
    } catch (e) {
      
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center gap-2 p-2 border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleBack}
        >
          <Icon name="ChevronLeft" size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleForward}
        >
          <Icon name="ChevronRight" size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRefresh}
        >
          <Icon name={isLoading ? 'Loader2' : 'RotateCw'} size={18} className={isLoading ? 'animate-spin' : ''} />
        </Button>
        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-1">
          <Icon name="Lock" size={14} className="text-muted-foreground" />
          <Input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-7 px-0"
            placeholder="Введите адрес или поисковый запрос..."
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <Icon name="Star" size={18} />
        </Button>
      </div>

      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={handleIframeLoad}
          title="Browser content"
        />
      </div>
    </div>
  );
};

export default Browser;
