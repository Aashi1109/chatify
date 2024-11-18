import { useAppSelector } from "@/hook";
import {ChatText,SystemMessage} from "./components";
import ChatItemCard from "./chatitems/ChatItemCard";
import { IMessage, IUser } from "@/definitions/interfaces";

const ChatMessages = ({ messages }: { messages: IMessage[] }) => {
  const { interactionData } = useAppSelector((state) => state.chat);

  const typedInteractionUser = interactionData?.user as IUser;
  const currentUser = useAppSelector((state) => state.auth.user);

  const getDateDifference = (date: Date) => {
    const currentDate = new Date();

    const dayDifference = currentDate.getDate() - date.getDate();

    if (dayDifference === 0) {
      return "Today";
    } else if (dayDifference === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const messageGroups = messages?.reduce(
    (groups: { [key: string]: any[] }, message) => {
      const parsedDate = new Date(message.sentAt);

      const groupName = getDateDifference(parsedDate);

      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].unshift(message);
      return groups;
    },
    {}
  );

  return Object.entries(messageGroups || {}).map(([key, _messages]) => (
    <div key={key} className="w-full flex flex-col gap-2">
      <SystemMessage message={key} />
      {_messages.map((message) => (
        <ChatItemCard
          key={message._id}
          user={typedInteractionUser}
          isCurrentUserChat={currentUser?._id === message.user}
          RenderComponent={ChatText}
          message={message}
          showBottomDate={key === "Today" || key === "Yesterday"}
        />
      ))}
    </div>
  ));
};

export default ChatMessages;
