import { getMessagesByQuery } from "@/actions/form";
import { ChatInfoItemI } from "@/definitions/interfaces";
import {
  setInteractionData,
  setInteractionMessages,
} from "@/features/chatSlice";
import { useAppDispatch } from "@/hook";
import React from "react";
import CircleAvatar from "../CircleAvatar";
import { cn } from "@/lib/utils";

const ChatInfoItem: React.FC<{
  chatData: ChatInfoItemI;
  classes?: string;
}> = ({ chatData, classes }) => {
  const {
    chatsNotRead,
    imageUrl,
    isUserActive,
    lastChatText,
    lastChatTime,
    chatId,
    user,
    userName,
  } = chatData;

  const dispatcher = useAppDispatch();

  // const formattedLastTime = formatTimeAgo(lastChatTime);
  const handleChatInfoItemClick = async () => {
    const messagesResp = await getMessagesByQuery({ chatId: chatId });
    if (messagesResp.success) {
      dispatcher(setInteractionData(user));
      dispatcher(setInteractionMessages(messagesResp?.data || []));
    }
  };

  return (
    <div
      className={cn(
        "flex-center py-4 px-2 cursor-pointer rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 hover:scale-[1.01] chat-list-item",
        classes
      )}
      onClick={handleChatInfoItemClick}
    >
      <div className="relative mr-4">
        <CircleAvatar
          alt={"user image"}
          imageUrl={imageUrl}
          fallback={user.name?.slice(0, 1)?.toUpperCase()}
        />
        {isUserActive && (
          <div className="h-3 w-3 rounded-full border-2 bg-green-600 absolute top-0 right-0"></div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center flex-1 flex-nowrap">
          <p className="font-bold text-lg text-ellipsis">{userName}</p>
          {/* <p className="text-sm">{formattedLastTime}</p> */}
        </div>
        <div className="flex justify-between items-center flex-1 flex-nowrap">
          <p className="text-ellipsis">{lastChatText}</p>
          {chatsNotRead > 0 && (
            <p className="text-xs w-4 h-4 text-center rounded-full bg-[--tertiary-hex]">
              {chatsNotRead}
            </p>
          )}
        </div>
      </div>
      <div className="bg-[--primary-hex] opacity-70 h-0.5 chat-list-divider"></div>
    </div>
  );
};

export default ChatInfoItem;
