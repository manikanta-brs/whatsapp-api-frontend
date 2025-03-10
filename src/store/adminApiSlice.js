import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

const ADMIN_ENDPOINT = "/api/admin";

const baseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:3000",
  prepareHeaders: (headers, { getState }) => {
    try {
      const state = getState();
      const token = state.auth?.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
    } catch (error) {
      console.error("Error in prepareHeaders:", error);
    }
    return headers;
  },
});

export const adminApiSlice = createApi({
  reducerPath: "whatsappapi",
  baseQuery,
  tagTypes: ["Admin", "Templates"],
  endpoints: (builder) => ({
    getUserData: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),
    getTemplates: builder.query({
      query: (category) => {
        let url = `${ADMIN_ENDPOINT}/templates`;
        if (category && category !== "all") {
          url += `?category=${category}`;
        }
        return {
          url,
          method: "GET",
        };
      },
      providesTags: ["Templates"],
    }),
    getAccountDetails: builder.query({
      query: () => ({
        url: `${ADMIN_ENDPOINT}/account`,
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),
    getPhoneNumbers: builder.query({
      query: () => ({
        url: `${ADMIN_ENDPOINT}/phonenumbers`,
        method: "GET",
      }),
      providesTags: ["Admin"],
    }),
    sendMessage: builder.mutation({
      query: (message) => ({
        url: `${ADMIN_ENDPOINT}/sendmessage`,
        method: "POST",
        body: message,
      }),
      invalidatesTags: ["Templates"],
    }),

    // ADDED: createTemplate mutation
    createTemplate: builder.mutation({
      query: (templateData) => ({
        url: `${ADMIN_ENDPOINT}/templates`, // Or whatever your create endpoint is
        method: "POST",
        body: templateData,
      }),
      invalidatesTags: ["Templates"], // Invalidate Templates after creating
    }),
  }),
});

export const {
  useGetUserDataQuery,
  useGetTemplatesQuery,
  useGetAccountDetailsQuery,
  useGetPhoneNumbersQuery,
  useSendMessageMutation,
  useCreateTemplateMutation, // ADDED: Export the hook
} = adminApiSlice;

export default adminApiSlice;
