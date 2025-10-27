import Icon from '@/components/ui/icon';

interface PDFViewerProps {
  pdfSrc: string;
  fileName: string;
}

const PDFViewer = ({ pdfSrc, fileName }: PDFViewerProps) => {
  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="FileText" size={20} className="text-primary" />
          <span className="font-medium">{fileName}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-muted/20">
        <iframe
          src={pdfSrc}
          className="w-full h-full border-0"
          title={fileName}
        />
      </div>
    </div>
  );
};

export default PDFViewer;
