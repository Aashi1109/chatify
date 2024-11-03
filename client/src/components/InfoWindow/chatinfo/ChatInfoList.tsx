import { IConversationInfoItem } from "@/definitions/interfaces";
import React from "react";
import ChatInfoItem from "./ChatInfoItem";
import { cn } from "@/lib/utils";

const ChatInfoList: React.FC<{
  classes?: string;
  chatListData: IConversationInfoItem[];
}> = ({ chatListData, classes }) => {
  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-y-auto overflow-x-clip gap-2",
        classes
      )}
    >
      {chatListData.map((chatData, index) => (
        <ChatInfoItem key={index} chatData={chatData} />
      ))}
    </div>
  );
};

export default ChatInfoList;
