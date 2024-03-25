import React, { ComponentType } from "react";
import CircleAvatar from "../CircleAvatar";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { formatTimeAgo } from "@/utils/timeHelper";
import { ChatDeliveryStatus } from "@/definitions/enums";
import { iconUrlFromDeliveryStatus } from "@/utils/generalHelper";
import Image from "next/image";

const ChatItemCard: React.FC<{
  RenderComponent: React.ReactNode;
  isCurrentUserChat: boolean;
  imageUrl: string;
  chatSentTime: Date;
  deliveryStatus?: ChatDeliveryStatus;
}> = ({
  RenderComponent,
  isCurrentUserChat,
  imageUrl,
  chatSentTime,
  deliveryStatus,
}) => {
  const deliveryStatusIconUrl = iconUrlFromDeliveryStatus(deliveryStatus!);
  return (
    <div
      className={twMerge(
        clsx("max-w-[65%] flex flex-col gap-2 rounded-lg items-start", {
          "ml-auto": isCurrentUserChat,
        })
      )}
    >
      <div className="flex gap-3">
        {!isCurrentUserChat && (
          <div className="flex-shrink-0">
            <CircleAvatar imageUrl={imageUrl} alt={"profile image"} size={35} />
          </div>
        )}

        <div
          className={twMerge(
            clsx("rounded-lg p-3 px-3 bg-[--primary-hex]", {
              "rounded-tr-none": isCurrentUserChat,
              "rounded-tl-none": !isCurrentUserChat,
            })
          )}
        >
          {RenderComponent}
        </div>
      </div>

      <div className="self-end flex gap-2  mr-1">
        <div className="text-gray-300 text-sm">
          {formatTimeAgo(chatSentTime)}
        </div>
        {isCurrentUserChat && deliveryStatusIconUrl && (
          <div className="flex gap-1 cursor-pointer">
            <Image
              src={deliveryStatusIconUrl}
              alt="delivery icon"
              width={16}
              height={16}
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatItemCard;
