import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../utils/api';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMovies = createAsyncThunk('movies/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await api.getMovies();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const createMovieThunk = createAsyncThunk('movies/create', async (data, { rejectWithValue }) => {
  try {
    return await api.createMovie(data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateMovieThunk = createAsyncThunk('movies/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await api.updateMovie(id, data);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteMovieThunk = createAsyncThunk('movies/delete', async (id, { rejectWithValue }) => {
  try {
    await api.deleteMovie(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  movies: [],
  selectedMovie: null,
  loading: false,
  error: null,
  filter: {
    status: 'all',
    genre: [],
    search: ''
  }
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setMovies: (state, action) => {
      state.movies = action.payload;
    },
    setSelectedMovie: (state, action) => {
      state.selectedMovie = action.payload;
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
    // fetchMovies
    builder
      .addCase(fetchMovies.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMovies.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns array or { movies: [] }
        state.movies = Array.isArray(action.payload) ? action.payload : (action.payload.movies || []);
      })
      .addCase(fetchMovies.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // createMovieThunk
    builder
      .addCase(createMovieThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createMovieThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.movies.push(action.payload);
      })
      .addCase(createMovieThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // updateMovieThunk
    builder
      .addCase(updateMovieThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateMovieThunk.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.movies.findIndex(m => m._id === action.payload._id);
        if (idx !== -1) state.movies[idx] = action.payload;
      })
      .addCase(updateMovieThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });

    // deleteMovieThunk
    builder
      .addCase(deleteMovieThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteMovieThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = state.movies.filter(m => m._id !== action.payload);
      })
      .addCase(deleteMovieThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const {
  setMovies,
  setSelectedMovie,
  setFilter,
  setLoading,
  clearError
} = moviesSlice.actions;

// Keep legacy sync actions as aliases so existing callers don't break
export const addMovie = createMovieThunk;
export const updateMovie = updateMovieThunk;
export const deleteMovie = deleteMovieThunk;

// Selectors
export const selectAllMovies = (state) => state.movies.movies;
export const selectActiveMovies = (state) =>
  state.movies.movies.filter(movie => movie.status === 'active');
export const selectMovieById = (state, movieId) =>
  state.movies.movies.find(movie => movie._id === movieId || movie.id === movieId);
export const selectFilteredMovies = (state) => {
  const { movies, filter } = state.movies;
  let filtered = movies;

  if (filter.status !== 'all') {
    filtered = filtered.filter(movie => movie.status === filter.status);
  }

  if (filter.genre && filter.genre.length > 0) {
    filtered = filtered.filter(movie =>
      (movie.genres || [movie.genre]).some(g => filter.genre.includes(g))
    );
  }

  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(movie =>
      (movie.title || '').toLowerCase().includes(searchLower) ||
      (movie.genres || [movie.genre]).some(g => (g || '').toLowerCase().includes(searchLower))
    );
  }

  return filtered;
};
export const selectMoviesLoading = (state) => state.movies.loading;
export const selectMoviesError = (state) => state.movies.error;
export const selectSelectedMovie = (state) => state.movies.selectedMovie;
export const selectMoviesFilter = (state) => state.movies.filter;

export default moviesSlice.reducer;
