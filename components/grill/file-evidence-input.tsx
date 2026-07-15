import { useRef } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";

import { clearFileSelection, handleFileSelection } from "@/lib/grill/client/files";
import { cn } from "@/lib/utils";

export function FileEvidenceInput({
  accept,
  description,
  error,
  file,
  id,
  label,
  onChange,
}: {
  accept: string;
  description: string;
  error?: string;
  file: File | null;
  id: string;
  label: string;
  onChange: (file: File | null) => boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <div className="text-sm font-semibold text-[#171513]">{label}</div>
      <label
        className={cn(
          "flex min-h-28 cursor-pointer items-center gap-4 rounded-lg border border-dashed bg-white px-4 py-4 transition-colors",
          error
            ? "border-[#c94134] bg-[#fff5f3]"
            : "border-black/20 hover:border-[#ff6b3d] hover:bg-[#fffaf6]",
        )}
        htmlFor={id}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#171513] text-white">
          {file ? <FileText aria-hidden="true" className="size-4" /> : <UploadCloud aria-hidden="true" className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[#171513]">
            {file ? file.name : "Choose a file"}
          </span>
          <span className="mt-1 block text-xs leading-5 text-[#6f685f]">
            {file ? `${(file.size / 1_000_000).toFixed(2)} MB` : description}
          </span>
        </span>
        <input
          accept={accept}
          className="sr-only"
          id={id}
          onChange={(event) =>
            handleFileSelection(
              event.currentTarget,
              event.currentTarget.files?.[0] ?? null,
              onChange,
            )
          }
          ref={inputRef}
          type="file"
        />
      </label>
      {file ? (
        <button
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#a53f30] hover:text-[#7f281d]"
          onClick={() => clearFileSelection(inputRef.current, onChange)}
          type="button"
        >
          <Trash2 aria-hidden="true" className="size-3.5" />
          Remove
        </button>
      ) : null}
      {error ? <p className="text-xs font-medium text-[#a52d25]">{error}</p> : null}
    </div>
  );
}
