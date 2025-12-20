import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  movies: [],
  selectedMovie: null,
  loading: false,
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
    addMovie: (state, action) => {
      state.movies.push({
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
    },
    updateMovie: (state, action) => {
      const index = state.movies.findIndex(movie => movie.id === action.payload.id);
      if (index !== -1) {
        state.movies[index] = { ...state.movies[index], ...action.payload };
      }
    },
    deleteMovie: (state, action) => {
      state.movies = state.movies.filter(movie => movie.id !== action.payload);
    },
    setSelectedMovie: (state, action) => {
      state.selectedMovie = action.payload;
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
  setMovies,
  addMovie,
  updateMovie,
  deleteMovie,
  setSelectedMovie,
  setFilter,
  setLoading
} = moviesSlice.actions;

// Selectors
export const selectAllMovies = (state) => state.movies.movies;
export const selectActiveMovies = (state) => 
  state.movies.movies.filter(movie => movie.status === 'active');
export const selectMovieById = (state, movieId) => 
  state.movies.movies.find(movie => movie.id === movieId);
export const selectFilteredMovies = (state) => {
  const { movies, filter } = state.movies;
  let filtered = movies;

  // Filter by status
  if (filter.status !== 'all') {
    filtered = filtered.filter(movie => movie.status === filter.status);
  }

  // Filter by genre
  if (filter.genre.length > 0) {
    filtered = filtered.filter(movie => 
      movie.genres.some(genre => filter.genre.includes(genre))
    );
  }

  // Filter by search
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    filtered = filtered.filter(movie => 
      movie.title.toLowerCase().includes(searchLower) ||
      movie.genres.some(genre => genre.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
};
export const selectMoviesLoading = (state) => state.movies.loading;
export const selectSelectedMovie = (state) => state.movies.selectedMovie;
export const selectMoviesFilter = (state) => state.movies.filter;

export default moviesSlice.reducer;
