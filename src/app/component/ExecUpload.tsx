'use client';

import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";
import {Button} from "@/components/ui/button";
export default function ExcelUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type.includes("spreadsheet") || 
        selectedFile.name.endsWith('.xlsx') || 
        selectedFile.name.endsWith('.xls')) {
      setFile(selectedFile);
      setUploaded(false);
    } else {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)");
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/leads/uploads', {
        method: 'POST',
        body: formData,
      });

      // Simulate progress
      for (let i = 10; i <= 100; i += 15) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 120));
      }

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`${data.count} leads uploaded successfully!`);
        setUploaded(true);
      } else {
        toast.error( "Same Leads cannot be uploads more than ones");
      }
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploaded(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!file ? (
        <>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Upload Excel File</h3>
          <p className="text-gray-500 mb-6">Drag & drop your file here or click below</p>

          <Button onClick={handleBrowseClick} variant="outline" className="mx-auto">
            Browse Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileSelect}
          />

          <p className="text-xs text-gray-400 mt-6">Only .xlsx and .xls files are supported</p>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-gray-50 p-5 rounded-xl">
            <FileSpreadsheet className="w-12 h-12 text-green-600 flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button 
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {uploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <Button 
            onClick={uploadFile} 
            disabled={uploading}
            className="w-full py-6 text-lg"
          >
            {uploading ? `Uploading... ${progress}%` : "Upload Leads to System"}
          </Button>
        </div>
      )}
    </div>
  );
}