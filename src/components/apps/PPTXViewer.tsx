import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface PPTXViewerProps {
  pptxSrc: string;
  fileName: string;
}

const PPTXViewer = ({ pptxSrc, fileName }: PPTXViewerProps) => {
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pptxSrc;
    a.download = fileName;
    a.click();
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Presentation" size={20} className="text-primary" />
          <span className="font-medium">{fileName}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Icon name="Presentation" size={64} className="text-white" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">{fileName}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Файл PowerPoint (.pptx)
            </p>
            <p className="text-sm text-muted-foreground">
              Для просмотра презентации скачайте файл и откройте его в Microsoft PowerPoint, Google Презентациях или LibreOffice Impress.
            </p>
          </div>

          <Button onClick={handleDownload} className="gap-2">
            <Icon name="Download" size={16} />
            Скачать файл
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PPTXViewer;
