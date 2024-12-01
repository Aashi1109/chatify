import { IConversationInfoItem, IUser } from "@/definitions/interfaces";
import { useAppDispatch, useAppSelector } from "@/hook";
import ChatInfoList from "./chatinfo/ChatInfoList";
import ChipItem from "../chip/ChipItem";
import ChipList from "../chip/ChipList";
import { useEffect, useState } from "react";
import { getUserConversations } from "@/actions/form";
import { setConversation, setInteractionData } from "@/features/chatSlice";
import { showToaster } from "../toasts/Toaster";
import { EConversationTypes, EToastType } from "@/definitions/enums";
import { INBOX_CHIP_ITEMS } from "@/common/constants";
import SpinningLoader from "../ui/SpinningLoader";

const InfoWindow = () => {
  const userChats = useAppSelector((state) => state.chat.conversations);
  const currentUser = useAppSelector((state) => state.auth.user);

  const [isLoading, setIsLoading] = useState(false);
  const [allChats, setAllChats] = useState<IConversationInfoItem[]>([]);

  const dispatch = useAppDispatch();

  const [tab, setTab] = useState<(typeof INBOX_CHIP_ITEMS)[0]["id"]>("all");

  // Filter chats based on selected tab
  const filteredChats = userChats?.filter((chat) => {
    if (tab === "all") return true;
    return chat.conversation.type === tab;
  });

  useEffect(() => {
    if (allChats?.length) {
      dispatch(
        setConversation(
          allChats.map((ch: any) => {
            const { lastRead, lastMessage, ...rest } = ch;
            const data = {
              conversation: rest,
              lastRead,
              lastMessage,
              isTyping: false,
              chatsNotRead: 0,
              displayInfo: undefined,
              isGroupConversation: ch.type === EConversationTypes.GROUP,
            };

            data.displayInfo = !data.isGroupConversation
              ? ch.participants.filter(
                  (p: IUser) => p._id !== currentUser?._id
                )[0]
              : {
                  name: ch?.name,
                  profileImage: ch?.profileImage,
                  description: ch?.description,
                };

            return data;
          })
        )
      );
      dispatch(
        setInteractionData({
          conversationData: null,
          closeChatWindow: true,
        })
      );
      return;
    }
    setIsLoading(true);
    getUserConversations({
      participants: [currentUser?._id || ""],
      type: tab === "all" ? undefined : (tab as EConversationTypes),
      query:
        "&fieldsToPopulate=participants,lastMessage&limit=50&sortBy=updatedAt&sortOrder=desc",
    })
      .then(({ data }) => {
        setAllChats(data);
      })
      .catch((err) => {
        console.error(`Error fetching user conversations`, err);
        showToaster(EToastType.Error, err?.message || "Something went wrong");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dispatch, tab, allChats]);

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
        chipItemClasses="hover:bg-gray-400 dark:hover:bg-gray-500 rounded-full px-4 text-xs cursor-pointer"
        chipListClasses="gap-2 justify-start"
        selectedChip={tab}
      />

      {isLoading ? (
        <SpinningLoader size={20} />
      ) : (
        <>
          {/* Render chats info for each chat */}
          {!userChats || !userChats?.length ? (
            <div className="flex-1 flex-center">
              No {tab} yet start by creating some.
            </div>
          ) : (
            <ChatInfoList chatListData={filteredChats!} />
          )}
        </>
      )}
    </section>
  );
};

export default InfoWindow;
