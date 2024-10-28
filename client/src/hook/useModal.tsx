import Modal from "@/components/modal/Modal";
import { ClassValue } from "clsx";
import { useCallback, useState, ReactNode } from "react";

const useModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const RenderModal = useCallback(
    ({
      children,
      modalWrapperStyles,
    }: {
      children: ReactNode;
      modalWrapperStyles?: ClassValue[];
    }) => {
      return (
        isModalOpen && (
          <Modal
            handleModalClose={handleModalClose}
            isModalOpen={isModalOpen}
            modalWrapperStyles={modalWrapperStyles}
          >
            {children}
          </Modal>
        )
      );
    },
    [isModalOpen]
  );

  return {
    RenderModal,
    handleModalClose,
    handleModalOpen,
  };
};

export default useModal;
