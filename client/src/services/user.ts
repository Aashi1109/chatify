import { IUser } from "@/definitions/interfaces";
import baseApiSlice from "./base";

const userApi = baseApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserById: builder.query<IUser, null>({ query: (id) => `user/${id}` }),
  }),
  overrideExisting: true,
});

export const { useGetUserByIdQuery } = userApi;

export default userApi;
