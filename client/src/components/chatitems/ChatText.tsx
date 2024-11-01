import React from "react";
import { IMessage } from "@/definitions/interfaces";

const ChatText: React.FC<{ message: IMessage }> = ({ message }) => {
  return <div className="text-wrap">{message.content}</div>;
};

export default ChatText;
