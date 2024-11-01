import { IConversationInfoItem, IUser } from "@/definitions/interfaces";
import { useAppDispatch, useAppSelector } from "@/hook";
import ChatInfoList from "./chatinfo/ChatInfoList";
import ChipItem from "./chip/ChipItem";
import ChipList from "./chip/ChipList";
import { useEffect, useState } from "react";
import { getUserConversations } from "@/actions/form";
import {
  setConversation,
  setInteractionData,
  setInteractionMessages,
} from "@/features/chatSlice";
import { showToaster } from "./toasts/Toaster";
import { EConversationTypes, EToastType } from "@/definitions/enums";
import { INBOX_CHIP_ITEMS } from "@/common/constants";

const InfoWindow = () => {
  const userChats = useAppSelector((state) => state.chat.conversations);
  const userData = useAppSelector((state) => state.auth.user);

  const dispatch = useAppDispatch();

  const [tab, setTab] = useState<(typeof INBOX_CHIP_ITEMS)[0]["id"]>(
    EConversationTypes.PRIVATE
  );

  const formattedChats = userChats?.map((ch) => {
    const { lastMessage, ...conversationWithoutLastMessage } = ch;

    const data: IConversationInfoItem = {
      conversation: conversationWithoutLastMessage,
      lastMessage: lastMessage,
    };

    const receiverData = (ch?.participants as IUser[])?.filter(
      (p) => p._id !== userData?._id
    )?.[0];

    const isUserDataPresent = Object.keys(receiverData || {}).length;

    if (isUserDataPresent) {
      data["user"] = receiverData;
    }

    return data;
  });

  useEffect(() => {
    getUserConversations({
      participants: [userData?._id || ""],
      type: tab as EConversationTypes,
      query: "&fieldsToPopulate=participants,lastMessage",
    })
      .then(({ data }) => {
        dispatch(setConversation(data));
        dispatch(setInteractionData(null));
        dispatch(setInteractionMessages([]));
      })
      .catch((err) => {
        console.error(`Error fetching user conversations`, err);
        showToaster(EToastType.Error, err?.message || "Something went wrong");
      });
  }, [dispatch, userData, tab]);

  return (
    <section className="flex gap-4 flex-col overflow-y-auto flex-1">
      <div className="flex justify-between items-center">
        <div className="flex-center gap-2">
          <p className="text-xl">Inbox</p>
          <ChipItem
            chipData={{ id: 1, text: "3 New" }}
            callback={() => {}}
            classes="rounded-lg bg-red-600 text-sm"
          />
        </div>
      </div>

      {/* Render chip list */}
      <ChipList
        chipItems={INBOX_CHIP_ITEMS}
        callback={(chipItem) => setTab(chipItem.id)}
        chipItemClasses="hover:bg-gray-400 dark:hover:bg-gray-500 rounded-md text-bold text-sm cursor-pointer text-tertiary"
        chipListClasses="p-2 bg-gray-300 rounded-lg justify-space dark:bg-gray-600"
        selectedChip={tab}
      />

      {/* Render chats info for each chat */}
      {!userChats || !userChats?.length ? (
        <div className="flex-1 flex-center">
          No {tab} yet start by creating some.
        </div>
      ) : (
        <ChatInfoList
          chatListData={formattedChats!}
          conversationType={tab as EConversationTypes}
        />
      )}
    </section>
  );
};

export default InfoWindow;
