import { ChatInfoItemI } from "@/definitions/interfaces";
import clsx from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";
import CircleAvatar from "../CircleAvatar";
import { formatTimeAgo } from "@/utils/timeHelper";

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
    userName,
  } = chatData;

  const formattedLastTime = formatTimeAgo(lastChatTime);
  return (
    <div
      className={twMerge(
        clsx(
          "flex-center py-4 px-6 cursor-pointer hover:bg-gray-600 hover:scale-[1.01] chat-list-item",
          classes
        )
      )}
    >
      <div className="relative mr-4">
        <CircleAvatar size={50} alt={"user image"} imageUrl={imageUrl} />
        {isUserActive && (
          <div className="h-3 w-3 rounded-full border-2 bg-green-600 absolute top-0 right-0"></div>
        )}
      </div>

      <div className="flex flex-col flex-1">
        <div className="text-white flex justify-between items-center flex-1 flex-nowrap">
          <p className="font-bold text-lg text-ellipsis">{userName}</p>
          <p className="text-sm">{formattedLastTime}</p>
        </div>
        <div className="text-white flex justify-between items-center flex-1 flex-nowrap">
          <p className="text-ellipsis text-gray-500">{lastChatText}</p>
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
