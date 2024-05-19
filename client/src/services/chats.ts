import baseApiSlice from "./base";

const chatsApiSlice = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query({ query: () => "chats" }),
  }),
});

export default chatsApiSlice;
