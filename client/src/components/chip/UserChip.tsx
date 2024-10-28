import { createChatData, getChatDataByInteraction } from "@/actions/form";
import { IUser } from "@/definitions/interfaces";
import { setInteractionData } from "@/features/chatSlice";
import { useAppDispatch, useAppSelector } from "@/hook";
import React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Send } from "lucide-react";
import CircleAvatar from "../CircleAvatar";

const UserChip: React.FC<{ user: IUser }> = ({ user }) => {
  const dispatcher = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);

  const handleButtonClick = async (id: string) => {
    let interactionId: string | undefined = undefined;

    const chatData: Array<any> = await getChatDataByInteraction(
      currentUser?._id,
      id
    );

    if (!!chatData && chatData?.length) {
      interactionId = chatData[0]?._id;
    } else {
      const createdChatData = await createChatData(currentUser?._id, id);
      if (createdChatData) {
        interactionId = createdChatData?._id;
      }
    }

    if (interactionId) {
      dispatcher(setInteractionData(user));
      // dispatcher(setInteractionData(chatData[0]));

      setTimeout(() => {}, 500);
    }
  };

  return (
    <div
      key={user._id}
      className="px-2 py-1 flex gap-4 items-center bg-gray-800 rounded-md"
    >
      <CircleAvatar
        imageUrl={user.profileImage.url}
        alt={user.name}
        fallback={user.username?.slice(0, 1)?.toUpperCase()}
        classes={"bg-foreground"}
      />

      <div className="flex-1 flex justify-between items-center">
        <div className="flex flex-col">
          <p className="font-light">{user.name}</p>
          <p>@{user.username}</p>
        </div>

        <div>
          <Button
            onClick={() => handleButtonClick(user._id as string)}
            className="p-1 h-8 w-8"
          >
            <Send className={"h-4 w-4"} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserChip;
