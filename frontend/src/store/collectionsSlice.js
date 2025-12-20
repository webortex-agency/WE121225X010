import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  collections: [],
  selectedCollection: null,
  loading: false,
  filter: {
    status: 'all',
    movieId: '',
    exhibitorId: '',
    dateRange: {
      start: '',
      end: ''
    }
  }
};

const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    setCollections: (state, action) => {
      state.collections = action.payload;
    },
    addCollection: (state, action) => {
      state.collections.push({
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
    },
    updateCollection: (state, action) => {
      const index = state.collections.findIndex(collection => collection.id === action.payload.id);
      if (index !== -1) {
        state.collections[index] = { ...state.collections[index], ...action.payload };
      }
    },
    setSelectedCollection: (state, action) => {
      state.selectedCollection = action.payload;
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
  setCollections,
  addCollection,
  updateCollection,
  setSelectedCollection,
  setFilter,
  setLoading
} = collectionsSlice.actions;

// Selectors
export const selectAllCollections = (state) => state.collections.collections;
export const selectCollectionsByStatus = (state, status) => 
  state.collections.collections.filter(collection => collection.status === status);
export const selectCollectionsByExhibitor = (state, exhibitorId) => 
  state.collections.collections.filter(collection => collection.exhibitorId === exhibitorId);
export const selectCollectionsByMovie = (state, movieId) => 
  state.collections.collections.filter(collection => collection.movieId === movieId);
export const selectFilteredCollections = (state) => {
  const { collections, filter } = state.collections;
  let filtered = collections;

  // Filter by status
  if (filter.status !== 'all') {
    filtered = filtered.filter(collection => collection.status === filter.status);
  }

  // Filter by movie
  if (filter.movieId) {
    filtered = filtered.filter(collection => collection.movieId === filter.movieId);
  }

  // Filter by exhibitor
  if (filter.exhibitorId) {
    filtered = filtered.filter(collection => collection.exhibitorId === filter.exhibitorId);
  }

  // Filter by date range
  if (filter.dateRange.start && filter.dateRange.end) {
    filtered = filtered.filter(collection => {
      const collectionDate = new Date(collection.date);
      const startDate = new Date(filter.dateRange.start);
      const endDate = new Date(filter.dateRange.end);
      return collectionDate >= startDate && collectionDate <= endDate;
    });
  }

  return filtered;
};
export const selectCollectionsLoading = (state) => state.collections.loading;
export const selectSelectedCollection = (state) => state.collections.selectedCollection;
export const selectCollectionsFilter = (state) => state.collections.filter;

export default collectionsSlice.reducer;
