import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import * as api from '../utils/api';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchExhibitors = createAsyncThunk('exhibitors/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await api.getExhibitors();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createExhibitorThunk = createAsyncThunk('exhibitors/create', async (data, { rejectWithValue }) => {
  try {
    return await api.createExhibitor(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateExhibitorThunk = createAsyncThunk('exhibitors/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await api.updateExhibitor(id, data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteExhibitorThunk = createAsyncThunk('exhibitors/delete', async (id, { rejectWithValue }) => {
  try {
    await api.deleteExhibitor(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  exhibitors: [],
  selectedExhibitor: null,
  loading: false,
  error: null,
  filter: {
    status: 'all',
    location: '',
    search: '',
    sort: 'recent'
  }
};

const exhibitorsSlice = createSlice({
  name: 'exhibitors',
  initialState,
  reducers: {
    setExhibitors: (state, action) => {
      state.exhibitors = action.payload;
    },
    setSelectedExhibitor: (state, action) => {
      state.selectedExhibitor = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchExhibitors
    builder
      .addCase(fetchExhibitors.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchExhibitors.fulfilled, (state, action) => {
        state.loading = false;
        state.exhibitors = Array.isArray(action.payload) ? action.payload : (action.payload.exhibitors || []);
      })
      .addCase(fetchExhibitors.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // createExhibitorThunk
    builder
      .addCase(createExhibitorThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createExhibitorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.exhibitors.push(action.payload);
      })
      .addCase(createExhibitorThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // updateExhibitorThunk
    builder
      .addCase(updateExhibitorThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateExhibitorThunk.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.exhibitors.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.exhibitors[idx] = action.payload;
      })
      .addCase(updateExhibitorThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // deleteExhibitorThunk
    builder
      .addCase(deleteExhibitorThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteExhibitorThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.exhibitors = state.exhibitors.filter(e => e._id !== action.payload);
      })
      .addCase(deleteExhibitorThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const {
  setExhibitors,
  setSelectedExhibitor,
  setFilter,
  setLoading,
  clearError
} = exhibitorsSlice.actions;

// Legacy sync aliases
export const addExhibitor = createExhibitorThunk;
export const updateExhibitor = updateExhibitorThunk;
export const deleteExhibitor = deleteExhibitorThunk;

// Selectors
export const selectAllExhibitors = (state) => state.exhibitors.exhibitors;
const _selectExhibitorsArray = (state) => state.exhibitors.exhibitors;
export const selectActiveExhibitors = createSelector(
  _selectExhibitorsArray,
  (exhibitors) => exhibitors.filter(e => e.status === 'active')
);
export const selectExhibitorById = (state, exhibitorId) =>
  state.exhibitors.exhibitors.find(e => e._id === exhibitorId || e.id === exhibitorId);
export const selectFilteredExhibitors = (state) => {
  const { exhibitors, filter } = state.exhibitors;
  let filtered = exhibitors;

  if (filter.status !== 'all') {
    filtered = filtered.filter(e => e.status === filter.status);
  }

  if (filter.location) {
    filtered = filtered.filter(e =>
      (e.theater_location || e.location || '').toLowerCase().includes(filter.location.toLowerCase())
    );
  }

  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(e =>
      (e.name || e.exhibitorName || '').toLowerCase().includes(searchLower) ||
      (e.theater_location || e.location || '').toLowerCase().includes(searchLower) ||
      (e.email || '').toLowerCase().includes(searchLower)
    );
  }

  const sorted = [...filtered];
  switch (filter.sort) {
    case 'name_asc':
      sorted.sort((a, b) => (a.name || a.exhibitorName || '').localeCompare(b.name || b.exhibitorName || ''));
      break;
    case 'name_desc':
      sorted.sort((a, b) => (b.name || b.exhibitorName || '').localeCompare(a.name || a.exhibitorName || ''));
      break;
    case 'collections_desc':
      sorted.sort((a, b) => (b.totalCollections || 0) - (a.totalCollections || 0));
      break;
    case 'recent':
    default:
      sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
  }

  return sorted;
};
export const selectExhibitorsLoading = (state) => state.exhibitors.loading;
export const selectExhibitorsError = (state) => state.exhibitors.error;
export const selectSelectedExhibitor = (state) => state.exhibitors.selectedExhibitor;
export const selectExhibitorsFilter = (state) => state.exhibitors.filter;

export default exhibitorsSlice.reducer;
