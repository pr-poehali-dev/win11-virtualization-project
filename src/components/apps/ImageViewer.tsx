import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface ImageViewerProps {
  imagePath?: string;
  fileName?: string;
}

const ImageViewer = ({ imagePath, fileName = 'Изображение' }: ImageViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 400));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(100);
    setRotation(0);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
            disabled={zoom <= 25}
          >
            <Icon name="ZoomOut" size={18} />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
            disabled={zoom >= 400}
          >
            <Icon name="ZoomIn" size={18} />
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRotate}
          >
            <Icon name="RotateCw" size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleReset}
          >
            <Icon name="RotateCcw" size={18} />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {fileName}
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-center justify-center bg-muted/20 p-4">
        {imagePath ? (
          <img
            src={imagePath}
            alt={fileName}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div className="flex flex-col items-center text-muted-foreground">
            <Icon name="ImageOff" size={64} className="mb-4 opacity-20" />
            <p>Изображение не загружено</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
