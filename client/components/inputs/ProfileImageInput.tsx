import { IFileInterface } from "@/definitions/interfaces";
import Image from "next/image";

const ProfileImageInput = ({
  selectedFiles,
}: {
  selectedFiles: Array<IFileInterface>;
}) => {
  const fileData = selectedFiles.length > 0 ? selectedFiles[0] : null;

  return (
    <div className="cursor-pointer flex-center flex-col gap-2">
      <Image
        src={fileData ? fileData?.preview : "/assets/default-user.png"}
        width={80}
        height={80}
        alt="Profile image"
        className="w-20 h-20 rounded-full border-2 border-white overflow-hidden object-cover"
      />
      {!fileData && <p className="">{"Upload profile picture."}</p>}
    </div>
  );
};

export default ProfileImageInput;
