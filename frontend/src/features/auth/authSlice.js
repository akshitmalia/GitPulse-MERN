import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios.js";

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async function (_, thunkAPI) {
    try {
      const res = await axiosInstance.get("/gitpulse/auth/me");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(null);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async function (_, thunkAPI) {
    try {
      await axiosInstance.post("/gitpulse/auth/logout");
      return null;
    } catch (err) {
      return thunkAPI.rejectWithValue(null);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: true,
  },
  reducers: {},
  extraReducers: function (builder) {
    builder
      .addCase(restoreSession.pending, function (state) {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, function (state, action) {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(restoreSession.rejected, function (state) {
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutUser.fulfilled, function (state) {
        state.user = null;
      });
  },
});

export default authSlice.reducer;