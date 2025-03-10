import { configureStore } from "@reduxjs/toolkit";
import { adminApiSlice } from "./adminApiSlice";

export const store = configureStore({
  reducer: {
    [adminApiSlice.reducerPath]: adminApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApiSlice.middleware),
});
