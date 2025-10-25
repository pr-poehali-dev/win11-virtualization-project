import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
}

interface DragState {
  draggedTabId: string | null;
  dragOverTabId: string | null;
}

const Browser = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab-1', title: 'Google', url: 'https://www.google.com', isLoading: false }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [inputUrl, setInputUrl] = useState('https://www.google.com');
  const [dragState, setDragState] = useState<DragState>({ draggedTabId: null, dragOverTabId: null });
  const iframeRefs = useRef<{ [key: string]: HTMLIFrameElement | null }>({});

  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (activeTab) {
      setInputUrl(activeTab.url);
    }
  }, [activeTabId, activeTab]);

  const createNewTab = () => {
    const newTab: BrowserTab = {
      id: `tab-${Date.now()}`,
      title: 'Новая вкладка',
      url: 'https://www.google.com',
      isLoading: false
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (tabs.length === 1) return;
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[Math.max(0, tabIndex - 1)];
      setActiveTabId(newActiveTab.id);
    }
  };

  const handleTabDragStart = (tabId: string, e: React.DragEvent) => {
    setDragState({ draggedTabId: tabId, dragOverTabId: null });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTabDragOver = (tabId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (dragState.draggedTabId && dragState.draggedTabId !== tabId) {
      setDragState(prev => ({ ...prev, dragOverTabId: tabId }));
    }
  };

  const handleTabDrop = (targetTabId: string, e: React.DragEvent) => {
    e.preventDefault();
    const { draggedTabId } = dragState;
    
    if (!draggedTabId || draggedTabId === targetTabId) {
      setDragState({ draggedTabId: null, dragOverTabId: null });
      return;
    }

    const draggedIndex = tabs.findIndex(t => t.id === draggedTabId);
    const targetIndex = tabs.findIndex(t => t.id === targetTabId);
    
    const newTabs = [...tabs];
    const [draggedTab] = newTabs.splice(draggedIndex, 1);
    newTabs.splice(targetIndex, 0, draggedTab);
    
    setTabs(newTabs);
    setDragState({ draggedTabId: null, dragOverTabId: null });
  };

  const handleTabDragEnd = () => {
    setDragState({ draggedTabId: null, dragOverTabId: null });
  };

  const handleNavigate = () => {
    if (!activeTab) return;
    
    let newUrl = inputUrl.trim();
    
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      if (newUrl.includes('.')) {
        newUrl = 'https://' + newUrl;
      } else {
        newUrl = 'https://www.google.com/search?igu=1&q=' + encodeURIComponent(newUrl);
      }
    }
    
    setTabs(tabs.map(t => 
      t.id === activeTabId 
        ? { ...t, url: newUrl, isLoading: true }
        : t
    ));
  };

  const handleBack = () => {
    iframeRefs.current[activeTabId]?.contentWindow?.history.back();
  };

  const handleForward = () => {
    iframeRefs.current[activeTabId]?.contentWindow?.history.forward();
  };

  const handleRefresh = () => {
    if (!activeTab) return;
    const iframe = iframeRefs.current[activeTabId];
    if (iframe) {
      iframe.src = activeTab.url;
      setTabs(tabs.map(t => 
        t.id === activeTabId 
          ? { ...t, isLoading: true }
          : t
      ));
    }
  };

  const handleIframeLoad = (tabId: string) => {
    setTabs(tabs.map(t => 
      t.id === tabId 
        ? { ...t, isLoading: false }
        : t
    ));
    
    try {
      const iframe = iframeRefs.current[tabId];
      const currentUrl = iframe?.contentWindow?.location.href;
      if (currentUrl && currentUrl !== 'about:blank') {
        setTabs(tabs.map(t => 
          t.id === tabId 
            ? { ...t, url: currentUrl }
            : t
        ));
      }
    } catch (e) {
      // Cross-origin error
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tabs bar */}
      <div className="flex items-center bg-secondary/50 border-b border-border overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            draggable
            onClick={() => setActiveTabId(tab.id)}
            onDragStart={(e) => handleTabDragStart(tab.id, e)}
            onDragOver={(e) => handleTabDragOver(tab.id, e)}
            onDrop={(e) => handleTabDrop(tab.id, e)}
            onDragEnd={handleTabDragEnd}
            className={`flex items-center gap-2 px-4 py-2 border-r border-border cursor-move hover:bg-secondary/80 transition-colors min-w-[150px] max-w-[200px] ${
              activeTabId === tab.id ? 'bg-background' : ''
            } ${dragState.draggedTabId === tab.id ? 'opacity-50' : ''} ${
              dragState.dragOverTabId === tab.id ? 'border-l-2 border-l-primary' : ''
            }`}
          >
            {tab.isLoading ? (
              <Icon name="Loader2" size={14} className="animate-spin flex-shrink-0" />
            ) : (
              <Icon name="Globe" size={14} className="flex-shrink-0" />
            )}
            <span className="text-sm truncate flex-1">{tab.title}</span>
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 hover:bg-accent/50 flex-shrink-0"
                onClick={(e) => closeTab(tab.id, e)}
              >
                <Icon name="X" size={12} />
              </Button>
            )}
          </div>
        ))}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 mx-1 flex-shrink-0"
          onClick={createNewTab}
        >
          <Icon name="Plus" size={16} />
        </Button>
      </div>

      {/* Navigation bar */}
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
          <Icon name={activeTab?.isLoading ? 'Loader2' : 'RotateCw'} size={18} className={activeTab?.isLoading ? 'animate-spin' : ''} />
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

      {/* Tabs content */}
      <div className="flex-1 relative bg-background">
        {tabs.map(tab => (
          <iframe
            key={tab.id}
            ref={(el) => { iframeRefs.current[tab.id] = el; }}
            src={tab.url}
            className={`w-full h-full border-0 absolute inset-0 ${
              activeTabId === tab.id ? 'block' : 'hidden'
            }`}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
            onLoad={() => handleIframeLoad(tab.id)}
            title={`Browser tab ${tab.id}`}
            referrerPolicy="no-referrer"
          />
        ))}
      </div>
    </div>
  );
};

export default Browser;