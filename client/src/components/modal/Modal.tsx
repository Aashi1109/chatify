import clsx from "clsx";
import React, { FC } from "react";
import { useAppDispatch, useAppSelector } from "@/hook";
import { toggleModal } from "@/features/uiSlice.ts";

const Modal: FC<{ children: React.ReactNode }> = ({ children }) => {
  const isModalOpen = useAppSelector((state) => state.ui.isModalOpen);
  const dispatch = useAppDispatch();
  return (
    <div
      className={clsx(
        "fixed h-full w-full top-0 left-0 z-10 backdrop-blur-sm",
        { "flex-center": isModalOpen, hidden: !isModalOpen },
      )}
      onClick={() => {
        dispatch(toggleModal());
      }}
    >
      <div className="flex-center" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
