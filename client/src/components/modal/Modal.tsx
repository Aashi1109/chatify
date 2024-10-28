import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { X } from "lucide-react";
import React, { FC } from "react";

const Modal: FC<{
  children: React.ReactNode;
  isModalOpen: boolean;
  handleModalClose: () => void;
  modalWrapperStyles?: ClassValue[];
}> = ({ isModalOpen, children, handleModalClose, modalWrapperStyles }) => {
  return (
    <div
      className={cn("fixed h-full w-full top-0 left-0 z-10 backdrop-blur-sm", {
        "flex-center": isModalOpen,
        hidden: !isModalOpen,
      })}
      onClick={handleModalClose}
    >
      <div className="flex-center" onClick={(event) => event.stopPropagation()}>
        <div
          className={cn(
            "rounded-xl p-8 bg-background w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-scroll flex-grow-0 relative",
            modalWrapperStyles
          )}
        >
          <X
            className="text-3xl cursor-pointer absolute top-6 right-6"
            onClick={handleModalClose}
          />
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
