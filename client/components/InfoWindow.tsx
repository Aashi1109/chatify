"use client";

import ChipItem from "./ChipItem";
import Button from "./Button";
import ChipList from "./ChipList";
import { chatInfoList, inboxChipItems } from "@/config";
import ChatInfoList from "./chatinfo/ChatInfoList";

const InfoWindow = () => {
  return (
    <section className="section-bg col-span-3 py-6 flex gap-4 flex-col overflow-y-auto">
      <div className="flex justify-between items-center px-6">
        <div className="flex-center gap-2">
          <p className="text-white text-xl">Inbox</p>
          <ChipItem
            chipData={{ id: 1, text: "3 New" }}
            callback={() => {}}
            classes="rounded-lg bg-[--danger-hex] text-sm"
          />
        </div>
        <Button
          iconUrl="/assets/menu.png"
          iconSize={20}
          classes="p-2"
          // text="New chat"
          callback={() => {}}
        />
      </div>

      {/* Render chip list */}
      <div className="px-6">
        <ChipList
          chipItems={inboxChipItems}
          callback={() => {}}
          chipItemClasses="hover:bg-gray-600 rounded-md text-bold text-sm cursor-pointer text-tertiary"
          chipListClasses="p-2 bg-gray-700 rounded-lg justify-between"
        />
      </div>

      {/* Render chats info for each chat */}
      <ChatInfoList chatListData={chatInfoList} />
    </section>
  );
};

export default InfoWindow;
