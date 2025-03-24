// import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

// const ADMIN_ENDPOINT = "/api/admin"; // Base admin endpoint

// const baseQuery = fetchBaseQuery({
//   baseUrl: "http://localhost:4000",
//   // baseUrl: "https://whatsapp-api-backend-8vyg.onrender.com",
//   prepareHeaders: (headers, { getState }) => {
//     // IMPORTANT: REMOVE the try...catch block for debugging
//     const state = getState();
//     // console.log("Redux state.auth:", state.auth); // Inspect the auth state
//     const token = state.auth?.token;
//     // console.log("Token:", token); // Inspect the token
//     if (token) {
//       headers.set("authorization", `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

// export const adminApiSlice = createApi({
//   reducerPath: "whatsappapi",
//   baseQuery,
//   tagTypes: ["Admin", "Templates", "Messages", "App"],
//   endpoints: (builder) => ({
//     getUserData: builder.query({
//       query: () => ({ url: "/", method: "GET" }),
//       providesTags: ["Admin"],
//     }),

//     getAppDetails: builder.query({
//       query: () => ({
//         url: `${ADMIN_ENDPOINT}/app`,
//         method: "GET",
//       }),
//       providesTags: ["App"],
//     }),

//     getTemplates: builder.query({
//       query: (category) => {
//         let url = `${ADMIN_ENDPOINT}/templates`;
//         if (category && category !== "all") {
//           url += `?category=${category}`;
//         }
//         return { url, method: "GET" };
//       },
//       providesTags: ["Templates"],
//     }),

//     getAccountDetails: builder.query({
//       query: () => ({ url: `${ADMIN_ENDPOINT}/account`, method: "GET" }),
//       providesTags: ["Admin"],
//     }),

//     getPhoneNumbers: builder.query({
//       query: () => ({ url: `${ADMIN_ENDPOINT}/phonenumbers`, method: "GET" }),
//       providesTags: ["Admin"],
//     }),

//     sendMessage: builder.mutation({
//       query: (message) => ({
//         url: `${ADMIN_ENDPOINT}/sendmessage`,
//         method: "POST",
//         body: message,
//       }),
//       invalidatesTags: ["Templates", "Messages"],
//     }),

//     createTemplate: builder.mutation({
//       query: (templateData) => ({
//         // Removed appId and accessToken
//         url: `${ADMIN_ENDPOINT}/templates`,
//         method: "POST",
//         body: templateData, // Just send templateData
//       }),
//       invalidatesTags: ["Templates"],
//     }),

//     getMessages: builder.query({
//       query: ({ receiver, sender }) => ({
//         url: `${ADMIN_ENDPOINT}/messages`,
//         method: "POST",
//         body: { receiver, sender },
//       }),
//       providesTags: ["Messages"],
//     }),

//     uploadFile: builder.mutation({
//       query: (formData) => {
//         // We're now receiving the FormData directly, not wrapped in an object
//         return {
//           url: `${ADMIN_ENDPOINT}/upload`,
//           method: "POST",
//           // Don't wrap formData in another object
//           body: formData,
//           // Disable automatic content-type setting for FormData
//           formData: true,
//         };
//       },
//     }),
//   }),
// });

// export const {
//   useGetUserDataQuery,
//   useGetTemplatesQuery,
//   useGetAccountDetailsQuery,
//   useGetPhoneNumbersQuery,
//   useSendMessageMutation,
//   useCreateTemplateMutation,
//   useGetMessagesQuery,
//   useUploadFileMutation,
//   useGetAppDetailsQuery,
// } = adminApiSlice;

// export default adminApiSlice;

import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";

const ADMIN_ENDPOINT = "/api/admin"; // Base admin endpoint

const baseQuery = fetchBaseQuery({
  // baseUrl: "http://localhost:4000",
  baseUrl: "https://whatsapp-api-backend-8vyg.onrender.com",
  prepareHeaders: (headers, { getState }) => {
    // IMPORTANT: REMOVE the try...catch block for debugging
    const state = getState();
    // console.log("Redux state.auth:", state.auth); // Inspect the auth state
    const token = state.auth?.token;
    // console.log("Token:", token); // Inspect the token
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const adminApiSlice = createApi({
  reducerPath: "whatsappapi",
  baseQuery,
  tagTypes: ["Admin", "Templates", "Messages", "App", "Session"],
  endpoints: (builder) => ({
    getUserData: builder.query({
      query: () => ({ url: "/", method: "GET" }),
      providesTags: ["Admin"],
    }),

    getAppDetails: builder.query({
      query: () => ({
        url: `${ADMIN_ENDPOINT}/app`,
        method: "GET",
      }),
      providesTags: ["App"],
    }),

    getTemplates: builder.query({
      query: (category) => {
        let url = `${ADMIN_ENDPOINT}/templates`;
        if (category && category !== "all") {
          url += `?category=${category}`;
        }
        return { url, method: "GET" };
      },
      providesTags: ["Templates"],
    }),

    getAccountDetails: builder.query({
      query: () => ({ url: `${ADMIN_ENDPOINT}/account`, method: "GET" }),
      providesTags: ["Admin"],
    }),

    getPhoneNumbers: builder.query({
      query: () => ({ url: `${ADMIN_ENDPOINT}/phonenumbers`, method: "GET" }),
      providesTags: ["Admin"],
    }),

    sendMessage: builder.mutation({
      query: (message) => ({
        url: `${ADMIN_ENDPOINT}/sendmessage`,
        method: "POST",
        body: message,
      }),
      invalidatesTags: ["Templates", "Messages", "Session"],
    }),

    createTemplate: builder.mutation({
      query: (templateData) => ({
        // Removed appId and accessToken
        url: `${ADMIN_ENDPOINT}/templates`,
        method: "POST",
        body: templateData, // Just send templateData
      }),
      invalidatesTags: ["Templates"],
    }),

    getMessages: builder.query({
      query: ({ receiver, sender }) => ({
        url: `${ADMIN_ENDPOINT}/messages`,
        method: "POST",
        body: { receiver, sender },
      }),
      providesTags: ["Messages"],
    }),

    uploadFile: builder.mutation({
      query: (formData) => {
        // We're now receiving the FormData directly, not wrapped in an object
        return {
          url: `${ADMIN_ENDPOINT}/upload`,
          method: "POST",
          // Don't wrap formData in another object
          body: formData,
          // Disable automatic content-type setting for FormData
          formData: true,
        };
      },
    }),

    // New endpoint to check user's 24-hour session status
    getSessionStatus: builder.query({
      query: (phoneNumber) => ({
        url: `${ADMIN_ENDPOINT}/session/${phoneNumber}`,
        method: "GET",
      }),
      providesTags: ["Session"],
    }),
    // Upload media file mutation
    uploadMedia: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("media", file);

        return {
          url: `${ADMIN_ENDPOINT}/uploadfile`,
          method: "POST",
          body: formData,
          formData: true, // Ensures correct handling of FormData
        };
      },
      invalidatesTags: ["Messages"], // Invalidate messages cache after upload
    }),
  }),
});

export const {
  useGetUserDataQuery,
  useGetTemplatesQuery,
  useGetAccountDetailsQuery,
  useGetPhoneNumbersQuery,
  useSendMessageMutation,
  useCreateTemplateMutation,
  useGetMessagesQuery,
  useUploadFileMutation,
  useGetAppDetailsQuery,
  useGetSessionStatusQuery, // Export the new hook
} = adminApiSlice;

export default adminApiSlice;
