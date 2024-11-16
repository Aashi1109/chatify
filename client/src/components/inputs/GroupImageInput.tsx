import { IFileInterface } from "@/definitions/interfaces";

const GroupImageInput = ({
  selectedFiles,
}: {
  selectedFiles: Array<IFileInterface>;
}) => {
  const fileData = selectedFiles.length > 0 ? selectedFiles[0] : null;

  return (
    <div className="cursor-pointer flex-center flex-col gap-2">
      <img
        src={fileData?.preview ? fileData?.preview : "/assets/default-user.png"}
        width={80}
        height={80}
        alt="Group image"
        className="w-20 h-20 rounded-full border-2 border-white overflow-hidden object-cover"
      />
      {!fileData && <p className="">{"Upload group picture."}</p>}
    </div>
  );
};

export default GroupImageInput;
