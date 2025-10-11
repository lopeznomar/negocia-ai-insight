import { Upload } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  icon: string;
  title: string;
  onFileUpload: (file: File) => void;
  disabled?: boolean;
}

export const FileUploadZone = ({ icon, title, onFileUpload, disabled }: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || 
        droppedFile.name.endsWith('.xlsx') || 
        droppedFile.name.endsWith('.xls'))) {
      setFile(droppedFile);
      onFileUpload(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileUpload(selectedFile);
    }
  };

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all duration-300 bg-card",
        isDragging && !disabled ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        file && "border-success bg-success/5"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        disabled={disabled}
      />
      <div className="text-4xl mb-2">{icon}</div>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      {file ? (
        <p className="text-xs text-success font-medium">{file.name}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Arrastra o haz clic para subir
        </p>
      )}
      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
        <Upload className="h-3 w-3" />
        <span>CSV, XLSX, XLS (máx. 10MB)</span>
      </div>
    </div>
  );
};
