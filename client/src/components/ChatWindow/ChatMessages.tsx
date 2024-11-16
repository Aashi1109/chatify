import { useAppSelector } from "@/hook";
import ChatText from "./chatitems/ChatText";
import ChatItemCard from "./chatitems/ChatItemCard";
import { IMessage, IUser } from "@/definitions/interfaces";
import SystemMessage from "./SystemMessage";

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

  return Object.entries(messageGroups || {}).map(([date, _messages]) => (
    <div key={date} className="w-full flex flex-col gap-2">
      <SystemMessage message={date} />
      {_messages.map((message) => (
        <ChatItemCard
          key={message._id}
          user={typedInteractionUser}
          isCurrentUserChat={currentUser?._id === message.user}
          RenderComponent={ChatText}
          message={message}
          showBottomDate={date === "Today" || date === "Yesterday"}
        />
      ))}
    </div>
  ));
};

export default ChatMessages;
