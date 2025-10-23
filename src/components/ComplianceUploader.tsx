import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ComplianceUploaderProps {
  onFileUpload: (file: File) => void;
}

export const ComplianceUploader = ({ onFileUpload }: ComplianceUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      onFileUpload(file);
    }
  };

  return (
    <Card className="border-2 border-dashed border-border hover:border-primary transition-colors duration-300">
      <div
        className={`p-12 text-center ${dragActive ? "bg-primary/10" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10 neon-glow">
            <Upload className="h-12 w-12 text-primary" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2">Upload Facility Logs</h3>
            <p className="text-muted-foreground mb-4">
              Drop CSV, Excel, PDF, or image files here
            </p>
          </div>

          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleChange}
            accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"
          />
          
          <label htmlFor="file-upload">
            <Button asChild className="neon-glow cursor-pointer">
              <span>Select File</span>
            </Button>
          </label>

          {selectedFile && (
            <div className="flex items-center gap-2 mt-4 text-sm">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-foreground">{selectedFile.name}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground mt-4">
            Supported formats: CSV, Excel, PDF, JPG, PNG
          </div>
        </div>
      </div>
    </Card>
  );
};
