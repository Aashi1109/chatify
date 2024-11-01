import { IConversationInfoItem } from "@/definitions/interfaces";
import { setInteractionData } from "@/features/chatSlice";
import { useAppDispatch } from "@/hook";
import React from "react";
import CircleAvatar from "../CircleAvatar";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import MessageDeliveryIconFromStatus from "../MessageDeliveryIconFromStatus";
import { EConversationTypes } from "@/definitions/enums";

const ChatInfoItem: React.FC<{
  chatData: IConversationInfoItem;
  classes?: string;
  conversationType: EConversationTypes;
}> = ({ chatData, classes, conversationType }) => {
  const { conversation, user, lastMessage } = chatData;

  const dispatcher = useAppDispatch();

  const isGroupConversation = conversationType === EConversationTypes.GROUP;

  const handleChatInfoItemClick = () => {
    dispatcher(setInteractionData({ user: user || null, conversation }));
  };

  const isLastMessageFromCurrentUser = lastMessage?.user === user?._id;
  const isTyping = conversation.isTyping;

  return (
    <div
      className={cn(
        "flex-center w-full py-4 px-2 cursor-pointer rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 hover:scale-[1.01] chat-list-item",
        classes
      )}
      onClick={handleChatInfoItemClick}
    >
      <div className="relative mr-4">
        <CircleAvatar
          alt={"user image"}
          imageUrl={
            (isGroupConversation ? conversation.image : user?.profileImage)
              ?.url || ""
          }
          fallback={
            (isGroupConversation ? conversation.name : user?.name)
              ?.slice(0, 1)
              ?.toUpperCase() || ""
          }
        />

        {!isGroupConversation && (
          <div
            className={cn(
              "h-3 w-3 rounded-full bg-green-600 absolute top-0 right-0",
              { "bg-red-600": !user?.isActive }
            )}
          />
        )}
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center flex-1 flex-nowrap">
          <p className="font-medium text-md text-ellipsis">
            {isGroupConversation ? conversation.name : user?.name}
          </p>
        </div>
        {lastMessage?._id && (
          <div className="flex justify-between items-center flex-1 flex-nowrap">
            <div className="grid grid-cols-[1fr_auto] w-full gap-2 items-center">
              <div className="overflow-hidden">
                {isTyping ? (
                  <p className="text-xs italic text-green-600">Typing...</p>
                ) : (
                  <div className="flex-start gap-1">
                    {!isLastMessageFromCurrentUser && (
                      <MessageDeliveryIconFromStatus
                        message={lastMessage}
                        iconSize="w-3 h-3"
                      />
                    )}
                    <p className="truncate text-sm">{lastMessage.content}</p>
                  </div>
                )}
              </div>
              {lastMessage?.sentAt && (
                <p className="text-xs whitespace-nowrap">
                  {formatTimeAgo(new Date(lastMessage.sentAt))}
                </p>
              )}
            </div>
            {/* {unreadCount > 0 && (
              <p className="text-xs w-4 h-4 text-center rounded-full bg-[--tertiary-hex]">
                {unreadCount}
              </p>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInfoItem;
