import { ChatInfoItemI } from "@/definitions/interfaces";
import clsx from "clsx";
import React from "react";
import ChatInfoItem from "./ChatInfoItem";
import { twMerge } from "tailwind-merge";

const ChatInfoList: React.FC<{
  classes?: string;
  chatListData: ChatInfoItemI[];
}> = ({ chatListData, classes }) => {
  return (
    <div
      className={twMerge(
        clsx("flex flex-col h-full overflow-y-auto overflow-x-clip", classes)
      )}
    >
      {chatListData.map((chatData, index) => (
        <ChatInfoItem key={index} chatData={chatData} />
      ))}
    </div>
  );
};

export default ChatInfoList;
