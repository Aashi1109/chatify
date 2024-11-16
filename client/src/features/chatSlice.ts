import { IConversation, IMessage, IUser } from "@/definitions/interfaces";
// initial state for chat slice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInteractionData {
  user: IUser | null;
  conversation: IConversation | null;
}
interface IChatSlice {
  interactionData: IInteractionData | null;
  conversations: IConversation[] | null;
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
    setConversation: (state, action: PayloadAction<IConversation[] | null>) => {
      state.conversations = action.payload;
    },
    // addInteractionMessage: (state, action: PayloadAction<IMessage>) => {
    //   state.interactionMessages?.unshift(action.payload);
    // },
    // extendInteractionMessages: (state, action: PayloadAction<IMessage[]>) => {
    //   if (action.payload.length > 0)
    //     state.interactionMessages = [
    //       ...(state.interactionMessages || []),
    //       ...action.payload,
    //     ];
    // },
    addConversation: (state, action: PayloadAction<IConversation>) => {
      state.conversations = appendData(state.conversations, action.payload);
    },

    updateConversation: (
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<IConversation>;
      }>
    ) => {
      const existingChat = state.conversations?.find(
        (con) => con._id === action.payload.id
      );

      if (existingChat) {
        for (const key in action.payload.data) {
          const updateData = action.payload.data[key as keyof IConversation];
          existingChat[key as keyof IConversation] = updateData;
        }
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
          state.conversations[i].participants as IUser[]
        )?.find((p) => p._id === action.payload.id);
        if (existingUser) {
          for (const key in action.payload.data) {
            if (key in action.payload.data) {
              existingUser[key as keyof IUser] =
                action.payload.data[key as keyof IUser];
            }
          }
        }
      }
    },
  },
});

export const {
  setConversation,
  setInteractionData,
  addConversation,
  updateConversation,
  updateConversationUser,
} = chatSlice.actions;

export default chatSlice.reducer;
