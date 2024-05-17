import React from "react";

const ChatText: React.FC<{ text: string }> = ({ text }) => {
  return <div className="text-wrap">{text}</div>;
};

export default ChatText;
