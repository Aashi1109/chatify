import { IChat, IGroups, IMessage, IUser } from "@/definitions/interfaces";
// initial state for chat slice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IChatSlice {
  interactionData: IUser | IGroups | IChat | null;
  interactionMessages: IMessage[] | null;
  chats: IChat[] | null;
  groups: IGroups[] | null;
}

const chatInitialState: IChatSlice = {
  interactionData: null,
  interactionMessages: null,
  chats: null,
  groups: null,
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
      action: PayloadAction<IUser | IGroups | IChat | null>
    ) => {
      state.interactionData = action.payload;
    },
    setInteractionMessages: (
      state,
      action: PayloadAction<IMessage[] | null>
    ) => {
      state.interactionMessages = action.payload;
    },
    setChats: (state, action: PayloadAction<IChat[] | null>) => {
      state.chats = action.payload;
    },
    setGroups: (state, action: PayloadAction<IGroups[] | null>) => {
      state.groups = action.payload;
    },
    addInteractionMessage: (state, action: PayloadAction<IMessage>) => {
      state.interactionMessages = appendData(
        state.interactionMessages,
        action.payload
      );
    },
    addChat: (state, action: PayloadAction<IChat>) => {
      state.chats = appendData(state.chats, action.payload);
    },
    addGroup: (state, action: PayloadAction<IGroups>) => {
      state.groups = appendData(state.groups, action.payload);
    },
    updateMessage: (
      state,
      action: PayloadAction<{ id: string; data: Partial<IMessage> }>
    ) => {
      const existingMessage = state.interactionMessages?.find(
        (message) => message.id === action.payload.id
      );

      if (existingMessage) {
        for (const key in action.payload.data) {
          if (Object.prototype.hasOwnProperty.call(action.payload.data, key)) {
            const updateData = action.payload.data[key];
            if (updateData) {
              existingMessage[key] = updateData;
            }
          }
        }
      }
    },
    updateChat: (
      state,
      action: PayloadAction<{ id: string; data: Partial<IChat> }>
    ) => {
      const existingChat = state.interactionMessages?.find(
        (message) => message.id === action.payload.id
      );

      if (existingChat) {
        for (const key in action.payload.data) {
          if (Object.prototype.hasOwnProperty.call(action.payload.data, key)) {
            const updateData = action.payload.data[key];
            if (updateData) {
              existingChat[key] = updateData;
            }
          }
        }
      }
    },
  },
});

export const {
  setChats,
  setGroups,
  setInteractionData,
  setInteractionMessages,
  addChat,
  addInteractionMessage,
  addGroup,
} = chatSlice.actions;

export default chatSlice.reducer;
