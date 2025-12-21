import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  assignedMovies: [],
  selectedMovie: null,
  searchFilter: '',
  loading: false,
  error: null
};

const exhibitorMoviesSlice = createSlice({
  name: 'exhibitorMovies',
  initialState,
  reducers: {
    setAssignedMovies: (state, action) => {
      state.assignedMovies = action.payload;
    },

    setSelectedMovie: (state, action) => {
      state.selectedMovie = action.payload;
    },

    setSearchFilter: (state, action) => {
      state.searchFilter = action.payload;
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearSelectedMovie: (state) => {
      state.selectedMovie = null;
    }
  }
});

export const {
  setAssignedMovies,
  setSelectedMovie,
  setSearchFilter,
  setLoading,
  setError,
  clearSelectedMovie
} = exhibitorMoviesSlice.actions;

// Selectors
export const selectAssignedMovies = (state) => state.exhibitorMovies.assignedMovies;

export const selectFilteredMovies = (state) => {
  const { assignedMovies, searchFilter } = state.exhibitorMovies;
  
  if (!searchFilter) {
    return assignedMovies;
  }
  
  const searchLower = searchFilter.toLowerCase();
  return assignedMovies.filter(movie => 
    movie.title.toLowerCase().includes(searchLower) ||
    movie.genre.toLowerCase().includes(searchLower) ||
    movie.language.toLowerCase().includes(searchLower)
  );
};

export const selectSelectedMovie = (state) => state.exhibitorMovies.selectedMovie;

export const selectMovieById = (state, movieId) => 
  state.exhibitorMovies.assignedMovies.find(movie => movie.id === movieId);

export const selectSearchFilter = (state) => state.exhibitorMovies.searchFilter;

export const selectMoviesLoading = (state) => state.exhibitorMovies.loading;

export const selectMoviesError = (state) => state.exhibitorMovies.error;

export const selectActiveMoviesCount = (state) => 
  state.exhibitorMovies.assignedMovies.filter(movie => movie.status === 'active').length;

export default exhibitorMoviesSlice.reducer;
