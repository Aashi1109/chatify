import { useAppSelector } from "@/hook";
import { ChatText, SystemMessage } from "./components";
import ChatItemCard from "./chatitems/ChatItemCard";
import type { IMessage, IUser } from "@/definitions/interfaces";
import { EMessageCategory } from "@/definitions/enums";
import { useEffect } from "react";

interface IProps {
  messages: IMessage[];
  onUnreadMessagesFound?: (unreadIds: string[]) => void;
}

const ChatMessages: React.FC<IProps> = ({
  messages,
  onUnreadMessagesFound,
}) => {
  const { interactionData } = useAppSelector((state) => state.chat);
  const currentUser = useAppSelector((state) => state.auth.user);
  const typedInteractionUser = interactionData?.user as IUser;

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

  // Combine message grouping and unread detection in a single pass
  const { messageGroups, unreadIds } = messages.reduce(
    (acc, message) => {
      // Check for unread messages during the same loop
      if (
        message.category !== EMessageCategory.System &&
        !message.stats?.[currentUser?._id || ""]?.readAt &&
        message._id
      ) {
        acc.unreadIds.push(message._id);
      }

      // Group messages logic
      const isSystemMessage = message.category === EMessageCategory.System;
      let groupName = "";

      if (isSystemMessage) {
        groupName = message.content;
        acc.messageGroups[groupName] = [];
      } else {
        const parsedDate = message.sentAt
          ? new Date(message.sentAt)
          : new Date();

        groupName = getDateDifference(parsedDate);

        if (!(groupName in acc.messageGroups)) {
          acc.messageGroups[groupName] = [];
        }

        acc.messageGroups[groupName].unshift(message);
      }

      return acc;
    },
    {
      messageGroups: {} as Record<string, IMessage[]>,
      unreadIds: [] as string[],
    }
  );

  // Notify about unread messages when they change
  useEffect(() => {
    if (unreadIds.length > 0 && onUnreadMessagesFound) {
      onUnreadMessagesFound(unreadIds);
    }
  }, [unreadIds]);

  return Object.entries(messageGroups).map(([key, _messages]) => {
    let previousMessageUserId: string | null = null;
    return (
      <div key={key} className="w-full flex flex-col gap-2">
        <SystemMessage message={key} />
        {_messages.map((message) => {
          const isPreviousMessageFromCurrentUser =
            message.user === previousMessageUserId;
          previousMessageUserId = message.user;
          return (
            <ChatItemCard
              key={message._id}
              user={typedInteractionUser}
              isCurrentUserChat={currentUser?._id === message.user}
              RenderComponent={ChatText}
              message={message}
              showUserInfo={!isPreviousMessageFromCurrentUser}
            />
          );
        })}
      </div>
    );
  });
};

export default ChatMessages;
