import { ChatDeliveryStatus } from "@/definitions/enums";
import { formatTimeAgo } from "@/lib/helpers/timeHelper";
import React from "react";
import CircleAvatar from "../CircleAvatar";
import MessageDeliveryIconFromStatus from "../MessageDeliveryIconFromStatus";
import { cn } from "@/lib/utils";

const ChatItemCard: React.FC<{
  RenderComponent: React.ReactNode;
  isCurrentUserChat: boolean;
  imageUrl: string;
  chatSentTime: string;
  deliveryStatus?: ChatDeliveryStatus;
  name: string;
}> = ({
  RenderComponent,
  isCurrentUserChat,
  imageUrl,
  chatSentTime,
  deliveryStatus,
  name,
}) => {
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
              imageUrl={imageUrl}
              alt={"profile image"}
              classes="w-9 h-9"
              fallback={name?.slice(0, 1)?.toUpperCase()}
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
            {RenderComponent}
          </div>

          <div className="self-end flex-center gap-2 mr-1">
            <div className="text-gray-500 dark:text-gray-300 text-xs">
              {formatTimeAgo(new Date(chatSentTime))}
            </div>
            {isCurrentUserChat && deliveryStatus && (
              <div className="flex cursor-pointer">
                <MessageDeliveryIconFromStatus
                  deliveryStatus={deliveryStatus}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItemCard;
