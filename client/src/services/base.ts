import config from "@/config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseApiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: config.apiURL! }),
  endpoints: () => ({}),
});

export default baseApiSlice;
