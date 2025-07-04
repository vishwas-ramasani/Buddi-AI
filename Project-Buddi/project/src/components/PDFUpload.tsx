import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { PDFDocument } from '../types';
import { pdfService } from '../services/pdfService';

interface PDFUploadProps {
  onDocumentUploaded: (document: PDFDocument) => void;
  currentDocument: PDFDocument | null;
  onClearDocument: () => void;
}

export const PDFUpload: React.FC<PDFUploadProps> = ({
  onDocumentUploaded,
  currentDocument,
  onClearDocument,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const content = await pdfService.extractTextFromPDF(file);
      const document: PDFDocument = {
        name: file.name,
        content,
        uploadedAt: new Date(),
      };
      onDocumentUploaded(document);
    } catch (err) {
      setError('Failed to process PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  if (currentDocument) {
    return (
      <div className="bg-gradient-to-br from-green-100 to-emerald-100 backdrop-blur-sm rounded-xl p-4 border border-green-200 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-200 rounded-xl shadow-inner">
              <FileText className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="font-medium text-green-800">{currentDocument.name}</p>
              <p className="text-sm text-green-600">
                Uploaded {currentDocument.uploadedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClearDocument}
            className="p-2 text-green-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-orange-400 bg-orange-50'
            : 'border-orange-300 hover:border-orange-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${
            isDragOver ? 'bg-gradient-to-br from-orange-400 to-red-500' : 'bg-gradient-to-br from-orange-300 to-red-400'
          }`}>
            <Upload className={`w-8 h-8 ${isDragOver ? 'text-white' : 'text-white'}`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-orange-800">
              {isUploading ? 'Processing PDF...' : 'Upload your PDF'}
            </p>
            <p className="text-orange-700 mt-1 leading-relaxed">
              Drag and drop your PDF file here, or click to browse
            </p>
            <p className="text-sm text-orange-600 mt-2">
              Maximum file size: 10MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-red-100 to-pink-100 border border-red-300 rounded-xl text-red-700 shadow-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};