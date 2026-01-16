import React, { useEffect, useCallback } from 'react';
import { Button } from './Button';

interface FileUploaderProps {
  onUpload: (files: string[]) => void;
  isLoading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isLoading }) => {
  const processFiles = useCallback((files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (validFiles.length === 0) return;

    const readers = validFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(base64Files => {
      onUpload(base64Files);
    });
  }, [onUpload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (isLoading) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) files.push(blob);
      }
    }
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles, isLoading]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  return (
    <div className="group relative flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-3xl p-16 bg-slate-900/50 hover:bg-slate-900/80 hover:border-indigo-500 transition-all duration-500 cursor-pointer overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none blur-3xl" />

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        disabled={isLoading}
      />

      <div className="relative z-10 text-center scale-100 group-hover:scale-105 transition-transform duration-500">
        <div className="mx-auto h-20 w-20 text-indigo-400 mb-6 bg-indigo-500/10 rounded-full p-4 flex items-center justify-center">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Damon's Staging Workspace</h3>
        <p className="text-slate-400 max-w-sm mx-auto mb-8 text-lg">
          Upload room photos, paste from your clipboard, or drag and drop.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Button variant="primary" className="px-10 py-4 text-lg">
            Start Staging
          </Button>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 font-sans">CMD+V</kbd>
            <span>to paste quickly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
