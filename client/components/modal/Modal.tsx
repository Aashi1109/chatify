"use client";

import clsx from "clsx";
import React from "react";

const Modal: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  toogleModal: () => void;
}> = ({ children, toogleModal, isOpen }) => {
  return (
    <div
      className={clsx(
        "fixed h-full w-full top-0 left-0 z-10 backdrop-blur-sm",
        { "flex-center": isOpen, hidden: !isOpen }
      )}
      onClick={toogleModal}
    >
      <div className="flex-center" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
