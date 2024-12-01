import { IConversationInfoItem } from "@/definitions/interfaces";
import { setInteractionData } from "@/features/chatSlice";
import { useAppDispatch } from "@/hook";
import React from "react";
import CircleAvatar from "../../CircleAvatar";
import { cn } from "@/lib/utils";
import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import MessageDeliveryIconFromStatus from "../../ChatWindow/components/MessageDeliveryIconFromStatus";

const ChatInfoItem: React.FC<{
  chatData: IConversationInfoItem;
  classes?: string;
}> = ({ chatData, classes }) => {
  const {
    conversation,
    displayInfo,
    isTyping,
    chatsNotRead,
    lastMessage,
    lastRead,
    isGroupConversation,
  } = chatData;

  const dispatcher = useAppDispatch();

  const handleChatInfoItemClick = () => {
    dispatcher(
      setInteractionData({
        conversationData: { user: displayInfo || null, conversation },
        closeChatWindow: false,
      })
    );
  };

  const isLastMessageFromCurrentUser = lastMessage?.user === displayInfo?._id;

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
          imageUrl={displayInfo?.profileImage?.url || ""}
          fallback={displayInfo?.name?.slice(0, 1)?.toUpperCase() || ""}
        />

        {!isGroupConversation && (
          <div
            className={cn(
              "h-3 w-3 rounded-full bg-green-600 absolute top-0 right-0",
              { "bg-red-600": !displayInfo?.isActive }
            )}
          />
        )}
      </div>

      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-center flex-1 flex-nowrap">
          <p className="font-medium text-md text-ellipsis">
            {displayInfo?.name}
          </p>
        </div>
        {lastMessage?._id && (
          <div className="flex justify-between items-center flex-1 flex-nowrap">
            <div className="grid grid-cols-[1fr_auto] w-full gap-2 items-center">
              <div className="overflow-hidden">
                {isTyping ? (
                  <p className="text-xs italic text-green-600">typing...</p>
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
              <div className="flex-center gap-2">
                {!!chatsNotRead && (
                  <p className="w-5 h-5 text-center flex-center rounded-full bg-green-500 text-xs">
                    {chatsNotRead}
                  </p>
                )}
                {lastMessage?.sentAt && (
                  <p className="text-xs whitespace-nowrap">
                    {formatTimeAgo(new Date(lastMessage.sentAt))}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInfoItem;
