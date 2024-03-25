"use client";

import Image from "next/image";
import CircleAvatar from "./CircleAvatar";
import Button from "./Button";

const TopBar = () => {
  return (
    <section className="section-bg flex justify-between items-center col-span-10 p-6">
      <p className="text-white text-3xl font-normal">Chats</p>
      <div className="flex gap-6">
        <Button
          iconUrl="/assets/plus.png"
          iconSize={16}
          text="New chat"
          callback={() => {}}
          classes="py-1 px-3"
        />
        <div className="flex justify-center items-center relative">
          <Image
            src={"/assets/notification.png"}
            alt="notification"
            width={24}
            height={24}
            objectFit="cover"
          />
          <div className="h-2 w-2 rounded-full bg-[--danger-hex] absolute top-1 right-0"></div>
        </div>
        <div className="flex gap-4 items-center text-lg">
          <CircleAvatar
            size={40}
            imageUrl="/assets/user.png"
            alt={"User Icon"}
          />
          <div>
            Hii, <strong>Jane Doe</strong>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopBar;
