type FileInputValue = { value: string };

export function handleFileSelection(
  input: FileInputValue,
  file: File | null,
  onChange: (file: File | null) => boolean,
) {
  if (!onChange(file)) input.value = "";
}

export function clearFileSelection(
  input: FileInputValue | null,
  onChange: (file: null) => void,
) {
  if (input) input.value = "";
  onChange(null);
}
