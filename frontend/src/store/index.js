import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import authReducer from './authSlice';
import moviesReducer from './moviesSlice';
import exhibitorsReducer from './exhibitorsSlice';
import collectionsReducer from './collectionsSlice';
import analyticsReducer from './analyticsSlice';
import exhibitorScheduleReducer from './exhibitorScheduleSlice';
import exhibitorMoviesReducer from './exhibitorMoviesSlice';
import exhibitorCollectionsReducer from './exhibitorCollectionsSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    movies: moviesReducer,
    exhibitors: exhibitorsReducer,
    collections: collectionsReducer,
    analytics: analyticsReducer,
    exhibitorSchedule: exhibitorScheduleReducer,
    exhibitorMovies: exhibitorMoviesReducer,
    exhibitorCollections: exhibitorCollectionsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});
