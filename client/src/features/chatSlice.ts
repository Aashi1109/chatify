import {
  IConversation,
  IConversationInfoItem,
  IMessage,
  IUser,
} from "@/definitions/interfaces";
// initial state for chat slice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInteractionData {
  user: IUser | null;
  conversation: IConversation | null;
}
interface IChatSlice {
  interactionData: IInteractionData | null;
  conversations: IConversationInfoItem[] | null;
  isChatWindowOpen: boolean;
}

const chatInitialState: IChatSlice = {
  interactionData: null,
  conversations: null,
  isChatWindowOpen: false,
};

const appendData = <T>(prevData: T[] | null, newData: T): T[] => {
  return prevData ? [...prevData, newData] : [newData];
};

const chatSlice = createSlice({
  name: "chat",
  initialState: chatInitialState,
  reducers: {
    setInteractionData: (
      state,
      action: PayloadAction<{
        conversationData: IInteractionData | null;
        closeChatWindow: boolean;
      }>
    ) => {
      state.interactionData = action.payload.conversationData;
      state.isChatWindowOpen = !action.payload.closeChatWindow;
    },
    //
    setConversation: (
      state,
      action: PayloadAction<IConversationInfoItem[] | null>
    ) => {
      state.conversations = action.payload;
    },

    addConversation: (state, action: PayloadAction<IConversationInfoItem>) => {
      state.conversations = appendData(state.conversations, action.payload);
    },

    updateConversation: (
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<IConversationInfoItem>;
      }>
    ) => {
      const existingChat = state.conversations?.find(
        (con) => con.conversation?._id === action.payload.id
      );

      if (existingChat) {
        Object.keys(action.payload.data).forEach((key) => {
          const isKeyFromConversation = key in existingChat.conversation;
          if (isKeyFromConversation) {
            (existingChat.conversation as any)[key] =
              action.payload.data[key as keyof IConversationInfoItem];
          } else {
            if (key in existingChat) {
              (existingChat as any)[key] =
                action.payload.data[key as keyof IConversationInfoItem];
            }
          }
        });
      }
    },

    updateConversationUser: (
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<IUser>;
      }>
    ) => {
      if (!state.conversations || !Object.keys(action.payload.data).length)
        return;
      // Update user in all conversations using regular for loop
      for (let i = 0; i < state.conversations.length; i++) {
        const existingUser = (
          state.conversations[i].conversation?.participants as IUser[]
        )?.find((p) => p._id === action.payload.id);
        if (existingUser) {
          Object.keys(action.payload.data).forEach((key) => {
            if (key in existingUser) {
              (existingUser as any)[key] =
                action.payload.data[key as keyof IUser];
            }
          });
        }
      }
    },

    updateMessagesAcrossConversations: (
      state,
      action: PayloadAction<{
        data: Record<string, Record<string, Partial<IMessage>>>;
      }>
    ) => {
      if (!state.conversations?.length) return;

      state.conversations.forEach((conversation) => {
        const conversationId = conversation.conversation?._id?.toString();
        if (!conversationId) return;
        const conversationUpdates = action.payload.data[conversationId];
        const lastMessage = conversation.conversation.lastMessage;

        if (
          conversationUpdates &&
          lastMessage &&
          (lastMessage?._id || "") in conversationUpdates
        ) {
          conversation.conversation.lastMessage = {
            ...lastMessage,
            stats: {
              ...(lastMessage.stats || {}),
              ...(conversationUpdates[lastMessage._id || ""]?.stats || {}),
            },
          };
        }
      });
    },
  },
});

export const {
  setConversation,
  setInteractionData,
  addConversation,
  updateConversation,
  updateConversationUser,
  updateMessagesAcrossConversations,
} = chatSlice.actions;

export default chatSlice.reducer;
