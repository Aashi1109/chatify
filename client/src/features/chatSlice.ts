import { IConversation, IMessage, IUser } from "@/definitions/interfaces";
// initial state for chat slice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInteractionData {
  user: IUser | null;
  conversation: IConversation | null;
}
interface IChatSlice {
  interactionData: IInteractionData | null;
  interactionMessages: IMessage[] | null;
  conversations: IConversation[] | null;
}

const chatInitialState: IChatSlice = {
  interactionData: null,
  interactionMessages: null,
  conversations: null,
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
      action: PayloadAction<IInteractionData | null>
    ) => {
      state.interactionData = action.payload;
    },
    setInteractionMessages: (
      state,
      action: PayloadAction<IMessage[] | null>
    ) => {
      state.interactionMessages = action.payload;
    },
    setConversation: (state, action: PayloadAction<IConversation[] | null>) => {
      state.conversations = action.payload;
    },
    addInteractionMessage: (state, action: PayloadAction<IMessage>) => {
      state.interactionMessages?.unshift(action.payload);
    },
    extendInteractionMessages: (state, action: PayloadAction<IMessage[]>) => {
      if (action.payload.length > 0)
        state.interactionMessages = [
          ...(state.interactionMessages || []),
          ...action.payload,
        ];
    },
    addConversation: (state, action: PayloadAction<IConversation>) => {
      state.conversations = appendData(state.conversations, action.payload);
    },

    updateMessage: (
      state,
      action: PayloadAction<{ id: string; data: Partial<IMessage> }>
    ) => {
      const existingMessage = state.interactionMessages?.find(
        (message) => message._id === action.payload.id
      );

      if (existingMessage) {
        for (const key in action.payload.data) {
          if (key in action.payload.data) {
            const updateData = action.payload.data[key as keyof IMessage];
            existingMessage[key as keyof IMessage] = updateData;
          }
        }
      }
    },
    updateConversation: (
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<IConversation & { isTyping: boolean }>;
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
  },
});

export const {
  setConversation,
  setInteractionData,
  setInteractionMessages,
  extendInteractionMessages,
  addConversation,
  updateConversation,
  addInteractionMessage,
} = chatSlice.actions;

export default chatSlice.reducer;
