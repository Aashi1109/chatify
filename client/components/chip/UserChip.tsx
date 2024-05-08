import { createChatData, getChatDataByInteraction } from "@/actions/form";
import { IUser } from "@/definitions/interfaces";
import { getToken, updateQueryString } from "@/utils/generalHelper";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import Button from "../Button";

const UserChip: React.FC<{ user: IUser; toogleModal: () => void }> = ({
  user,
  toogleModal,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleButtonClick = async (id: string) => {
    const token = getToken();
    const userId = searchParams.get("userId");

    if (!token || !userId) {
      return;
    }

    let interactionId: string | undefined = undefined;
    const chatData: Array<any> = await getChatDataByInteraction(
      token,
      userId,
      id
    );

    if (!!chatData && chatData?.length) {
      interactionId = chatData[0]?._id;
    } else {
      const createdChatData = await createChatData(token, userId, id);
      if (!!createdChatData) {
        interactionId = createdChatData?._id;
      }
    }

    if (interactionId) {
      const query = updateQueryString(
        searchParams,
        "interactionId",
        interactionId,
        "upadd"
      );

      router.push(`?${query}`);

      setTimeout(() => {
        toogleModal();
      }, 500);
    }
  };

  return (
    <div
      key={user._id}
      className="px-2 py-1 flex gap-4 items-center bg-gray-800 rounded-md"
    >
      <div>
        <Image
          src={user.profileImage.url}
          alt={user.name}
          width={40}
          height={40}
          className="rounded flex-shrink-0 block"
        />
      </div>
      <div className="flex-1 flex justify-between items-center">
        <div className="flex flex-col">
          <p className="font-light">{user.name}</p>
          <p>@{user.username}</p>
        </div>

        <div>
          <Button
            callback={() => handleButtonClick(user._id as string)}
            iconSize={30}
            iconUrl="/assets/send.png"
            applyInvertFilter={false}
            classes="p-1"
          />
        </div>
      </div>
    </div>
  );
};

export default UserChip;
