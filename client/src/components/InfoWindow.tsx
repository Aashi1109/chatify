import { inboxChipItems } from "@/config";
import {
  ChatInfoItemI,
  IChat,
  IUser,
  IUserChat,
} from "@/definitions/interfaces";
import Button from "./Button";
import ChatInfoList from "./chatinfo/ChatInfoList";
import ChipItem from "./chip/ChipItem";
import ChipList from "./chip/ChipList";

const InfoWindow = ({ userChats }: { userChats: IUserChat[] | null }) => {
  const formattedChats = userChats?.map((ch) => {
    const data: ChatInfoItemI = {
      imageUrl: "",
      userName: "",
      lastChatTime: undefined,
      lastChatText: "",
      isUserActive: false,
      chatsNotRead: 0,
    };

    // if user data is there then extract variables from it
    const isUserDataPresent = typeof ch?.receiverId === "object";
    const isChatDataPresent = typeof ch?.chatId === "object";

    if (isUserDataPresent) {
      const userData = ch?.receiverId;
      data["imageUrl"] = (userData as IUser).profileImage.url;
      data["userName"] = (userData as IUser).name as string;
      data["isUserActive"] = (userData as IUser)?.isActive ?? false;
    }
    if (isChatDataPresent) {
      const chatData = ch?.chatId;
      data["lastChatTime"] = (chatData as IChat)?.messageId?.slice(
        -1
      )?.[0]?.sentAt;
      data["chatsNotRead"] = (chatData as IChat)?.messageId?.filter(
        (message: any) => message?.seenAt && message?.seenAt > Date.now()
      )?.length;
      data["lastChatText"] = (chatData as IChat)?.messageId?.[0]
        ?.content as string;
      data["id"] = (chatData as IChat)._id;
    }

    return data;
  });

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
      {!userChats || !userChats?.length ? (
        <div className="flex-1 flex-center">
          No chats yet start by creating some.
        </div>
      ) : (
        <ChatInfoList chatListData={formattedChats!} />
      )}
    </section>
  );
};

export default InfoWindow;
