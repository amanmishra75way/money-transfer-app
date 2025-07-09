import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create a new transaction
export const createTransaction = createAsyncThunk("txn/createTransaction", async (transactionData, thunkAPI) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${BASE_URL}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(transactionData),
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to create transaction");

    return data.transaction;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Fetch user transactions
export const fetchUserTransactions = createAsyncThunk("txn/fetchUserTransactions", async (params = {}, thunkAPI) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const queryParams = new URLSearchParams(params).toString();

    const response = await fetch(`${BASE_URL}/api/transactions/user?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to fetch transactions");

    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Fetch all transactions (admin only)
export const fetchAllTransactions = createAsyncThunk("txn/fetchAllTransactions", async (params = {}, thunkAPI) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const queryParams = new URLSearchParams(params).toString();

    const response = await fetch(`${BASE_URL}/api/transactions/admin?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ost) throw new Error(data.message || "Failed to fetch transactions");

    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Process transaction (approve/reject - admin only)
export const processTransaction = createAsyncThunk(
  "txn/processTransaction",
  async ({ transactionId, status }, thunkAPI) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(`${BASE_URL}/api/transactions/${transactionId}/process`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Failed to process transaction");

      return data.transaction;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Get transaction by ID
export const getTransactionById = createAsyncThunk("txn/getTransactionById", async (transactionId, thunkAPI) => {
  try {
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(`${BASE_URL}/api/transactions/${transactionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || "Failed to fetch transaction");

    return data.transaction;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

const initialState = {
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  total: 0,
};

const txnSlice = createSlice({
  name: "txn",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Transactions
      .addCase(fetchUserTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Transactions (Admin)
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Process Transaction
      .addCase(processTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex((txn) => txn._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
      })
      .addCase(processTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Transaction by ID
      .addCase(getTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentTransaction, setCurrentPage } = txnSlice.actions;
export default txnSlice.reducer;
