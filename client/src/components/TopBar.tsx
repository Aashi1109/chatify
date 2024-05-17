import { updateQueryString } from "@/utils/generalHelper";
import { useState } from "react";
import Button from "./Button";
import CircleAvatar from "./CircleAvatar";
import NewChat from "./forms/NewChat";
import Modal from "./modal/Modal";

const TopBar = ({ userData }: { userData: object | any }) => {
  const {
    name,
    profileImage: { url },
  } = userData ?? { name: undefined, profileImage: { url: undefined } };

  const [isModalOpen, setIsModalOpen] = useState(false);

  // const searchParams = useSearchParams();
  const toggleModal = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const updateAndToogleModal = () => {
    toggleModal();
    // updateQueryString(searchParams, "interactionId", "", "remove");
  };
  return (
    <section className="section-bg flex justify-between items-center col-span-10 p-6">
      <Modal isOpen={isModalOpen} toogleModal={updateAndToogleModal}>
        <NewChat toogleModal={toggleModal} />
        {/* <GroupForm /> */}
      </Modal>

      <p className="text-white text-2xl font-normal">Chats</p>
      <div className="flex gap-6">
        <Button
          iconUrl="/assets/plus.png"
          iconSize={14}
          text="New chat"
          callback={toggleModal}
          classes="py-1 px-3"
        />
        <div className="flex justify-center items-center relative">
          <img
            src={"/assets/notification.png"}
            alt="notification"
            width={24}
            height={24}
            className="object-cover"
          />
          <div className="h-2 w-2 rounded-full bg-[--danger-hex] absolute top-1 right-0"></div>
        </div>
        <div className="flex gap-4 items-center text-lg">
          <CircleAvatar
            size={40}
            imageUrl={url ? url : "/assets/user.png"}
            alt={"User Icon"}
          />
          <div>
            Hii, <strong>{name}</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopBar;
