"use client";
import Image from "next/image";
import { ToastContainer } from "react-toastify";

const ToastCloseButton = ({
  closeToast,
}: {
  closeToast: (e: React.MouseEvent<HTMLElement>) => void;
}) => (
  <div onClick={closeToast} className="p-2 cursor-pointer">
    <Image
      src={"/assets/cross.png"}
      width={20}
      height={20}
      alt="Cancel"
      className="opacity-65"
    />
  </div>
);
const CustomToaster = () => {
  return (
    <ToastContainer
      bodyClassName={(context) => "flex-1 w-full toast-div-fix"}
      toastStyle={{ padding: 0 }}
      closeButton={({ closeToast }) => (
        <ToastCloseButton closeToast={closeToast} />
      )}
      hideProgressBar={true}
      autoClose={3000}
    />
  );
};

export default CustomToaster;
