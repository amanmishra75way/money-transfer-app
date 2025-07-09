// redux/userSlice.jsx
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Async login thunk
export const login = createAsyncThunk("user/login", async (credentials, thunkAPI) => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // <- send cookies!
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");

    return data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Async logout thunk
export const logoutUser = createAsyncThunk("user/logout", async (_, thunkAPI) => {
  try {
    await fetch(`${BASE_URL}/api/user/logout`, {
      method: "POST",
      credentials: "include",
    });
    return true;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchCurrentUser = createAsyncThunk("user/fetchCurrentUser", async (_, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/api/user/me`, {
      method: "GET",
      credentials: "include",
    });

    if (res.status === 401) {
      // Try to refresh token
      const refreshRes = await fetch(`${BASE_URL}/api/user/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        throw new Error("Session expired");
      }

      // Retry original request
      const retryRes = await fetch(`${BASE_URL}/api/user/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await retryRes.json();
      if (!retryRes.ok) throw new Error(data.message || "Session expired");
      return data.user;
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Session expired");
    return data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    error: null,
    users: [], // optional: filled from somewhere else
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.currentUser = null;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.error = null;
      })

      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.currentUser = null;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
