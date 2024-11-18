import React from "react";
import { IMessage } from "@/definitions/interfaces";

const ChatText: React.FC<{ message: IMessage }> = ({ message }) => {
  return (
    <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
      <p className="text-sm text-wrap whitespace-normal">{message.content}</p>
    </div>
  );
};

export default ChatText;
