import { IFileInterface } from "@/definitions/interfaces";
import { formatBytes } from "@/lib/helpers/generalHelper";
import React, { useEffect, useState } from "react";

interface FileInputProps {
  allowMulti?: boolean;
  setFiles?: (selectedFiles: Array<IFileInterface>) => void;
  acceptedFileTypes: string[];
  RenderComponent: React.FC<{
    selectedFiles: Array<IFileInterface>;
    onRemove?: (index: number) => void;
  }>;
  classes?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
}

const FileInput: React.FC<FileInputProps> = ({
  allowMulti = false,
  acceptedFileTypes,
  RenderComponent,
  setFiles,
  classes,
  maxFiles = Infinity,
  maxFileSize = Infinity,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<IFileInterface[]>([]);

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File ${file.name} exceeds maximum size of ${formatBytes(maxFileSize)}`;
    }
    const fileType = file.type?.toLowerCase();
    if (
      !fileType ||
      !acceptedFileTypes
        .map((type) => type.replace(".", "").toLowerCase())
        .includes(fileType)
    ) {
      return `File ${file.name} has invalid type. Accepted types: ${acceptedFileTypes.join(", ")}`;
    }
    return null;
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const files = Array.from(fileList);
    if (files.length + selectedFiles.length > maxFiles) {
      console.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate files
    const invalidFiles = files.map(validateFile).filter(Boolean);
    if (invalidFiles.length > 0) {
      console.error(invalidFiles.join("\n"));
      return;
    }

    try {
      const filePromises = files.map((file) => {
        return new Promise<IFileInterface>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              file,
              preview: e.target?.result as string,
              name: file.name.split(".")[0],
              format: file.name.split(".")[1],
              size: formatBytes(file.size),
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const newFiles = await Promise.all(filePromises);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      setFiles?.(newFiles);
    } catch (error) {
      console.error("Error processing files:", error);
    }
  };

  const handleRemove = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={classes}>
      <label htmlFor="fileupload" className="flex-center">
        <RenderComponent
          selectedFiles={selectedFiles}
          onRemove={handleRemove}
        />
      </label>
      <input
        type="file"
        name="fileupload"
        multiple={allowMulti}
        id="fileupload"
        accept={acceptedFileTypes.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default FileInput;
