'use client';

import { useState, useCallback, useRef } from "react";
import { Upload, FileSpreadsheet, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ExcelUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count?: number; message?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type.includes("spreadsheet") || 
        selectedFile.name.endsWith('.xlsx') || 
        selectedFile.name.endsWith('.xls')) {
      setFile(selectedFile);
      setUploaded(false);
      setResult(null);
    } else {
      toast.error("Please upload a valid Excel file (.xlsx or .xls)");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) validateAndSetFile(selectedFile);
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
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  const uploadFile = async () => {
    if (!file || uploading) return;

    setUploading(true);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate smooth progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
      }, 180);

      const res = await fetch('/api/leads/uploads', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({ 
          success: true, 
          count: data.count || 0,
          message: data.message 
        });
        setUploaded(true);
        toast.success(`${data.count || 0} leads uploaded successfully!`);
      } else {
        setResult({ success: false, message: data.message });
        toast.error(data.message || "Upload failed. Duplicate leads detected.");
      }
    } catch (error) {
      setResult({ success: false, message: "Network error" });
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploaded(false);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200
        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {!file ? (
        <>
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
            <Upload className="w-10 h-10 text-blue-600" />
          </div>
          
          <h3 className="text-2xl font-semibold mb-3">Upload Excel File</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Drag & drop your Excel file here or click to browse
          </p>

          <Button onClick={handleBrowseClick} size="lg" variant="outline" className="mx-auto">
            Browse Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileSelect}
          />

          <p className="text-xs text-gray-400 mt-8">
            Only .xlsx and .xls files are supported • Max 5MB
          </p>
        </>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-5 bg-gray-50 p-6 rounded-2xl">
            <FileSpreadsheet className="w-14 h-14 text-green-600 flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-lg truncate">{file.name}</p>
              <p className="text-sm text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button 
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 p-2"
            >
              <X size={24} />
            </button>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-200" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600">{progress}% Processing...</p>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-2xl text-center ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              {result.success ? (
                <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
              ) : null}
              <p className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
            </div>
          )}

          <Button 
            onClick={uploadFile} 
            disabled={uploading}
            className="w-full py-7 text-lg font-semibold rounded-2xl"
          >
            {uploading ? `Uploading... ${progress}%` : "Upload Leads to System"}
          </Button>
        </div>
      )}
    </div>
  );
}