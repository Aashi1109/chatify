import { IChat, IGroups, IMessage, IUser } from "@/definitions/interfaces";
// initial state for chat slice

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IChatSlice {
  userData: IUser | null;
  interactionData: IUser | IGroups | IChat | null;
  interactionMessages: IMessage[] | null;
  chats: IChat[] | null;
  groups: IGroups | null;
}

const chatInitialState: IChatSlice = {
  userData: null,
  interactionData: null,
  interactionMessages: null,
  chats: null,
  groups: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState: chatInitialState,
  reducers: {
    setUserData: (state, action: PayloadAction<IUser | null>) => {
      state.userData = action.payload;
    },
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
    setGroups: (state, action: PayloadAction<IGroups | null>) => {
      state.groups = action.payload;
    },
  },
});

export const {
  setChats,
  setGroups,
  setInteractionData,
  setInteractionMessages,
  setUserData,
} = chatSlice.actions;

export default chatSlice.reducer;
