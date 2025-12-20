import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  exhibitors: [],
  selectedExhibitor: null,
  loading: false,
  filter: {
    status: 'all',
    location: '',
    search: ''
  }
};

const exhibitorsSlice = createSlice({
  name: 'exhibitors',
  initialState,
  reducers: {
    setExhibitors: (state, action) => {
      state.exhibitors = action.payload;
    },
    addExhibitor: (state, action) => {
      state.exhibitors.push({
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
    },
    updateExhibitor: (state, action) => {
      const index = state.exhibitors.findIndex(exhibitor => exhibitor.id === action.payload.id);
      if (index !== -1) {
        state.exhibitors[index] = { ...state.exhibitors[index], ...action.payload };
      }
    },
    deleteExhibitor: (state, action) => {
      state.exhibitors = state.exhibitors.filter(exhibitor => exhibitor.id !== action.payload);
    },
    setSelectedExhibitor: (state, action) => {
      state.selectedExhibitor = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  setExhibitors,
  addExhibitor,
  updateExhibitor,
  deleteExhibitor,
  setSelectedExhibitor,
  setFilter,
  setLoading
} = exhibitorsSlice.actions;

// Selectors
export const selectAllExhibitors = (state) => state.exhibitors.exhibitors;
export const selectActiveExhibitors = (state) => 
  state.exhibitors.exhibitors.filter(exhibitor => exhibitor.status === 'active');
export const selectExhibitorById = (state, exhibitorId) => 
  state.exhibitors.exhibitors.find(exhibitor => exhibitor.id === exhibitorId);
export const selectFilteredExhibitors = (state) => {
  const { exhibitors, filter } = state.exhibitors;
  let filtered = exhibitors;

  // Filter by status
  if (filter.status !== 'all') {
    filtered = filtered.filter(exhibitor => exhibitor.status === filter.status);
  }

  // Filter by location
  if (filter.location) {
    filtered = filtered.filter(exhibitor => 
      exhibitor.location.toLowerCase().includes(filter.location.toLowerCase())
    );
  }

  // Filter by search
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(exhibitor => 
      exhibitor.exhibitorName.toLowerCase().includes(searchLower) ||
      exhibitor.cinemaName.toLowerCase().includes(searchLower) ||
      exhibitor.email.toLowerCase().includes(searchLower) ||
      exhibitor.location.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};
export const selectExhibitorsLoading = (state) => state.exhibitors.loading;
export const selectSelectedExhibitor = (state) => state.exhibitors.selectedExhibitor;
export const selectExhibitorsFilter = (state) => state.exhibitors.filter;

export default exhibitorsSlice.reducer;
