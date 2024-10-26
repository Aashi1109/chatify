import { createChatData, getChatDataByInteraction } from "@/actions/form";
import { IUser } from "@/definitions/interfaces";
import { setInteractionData } from "@/features/chatSlice";
import { useAppDispatch } from "@/hook";
import { getToken, getUserId } from "@/lib/helpers/generalHelper";
import React from "react";
import { toggleModal } from "@/features/uiSlice.ts";
import { Button } from "@/components/ui/button.tsx";
import { Send } from "lucide-react";

const UserChip: React.FC<{ user: IUser }> = ({ user }) => {
  const dispatcher = useAppDispatch();
  const handleButtonClick = async (id: string) => {
    const token = getToken();
    const userId = getUserId();

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
      if (createdChatData) {
        interactionId = createdChatData?._id;
      }
    }

    if (interactionId) {
      dispatcher(setInteractionData(user));
      // dispatcher(setInteractionData(chatData[0]));

      setTimeout(() => {
        dispatcher(toggleModal());
      }, 500);
    }
  };

  return (
    <div
      key={user._id}
      className="px-2 py-1 flex gap-4 items-center bg-gray-800 rounded-md"
    >
      <div>
        <img
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
            onClick={() => handleButtonClick(user._id as string)}
            className="p-1"
          >
            <Send className={"h-7 w-7"} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserChip;
