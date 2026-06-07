import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import favouritesReducer from "../features/favourites/favouritesSlice.js";

const store = configureStore({
  reducer: {
    auth: authReducer,
    favourites: favouritesReducer,
  },
});

export default store;