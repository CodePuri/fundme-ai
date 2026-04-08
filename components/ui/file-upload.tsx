import { UploadCloud, FileText, X } from "lucide-react";
import React, { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";

interface FileUploadProps {
  files: string[];
  onChange: (files: string[]) => void;
  className?: string;
}

export function FileUploadArea({ files, onChange, className = "" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [files, onChange],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFiles(Array.from(e.target.files));
      }
    },
    [files, onChange],
  );

  const handleFiles = (newFiles: File[]) => {
    const fileNames = newFiles.map((f) => f.name);
    // filter out duplicates
    const uniqueNew = fileNames.filter((name) => !files.includes(name));
    onChange([...files, ...uniqueNew]);
  };

  const removeFile = (fileName: string) => {
    onChange(files.filter((name) => name !== fileName));
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-[16px] border-2 border-dashed transition-colors ${
          isDragging
            ? "border-[var(--text-primary)] bg-[var(--surface-elevated)] opacity-90"
            : "border-[var(--border-strong)] bg-[var(--surface-elevated)] hover:bg-[var(--surface)]"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          multiple
          onChange={handleChange}
          ref={inputRef}
          style={{ display: "none" }}
          type="file"
        />
        <div className="flex flex-col items-center text-center pointer-events-none">
          <UploadCloud
            className={`mb-4 size-8 ${isDragging ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"}`}
          />
          <div className="text-[17px] font-medium tracking-tight text-[var(--text-primary)]">
            Click to upload or drag and drop
          </div>
          <div className="mt-1 text-[14px] text-[var(--text-muted)]">
            PDF, DOCX, or TXT
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2 relative z-10 w-full mb-6">
          {files.map((file) => (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 5 }}
              key={file}
              className="group flex w-full items-center justify-between overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface-elevated)] p-3 pr-4 shadow-sm"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
                  <FileText className="size-4 text-[var(--text-muted)]" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-[14px] font-medium text-[var(--text-primary)]">
                    {file}
                  </span>
                  <span className="text-[12px] text-[var(--text-muted)]">
                    Uploaded Document
                  </span>
                </div>
              </div>
              <button
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)] transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file);
                }}
                type="button"
              >
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
