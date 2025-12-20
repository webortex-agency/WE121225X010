import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: '/',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userInfo?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery(
      {
        url: '/api/auth/refresh',
        method: 'POST',
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Store the new token
      api.dispatch(setCredentials(refreshResult.data));
      // Retry the original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Movie', 'Exhibitor', 'User', 'Collection', 'Assignment'],
  endpoints: (builder) => ({
    // Movies
    getMovies: builder.query({
      query: () => '/api/movies',
      providesTags: ['Movie'],
    }),
    getMovieById: builder.query({
      query: (id) => `/api/movies/${id}`,
      providesTags: ['Movie'],
    }),
    createMovie: builder.mutation({
      query: (data) => ({
        url: '/api/movies',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Movie'],
    }),
    updateMovie: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/movies/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Movie'],
    }),
    deleteMovie: builder.mutation({
      query: (id) => ({
        url: `/api/movies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Movie'],
    }),
    // Exhibitors
    getExhibitors: builder.query({
      query: () => '/api/exhibitors',
      providesTags: ['Exhibitor'],
    }),
    createExhibitor: builder.mutation({
      query: (data) => ({
        url: '/api/exhibitors',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Exhibitor'],
    }),
    updateExhibitor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/exhibitors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Exhibitor'],
    }),
    deleteExhibitor: builder.mutation({
      query: (id) => ({
        url: `/api/exhibitors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Exhibitor'],
    }),
    // Assignments
    createAssignments: builder.mutation({
      query: (data) => ({
        url: '/api/assignments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assignment'],
    }),
    getAssignmentsByMovie: builder.query({
      query: (movie_id) => `/api/assignments/${movie_id}`,
      providesTags: ['Assignment'],
    }),
  }),
});

// Export hooks
export const {
  useGetMoviesQuery,
  useGetMovieByIdQuery,
  useCreateMovieMutation,
  useUpdateMovieMutation,
  useDeleteMovieMutation,
  useGetExhibitorsQuery,
  useCreateExhibitorMutation,
  useUpdateExhibitorMutation,
  useDeleteExhibitorMutation,
  useCreateAssignmentsMutation,
  useGetAssignmentsByMovieQuery,
} = apiSlice;
