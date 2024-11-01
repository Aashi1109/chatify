import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import React from "react";
import CircleAvatar from "../CircleAvatar";
import MessageDeliveryIconFromStatus from "../MessageDeliveryIconFromStatus";
import { cn } from "@/lib/utils";
import { IMessage, IUser } from "@/definitions/interfaces";

const ChatItemCard: React.FC<{
  RenderComponent: React.ComponentType<{ message: IMessage }>;
  isCurrentUserChat: boolean;
  user: IUser;
  message: IMessage;
}> = ({ RenderComponent, isCurrentUserChat, user, message }) => {
  return (
    <div
      className={cn("max-w-[65%] flex rounded-lg items-start", {
        "ml-auto": isCurrentUserChat,
      })}
    >
      <div className="flex gap-3">
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

        <div className="flex flex-col gap-2">
          <div
            className={cn("rounded-lg p-1 px-3 bg-gray-300 dark:bg-gray-500", {
              "rounded-tr-none": isCurrentUserChat,
              "rounded-tl-none": !isCurrentUserChat,
            })}
          >
            <RenderComponent message={message} />
          </div>

          <div
            className={cn("self-end flex-center gap-2 mr-1", {
              "self-start": !isCurrentUserChat,
            })}
          >
            <div className="text-gray-500 dark:text-gray-300 text-xs">
              {formatTimeAgo(new Date(message.sentAt))}
            </div>
            {isCurrentUserChat && (
              <div className="flex cursor-pointer">
                <MessageDeliveryIconFromStatus message={message} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItemCard;
