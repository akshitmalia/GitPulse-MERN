import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios.js";

export const fetchFavourites = createAsyncThunk(
  "favourites/fetchFavourites",
  async function (_, thunkAPI) {
    try {
      const res = await axiosInstance.get("/gitpulse/favourites");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue([]);
    }
  }
);

export const addFavourite = createAsyncThunk(
  "favourites/addFavourite",
  async function (repoData, thunkAPI) {
    try {
      const res = await axiosInstance.post("/gitpulse/favourites", repoData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const removeFavourite = createAsyncThunk(
  "favourites/removeFavourite",
  async function (repoId, thunkAPI) {
    try {
      const res = await axiosInstance.delete(`/gitpulse/favourites/${repoId}`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const updateFavourite = createAsyncThunk(
  "favourites/updateFavourite",
  async function ({ repoId, description }, thunkAPI) {
    try {
      const res = await axiosInstance.put(`/gitpulse/favourites/${repoId}`, { description });
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

const favouritesSlice = createSlice({
  name: "favourites",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: function (builder) {
    builder
      .addCase(fetchFavourites.pending, function (state) {
        state.loading = true;
      })
      .addCase(fetchFavourites.fulfilled, function (state, action) {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchFavourites.rejected, function (state) {
        state.items = [];
        state.loading = false;
      })
      .addCase(addFavourite.fulfilled, function (state, action) {
        state.items = action.payload;
      })
      .addCase(removeFavourite.fulfilled, function (state, action) {
        state.items = action.payload;
      })
      .addCase(updateFavourite.fulfilled, function (state, action) {
        state.items = action.payload;
      });
  },
});

export default favouritesSlice.reducer;