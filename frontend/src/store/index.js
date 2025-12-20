import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import authReducer from './authSlice';
import moviesReducer from './moviesSlice';
import exhibitorsReducer from './exhibitorsSlice';
import collectionsReducer from './collectionsSlice';
import analyticsReducer from './analyticsSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    movies: moviesReducer,
    exhibitors: exhibitorsReducer,
    collections: collectionsReducer,
    analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});
