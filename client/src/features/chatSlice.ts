import { IChat, IGroups, IMessage, IUser } from "@/definitions/interfaces";
// initial state for chat slice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInteractionData {
  user: IUser | null;
  conversation: IGroups | IChat | null;
}
interface IChatSlice {
  interactionData: IInteractionData | null;
  interactionMessages: IMessage[] | null;
  conversation: IChat[] | null;
  groups: IGroups[] | null;
}

const chatInitialState: IChatSlice = {
  interactionData: null,
  interactionMessages: null,
  conversation: null,
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
    setConversation: (state, action: PayloadAction<IChat[] | null>) => {
      state.conversation = action.payload;
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
    addConversation: (state, action: PayloadAction<IChat>) => {
      state.conversation = appendData(state.conversation, action.payload);
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
  setConversation,
  setGroups,
  setInteractionData,
  setInteractionMessages,
  addConversation,
  addInteractionMessage,
  addGroup,
} = chatSlice.actions;

export default chatSlice.reducer;
