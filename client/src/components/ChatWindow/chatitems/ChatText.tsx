import React from "react";
import { IMessage } from "@/definitions/interfaces";

const ChatText: React.FC<{ message: IMessage }> = ({ message }) => {
  return (
    <div>
      <p className="text-sm">{message.content}</p>
    </div>
  );
};

export default ChatText;
