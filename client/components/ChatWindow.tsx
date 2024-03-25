"use client";

import { twMerge } from "tailwind-merge";
import CircleAvatar from "./CircleAvatar";
import { formatTimeAgo } from "@/utils/timeHelper";
import Button from "./Button";
import ChatItemCard from "./chatitems/ChatItemCard";
import { ChatDeliveryStatus } from "@/definitions/enums";
import ChatText from "./chatitems/ChatText";

const ChatWindow = () => {
  const isActive = true;
  const lastSeenTime = new Date("2020-12-20T12:30:00Z");
  return (
    <section className="section-bg col-span-7 p-6 flex flex-col flex-1 gap-4">
      {/* chat head */}
      <div className={twMerge("flex items-center justify-between")}>
        <div className="flex gap-6">
          <CircleAvatar
            size={50}
            alt={"user image"}
            imageUrl={"/assets/user.png"}
          />

          <div className="flex flex-col text-white justify-center items-start flex-1 flex-nowrap">
            <p className="font-bold text-lg text-ellipsis">{"Park Dae suk"}</p>
            <p className="text-sm text-gray-500">
              {isActive
                ? "Active"
                : `Last seen on ${formatTimeAgo(lastSeenTime)}`}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            classes="bg-gray-700 p-2"
            iconSize={20}
            callback={() => {}}
            iconUrl="/assets/voice-call.png"
          />
          <Button
            classes="bg-gray-700 p-2"
            iconSize={20}
            callback={() => {}}
            iconUrl="/assets/cancel.png"
          />
        </div>
      </div>

      {/* chat window */}
      <div className="flex flex-col flex-1 bg-gray-500 rounded-xl p-4">
        {/* message send section */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden gap-4">
          <ChatItemCard
            imageUrl="/assets/user.png"
            isCurrentUserChat={false}
            RenderComponent={
              <ChatText text="How u doing mam looks like u forget about me" />
            }
            chatSentTime={new Date("2020-12-20T12:30:00Z")}
          />
          <ChatItemCard
            imageUrl="/assets/user.png"
            isCurrentUserChat={true}
            RenderComponent={<ChatText text="What's up bro" />}
            chatSentTime={new Date("2020-12-20T12:30:00Z")}
            deliveryStatus={ChatDeliveryStatus.DeliveredRead}
          />
          <ChatItemCard
            imageUrl="/assets/user.png"
            isCurrentUserChat={false}
            RenderComponent={
              <ChatText
                text="Lorem ipsum dolor sit, amet consectetur adipisicing elit. Beatae
            accusantium illum dolor similique. Culpa, quam facilis placeat iste nisi
            fuga laudantium dolor non perferendis expedita aperiam sunt amet
            consequatur! Voluptate."
              />
            }
            chatSentTime={new Date("2020-12-20T12:30:00Z")}
          />
        </div>

        {/* chat send buttons */}
        <div className="flex gap-4 items-start mt-4">
          <textarea
            className="h-full rounded-lg bg-[--primary-hex] placeholder:text-gray-500 flex-1 py-2 px-6 outline-gray-500"
            placeholder="Write message"
            // rows={1}
            // minLength={23}
          />
          <Button
            classes="bg-[--primary-hex] p-2"
            iconSize={25}
            callback={() => {}}
            iconUrl="/assets/gallery.png"
            applyInvertFilter={false}
          />
          <Button
            classes="bg-[--primary-hex] p-2"
            iconSize={25}
            callback={() => {}}
            iconUrl="/assets/mic.png"
            applyInvertFilter={false}
          />
          <Button
            classes="p-2"
            iconSize={25}
            callback={() => {}}
            iconUrl="/assets/send.png"
            applyInvertFilter={false}
          />
        </div>
      </div>
    </section>
  );
};

export default ChatWindow;
