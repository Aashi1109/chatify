import { IFileInterface } from "@/definitions/interfaces";
import { formatBytes } from "@/utils/generalHelper";
import React, { useEffect, useState } from "react";

interface UPPropsInterface {
  allowMulti?: boolean;
  setFiles?: (selectedFiles: Array<IFileInterface>) => void;
  acceptedFileTypes: string[];
  RenderComponent: React.FC<{ selectedFiles: Array<IFileInterface> }>;
  classes?: string;
}

const FileInput: React.FC<UPPropsInterface> = (props) => {
  const { allowMulti, acceptedFileTypes, RenderComponent, setFiles, classes } =
    props;

  const [selectedFiles, setSelectedFiles] = useState<IFileInterface[]>([]);

  const handleImageUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
  };

  const changeImage = (event: React.ChangeEvent) => {
    const files = Array.from(event.target?.files) as Array<File>;
    const readerPromises = files.map((file) => {
      return new Promise<IFileInterface>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgData: IFileInterface = {
            file,
            preview: e.target!.result as string,
            name: file.name.split(".")[0],
            format: file.name.split(".")[1],
            size: formatBytes(file.size),
          };
          resolve(imgData);
        };
        reader.onerror = (e) => {
          reject(e);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readerPromises)
      .then((imageDataArray) => {
        setSelectedFiles(imageDataArray);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const removeSelectedImage = (index: number) => {
    const updatedImages = [...selectedFiles];
    updatedImages.splice(index, 1);
    setSelectedFiles(updatedImages);
  };

  // const customChangeHandler = (event) => {
  //   field.onChange(event);
  //   changeImage(event);
  // };
  useEffect(() => {
    selectedFiles.forEach(async (image) => {
      await handleImageUpload(image.preview as File);
    });
    if (setFiles) {
      setFiles(selectedFiles);
    }

    return () => {
      // setSelectedFiles([]);
      setFiles && setFiles([]);
    };
  }, [selectedFiles, setFiles]);

  return (
    <div className={classes}>
      <label htmlFor="fileupload" className="flex-center">
        <RenderComponent selectedFiles={selectedFiles} />
      </label>
      <input
        type="file"
        name="fileupload"
        multiple={allowMulti}
        id="fileupload"
        accept={acceptedFileTypes.join(",")}
        onChange={changeImage}
        className="hidden"
      />
    </div>
  );
};

export default FileInput;
