import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  schedule: {}, // Date as key (YYYY-MM-DD), shows as nested object
  selectedWeek: {
    startDate: null, // Monday
    endDate: null,   // Sunday
    year: new Date().getFullYear(),
    weekNumber: 1
  },
  showsPerDay: 4, // Default 4 shows active, can extend to 6
  extraShowsByDate: {}, // Per-day override: { 'YYYY-MM-DD': number }
  termsAndConditionsAccepted: false,
  tourCompleted: false,
  loading: false,
  error: null
};

const exhibitorScheduleSlice = createSlice({
  name: 'exhibitorSchedule',
  initialState,
  reducers: {
    addMovieToShow: (state, action) => {
      const { date, showNumber, movieData } = action.payload;
      if (!state.schedule[date]) {
        state.schedule[date] = {};
      }
      
      const showId = `show_${showNumber}`;
      state.schedule[date][showId] = {
        id: `${date}_${showId}_${Date.now()}`,
        movieId: movieData.id,
        movieTitle: movieData.title,
        movieGenre: movieData.genre,
        movieLanguage: movieData.language,
        movieDuration: movieData.duration,
        posterUrl: movieData.posterUrl,
        showNumber: showNumber,
        showTime: getShowTime(showNumber),
        totalSeats: null,
        occupiedSeats: null,
        ticketPrice: null,
        grossCollection: 0,
        acCharge: 0,
        netCollection: 0,
        notes: '',
        status: 'draft', // draft, submitted, approved, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },

    removeMovieFromShow: (state, action) => {
      const { date, showNumber } = action.payload;
      const showId = `show_${showNumber}`;
      if (state.schedule[date] && state.schedule[date][showId]) {
        delete state.schedule[date][showId];
        
        // Clean up empty date entries
        if (Object.keys(state.schedule[date]).length === 0) {
          delete state.schedule[date];
        }
      }
    },

    updateShowDetails: (state, action) => {
      const { date, showNumber, showDetails } = action.payload;
      const showId = `show_${showNumber}`;
      
      if (state.schedule[date] && state.schedule[date][showId]) {
        const show = state.schedule[date][showId];
        
        // Update basic details
        Object.assign(show, showDetails);
        
        // Auto-calculate collections if seats and price are provided
        if (show.totalSeats && show.occupiedSeats && show.ticketPrice) {
          show.grossCollection = show.occupiedSeats * show.ticketPrice;
          show.acCharge = show.occupiedSeats * 5; // Fixed ₹5 AC charge per person
          show.netCollection = show.grossCollection - show.acCharge;
        }
        
        show.updatedAt = new Date().toISOString();
      }
    },

    setSelectedWeek: (state, action) => {
      state.selectedWeek = action.payload;
    },

    setShowsPerDay: (state, action) => {
      const count = action.payload;
      if (count >= 4 && count <= 6) { // Allow 4-6 shows per day
        state.showsPerDay = count;
      }
    },

    addExtraShow: (state, action) => {
      const { date } = action.payload;
      const current = state.extraShowsByDate[date] ?? state.showsPerDay;
      if (current < 6) {
        state.extraShowsByDate[date] = current + 1;
      }
    },

    saveSchedule: (state) => {
      // Save to localStorage
      try {
        localStorage.setItem('exhibitorSchedule', JSON.stringify(state.schedule));
        localStorage.setItem('exhibitorWeek', JSON.stringify(state.selectedWeek));
        localStorage.setItem('exhibitorShowsPerDay', state.showsPerDay.toString());
        localStorage.setItem('exhibitorExtraShowsByDate', JSON.stringify(state.extraShowsByDate));
      } catch (error) {
        console.error('Failed to save schedule to localStorage:', error);
      }
    },

    loadSchedule: (state) => {
      // Load from localStorage
      try {
        const savedSchedule = localStorage.getItem('exhibitorSchedule');
        const savedWeek = localStorage.getItem('exhibitorWeek');
        const savedShowsPerDay = localStorage.getItem('exhibitorShowsPerDay');
        const savedExtraShowsByDate = localStorage.getItem('exhibitorExtraShowsByDate');

        if (savedSchedule) {
          state.schedule = JSON.parse(savedSchedule);
        }
        if (savedWeek) {
          state.selectedWeek = JSON.parse(savedWeek);
        }
        if (savedShowsPerDay) {
          state.showsPerDay = parseInt(savedShowsPerDay, 10);
        }
        if (savedExtraShowsByDate) {
          state.extraShowsByDate = JSON.parse(savedExtraShowsByDate);
        }
      } catch (error) {
        console.error('Failed to load schedule from localStorage:', error);
      }
    },

    clearWeekSchedule: (state, action) => {
      const { startDate, endDate } = action.payload;
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Clear all dates in the week range
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (state.schedule[dateKey]) {
          delete state.schedule[dateKey];
        }
      }
    },

    copyFromPreviousWeek: (state, action) => {
      const { currentWeek, previousWeek } = action.payload;
      
      // Get previous week dates
      const prevStart = new Date(previousWeek.startDate);
      const currStart = new Date(currentWeek.startDate);
      
      // Copy each day from previous week to current week
      for (let i = 0; i < 7; i++) {
        const prevDate = new Date(prevStart);
        prevDate.setDate(prevDate.getDate() + i);
        const prevDateKey = prevDate.toISOString().split('T')[0];
        
        const currDate = new Date(currStart);
        currDate.setDate(currDate.getDate() + i);
        const currDateKey = currDate.toISOString().split('T')[0];
        
        if (state.schedule[prevDateKey]) {
          state.schedule[currDateKey] = {};
          
          // Copy each show from previous week
          Object.keys(state.schedule[prevDateKey]).forEach(showId => {
            const prevShow = state.schedule[prevDateKey][showId];
            state.schedule[currDateKey][showId] = {
              ...prevShow,
              id: `${currDateKey}_${showId}_${Date.now()}`,
              status: 'draft', // Reset status for new week
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          });
        }
      }
    },

    setTermsAndConditionsAccepted: (state, action) => {
      state.termsAndConditionsAccepted = action.payload;
      // Save to localStorage
      localStorage.setItem('exhibitorTCAccepted', action.payload.toString());
    },

    setTourCompleted: (state, action) => {
      state.tourCompleted = action.payload;
      // Save to localStorage
      localStorage.setItem('exhibitorTourCompleted', action.payload.toString());
    },

    loadUserPreferences: (state) => {
      // Load user preferences from localStorage
      try {
        const tcAccepted = localStorage.getItem('exhibitorTCAccepted');
        const tourCompleted = localStorage.getItem('exhibitorTourCompleted');
        
        if (tcAccepted) {
          state.termsAndConditionsAccepted = tcAccepted === 'true';
        }
        if (tourCompleted) {
          state.tourCompleted = tourCompleted === 'true';
        }
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

// Helper function to get show time based on show number
function getShowTime(showNumber) {
  const showTimes = {
    1: '11:00 AM',
    2: '2:00 PM', 
    3: '5:00 PM',
    4: '8:00 PM',
    5: '11:00 PM',
    6: '1:00 AM'
  };
  return showTimes[showNumber] || '12:00 PM';
}

// Helper function to get current week dates
export const getCurrentWeek = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const year = monday.getFullYear();
  const weekNumber = getWeekNumber(monday);
  
  return {
    startDate: monday.toISOString().split('T')[0],
    endDate: sunday.toISOString().split('T')[0],
    year,
    weekNumber
  };
};

// Helper function to get week number
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export const {
  addMovieToShow,
  removeMovieFromShow,
  updateShowDetails,
  setSelectedWeek,
  setShowsPerDay,
  addExtraShow,
  saveSchedule,
  loadSchedule,
  clearWeekSchedule,
  copyFromPreviousWeek,
  setTermsAndConditionsAccepted,
  setTourCompleted,
  loadUserPreferences,
  setLoading,
  setError
} = exhibitorScheduleSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────

const _selectRawSchedule = (state) => state.exhibitorSchedule.schedule;

export const selectScheduleForDate = (state, date) =>
  state.exhibitorSchedule.schedule[date] || {};

/**
 * Factory — call once per component instance (e.g. via useMemo) so each
 * consumer gets its own memoization cache.  This avoids the
 * "returned a different result with same parameters" Redux warning.
 *
 *   const selectWeekSchedule = useMemo(makeSelectScheduleForWeek, []);
 *   const weekSchedule = useSelector(s => selectWeekSchedule(s, selectedWeek));
 */
export const makeSelectScheduleForWeek = () =>
  createSelector(
    _selectRawSchedule,
    (_state, weekData) => weekData?.startDate,
    (_state, weekData) => weekData?.endDate,
    (schedule, startDate, endDate) => {
      if (!startDate || !endDate) return {};
      const weekSchedule = {};
      for (
        let d = new Date(startDate);
        d <= new Date(endDate);
        d.setDate(d.getDate() + 1)
      ) {
        const dateKey = d.toISOString().split('T')[0];
        weekSchedule[dateKey] = schedule[dateKey] || {};
      }
      return weekSchedule;
    }
  );

/** Convenience non-factory version — use only when weekData is stable */
export const selectScheduleForWeek = (state, weekData) => {
  const { startDate, endDate } = weekData || {};
  if (!startDate || !endDate) return {};
  const schedule = _selectRawSchedule(state);
  const weekSchedule = {};
  for (
    let d = new Date(startDate);
    d <= new Date(endDate);
    d.setDate(d.getDate() + 1)
  ) {
    const dateKey = d.toISOString().split('T')[0];
    weekSchedule[dateKey] = schedule[dateKey] || {};
  }
  return weekSchedule;
};

export const selectShowDetails = (state, date, showNumber) => {
  const showId = `show_${showNumber}`;
  return state.exhibitorSchedule.schedule[date]?.[showId] || null;
};

export const selectTotalShowsThisWeek = (state) => {
  const { selectedWeek, schedule } = state.exhibitorSchedule;
  if (!selectedWeek.startDate) return 0;
  
  let totalShows = 0;
  const start = new Date(selectedWeek.startDate);
  const end = new Date(selectedWeek.endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    if (schedule[dateKey]) {
      totalShows += Object.keys(schedule[dateKey]).length;
    }
  }
  
  return totalShows;
};

export const selectCompletedShowsThisWeek = (state) => {
  const { selectedWeek, schedule } = state.exhibitorSchedule;
  if (!selectedWeek.startDate) return 0;
  
  let completedShows = 0;
  const start = new Date(selectedWeek.startDate);
  const end = new Date(selectedWeek.endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    if (schedule[dateKey]) {
      Object.values(schedule[dateKey]).forEach(show => {
        if (show.totalSeats && show.occupiedSeats && show.ticketPrice) {
          completedShows++;
        }
      });
    }
  }
  
  return completedShows;
};

export const selectEstimatedGrossCollectionWeek = (state) => {
  const { selectedWeek, schedule } = state.exhibitorSchedule;
  if (!selectedWeek.startDate) return 0;
  
  let totalGross = 0;
  const start = new Date(selectedWeek.startDate);
  const end = new Date(selectedWeek.endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = d.toISOString().split('T')[0];
    if (schedule[dateKey]) {
      Object.values(schedule[dateKey]).forEach(show => {
        if (show.grossCollection) {
          totalGross += show.grossCollection;
        }
      });
    }
  }
  
  return totalGross;
};

export const selectTermsAndConditionsAccepted = (state) => 
  state.exhibitorSchedule.termsAndConditionsAccepted;

export const selectTourCompleted = (state) => 
  state.exhibitorSchedule.tourCompleted;

export const selectSelectedWeek = (state) => 
  state.exhibitorSchedule.selectedWeek;

export const selectShowsPerDay = (state) =>
  state.exhibitorSchedule.showsPerDay;

export const selectExtraShowsByDate = (state) =>
  state.exhibitorSchedule.extraShowsByDate;

export const selectScheduleLoading = (state) => 
  state.exhibitorSchedule.loading;

export const selectScheduleError = (state) => 
  state.exhibitorSchedule.error;

export default exhibitorScheduleSlice.reducer;
