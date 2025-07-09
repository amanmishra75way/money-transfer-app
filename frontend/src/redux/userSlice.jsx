import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login = createAsyncThunk("user/login", async (credentials, thunkAPI) => {
  try {
    const response = await fetch(`${BASE_URL}/api/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Login failed");

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    return data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const logoutUser = createAsyncThunk("user/logout", async (_, thunkAPI) => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      await fetch(`${BASE_URL}/api/user/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });
    }

    return true;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const fetchCurrentUser = createAsyncThunk("user/fetchCurrentUser", async (_, thunkAPI) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new Error("No access token found");
    }

    const res = await fetch(`${BASE_URL}/api/user/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: "include",
    });

    if (res.status === 401) {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const refreshRes = await fetch(`${BASE_URL}/api/user/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        credentials: "include",
      });

      if (!refreshRes.ok) {
        throw new Error("Session expired");
      }

      const refreshData = await refreshRes.json();
      localStorage.setItem("accessToken", refreshData.accessToken);

      // Retry original request with new token
      const retryRes = await fetch(`${BASE_URL}/api/user/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${refreshData.accessToken}`,
        },
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

const initialState = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
  error: null,
  isLoadingAuth: false,
  users: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.error = null;
        state.isLoadingAuth = false;
        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.currentUser = null;
        state.error = action.payload;
        state.isLoadingAuth = false;
      })
      .addCase(login.pending, (state) => {
        state.isLoadingAuth = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.error = null;
        state.isLoadingAuth = false;
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload;
        state.isLoadingAuth = false;
        // Clear localStorage even on logout failure
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoadingAuth = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isLoadingAuth = false;
        state.error = null;

        localStorage.setItem("user", JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.currentUser = null;
        state.error = action.payload;
        state.isLoadingAuth = false;

        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
