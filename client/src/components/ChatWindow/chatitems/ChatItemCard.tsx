import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import React from "react";
import CircleAvatar from "../../CircleAvatar";
import MessageDeliveryIconFromStatus from "../../MessageDeliveryIconFromStatus";
import { cn } from "@/lib/utils";
import { IMessage, IUser } from "@/definitions/interfaces";
import { EMessageCategory } from "@/definitions/enums";

const ChatItemCard: React.FC<{
  RenderComponent: React.ComponentType<{ message: IMessage }>;
  isCurrentUserChat: boolean;
  user: IUser;
  message: IMessage;
  showBottomDate?: boolean;
}> = ({
  RenderComponent,
  isCurrentUserChat,
  user,
  message,
  showBottomDate,
}) => {
  const isSystemMessage = message.category === EMessageCategory.System;

  return (
    <div
      className={cn("w-full flex rounded-lg justify-start gap-2", {
        "justify-end": isCurrentUserChat,
      })}
    >
      {!isCurrentUserChat && (
        <div className="flex-shrink-0 hidden md:flex">
          <CircleAvatar
            imageUrl={user.profileImage.url}
            alt={"profile image"}
            classes="w-9 h-9"
            fallback={user.name?.slice(0, 1)?.toUpperCase()}
          />
        </div>
      )}

      <div className={cn("max-w-[70%] flex flex-col gap-1")}>
        <div
          className={cn(
            "rounded-lg p-1 bg-gray-300 px-2 dark:bg-gray-500 flex items-end gap-2",
            {
              "rounded-tr-none pr-1": isCurrentUserChat,
              "rounded-tl-none": !isCurrentUserChat,
            }
          )}
        >
          <RenderComponent message={message} />
          {!isSystemMessage && isCurrentUserChat && (
            <div className="flex cursor-pointer pb-1">
              <MessageDeliveryIconFromStatus
                message={message}
                iconSize="w-3 h-3"
              />
            </div>
          )}
        </div>

        {!isSystemMessage && showBottomDate && (
          <div
            className={cn("self-end flex-center gap-2 mr-1", {
              "self-start": !isCurrentUserChat,
            })}
          >
            <div className="text-gray-500 dark:text-gray-300 text-2xs">
              {formatTimeAgo(new Date(message.sentAt))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatItemCard;
