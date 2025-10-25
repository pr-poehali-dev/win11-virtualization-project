import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface WindowProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  isMaximized: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  onPositionChange: (x: number, y: number) => void;
  onSizeChange: (width: number, height: number) => void;
}

const Window = ({
  id,
  title,
  icon,
  children,
  isMaximized,
  x,
  y,
  width,
  height,
  zIndex,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onPositionChange,
  onSizeChange,
}: WindowProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        onPositionChange(e.clientX - dragOffset.x, e.clientY - dragOffset.y);
      }
      if (isResizing && !isMaximized) {
        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
          const newWidth = Math.max(400, e.clientX - rect.left);
          const newHeight = Math.max(300, e.clientY - rect.top);
          onSizeChange(newWidth, newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragOffset, isMaximized, onPositionChange, onSizeChange]);

  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    onFocus();
    setIsDragging(true);
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0 || isMaximized) return;
    setIsResizing(true);
  };

  const style = isMaximized
    ? { left: 0, top: 0, width: '100vw', height: 'calc(100vh - 48px)' }
    : { left: x, top: y, width, height };

  return (
    <div
      ref={windowRef}
      className={`absolute bg-window border border-border window-shadow animate-scale-in ${
        isMaximized ? 'rounded-none' : 'rounded-xl'
      }`}
      style={{ ...style, zIndex }}
      onMouseDown={onFocus}
    >
      <div
        className="h-10 bg-card/50 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 cursor-move select-none rounded-t-xl"
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2">
          <Icon name={icon} size={16} />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent/50"
            onClick={onMinimize}
          >
            <Icon name="Minus" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent/50"
            onClick={onMaximize}
          >
            <Icon name={isMaximized ? 'Minimize2' : 'Square'} size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
            onClick={onClose}
          >
            <Icon name="X" size={14} />
          </Button>
        </div>
      </div>

      <div className="overflow-auto" style={{ height: 'calc(100% - 40px)' }}>
        {children}
      </div>

      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

export default Window;
