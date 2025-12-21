import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  submissions: [],
  selectedSubmission: null,
  filter: {
    status: 'all', // all, pending, approved, rejected
    dateRange: {
      startDate: null,
      endDate: null
    },
    movie: 'all'
  },
  loading: false,
  error: null
};

const exhibitorCollectionsSlice = createSlice({
  name: 'exhibitorCollections',
  initialState,
  reducers: {
    addSubmission: (state, action) => {
      const submission = {
        ...action.payload,
        id: `submission_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      };
      state.submissions.unshift(submission); // Add to beginning of array
    },

    updateSubmission: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.submissions.findIndex(sub => sub.id === id);
      if (index !== -1) {
        state.submissions[index] = {
          ...state.submissions[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
    },

    setSubmissions: (state, action) => {
      state.submissions = action.payload;
    },

    setSelectedSubmission: (state, action) => {
      state.selectedSubmission = action.payload;
    },

    setFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload };
    },

    bulkSubmit: (state, action) => {
      const { showsData } = action.payload;
      
      showsData.forEach(showData => {
        const submission = {
          id: `submission_${Date.now()}_${Math.random()}`,
          movieId: showData.movieId,
          movieTitle: showData.movieTitle,
          showDate: showData.date,
          showNumber: showData.showNumber,
          showTime: showData.showTime,
          totalSeats: showData.totalSeats,
          occupiedSeats: showData.occupiedSeats,
          ticketPrice: showData.ticketPrice,
          grossCollection: showData.grossCollection,
          acCharge: showData.acCharge,
          netCollection: showData.netCollection,
          notes: showData.notes || '',
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };
        state.submissions.unshift(submission);
      });
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearSelectedSubmission: (state) => {
      state.selectedSubmission = null;
    }
  }
});

export const {
  addSubmission,
  updateSubmission,
  setSubmissions,
  setSelectedSubmission,
  setFilter,
  bulkSubmit,
  setLoading,
  setError,
  clearSelectedSubmission
} = exhibitorCollectionsSlice.actions;

// Selectors
export const selectAllSubmissions = (state) => state.exhibitorCollections.submissions;

export const selectFilteredSubmissions = (state) => {
  const { submissions, filter } = state.exhibitorCollections;
  let filtered = submissions;

  // Filter by status
  if (filter.status !== 'all') {
    filtered = filtered.filter(sub => sub.status === filter.status);
  }

  // Filter by date range
  if (filter.dateRange.startDate && filter.dateRange.endDate) {
    const startDate = new Date(filter.dateRange.startDate);
    const endDate = new Date(filter.dateRange.endDate);
    filtered = filtered.filter(sub => {
      const subDate = new Date(sub.showDate);
      return subDate >= startDate && subDate <= endDate;
    });
  }

  // Filter by movie
  if (filter.movie !== 'all') {
    filtered = filtered.filter(sub => sub.movieId === filter.movie);
  }

  return filtered;
};

export const selectSubmissionById = (state, submissionId) =>
  state.exhibitorCollections.submissions.find(sub => sub.id === submissionId);

export const selectSelectedSubmission = (state) => 
  state.exhibitorCollections.selectedSubmission;

export const selectSubmissionsFilter = (state) => 
  state.exhibitorCollections.filter;

export const selectCollectionsLoading = (state) => 
  state.exhibitorCollections.loading;

export const selectCollectionsError = (state) => 
  state.exhibitorCollections.error;

export const selectPendingSubmissions = (state) =>
  state.exhibitorCollections.submissions.filter(sub => sub.status === 'pending');

export const selectApprovedSubmissions = (state) =>
  state.exhibitorCollections.submissions.filter(sub => sub.status === 'approved');

export const selectRejectedSubmissions = (state) =>
  state.exhibitorCollections.submissions.filter(sub => sub.status === 'rejected');

export const selectTotalCollectionsThisMonth = (state) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  return state.exhibitorCollections.submissions
    .filter(sub => {
      const subDate = new Date(sub.submittedAt);
      return subDate.getMonth() === currentMonth && 
             subDate.getFullYear() === currentYear &&
             sub.status === 'approved';
    })
    .reduce((total, sub) => total + (sub.netCollection || 0), 0);
};

export const selectSubmissionsByDateRange = (state, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return state.exhibitorCollections.submissions.filter(sub => {
    const subDate = new Date(sub.showDate);
    return subDate >= start && subDate <= end;
  });
};

export default exhibitorCollectionsSlice.reducer;
