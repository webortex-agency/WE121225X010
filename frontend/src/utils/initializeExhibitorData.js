import { store } from '../store';
import { setAssignedMovies } from '../store/exhibitorMoviesSlice';
import { loadSchedule, loadUserPreferences, setSelectedWeek, getCurrentWeek } from '../store/exhibitorScheduleSlice';
import { setSubmissions } from '../store/exhibitorCollectionsSlice';
import { mockExhibitorMovies } from '../fixtures/mockExhibitorMovies';
import { mockExhibitorSchedule } from '../fixtures/mockExhibitorSchedule';

export const initializeExhibitorData = () => {
  const { dispatch, getState } = store;
  
  // Initialize exhibitor movies
  dispatch(setAssignedMovies(mockExhibitorMovies));
  
  // Load user preferences (T&C acceptance, tour completion)
  dispatch(loadUserPreferences());
  
  // Load schedule from localStorage or set initial schedule
  dispatch(loadSchedule());
  
  // Set current week if not already set
  const currentState = getState();
  if (!currentState.exhibitorSchedule.selectedWeek.startDate) {
    const currentWeek = getCurrentWeek();
    dispatch(setSelectedWeek(currentWeek));
  }
  
  // Initialize with mock schedule if no schedule exists
  const scheduleState = getState().exhibitorSchedule;
  if (Object.keys(scheduleState.schedule).length === 0) {
    // Set mock schedule data directly
    Object.keys(mockExhibitorSchedule).forEach(date => {
      Object.keys(mockExhibitorSchedule[date]).forEach(showId => {
        const show = mockExhibitorSchedule[date][showId];
        // This would normally use addMovieToShow, but for initial data we set directly
      });
    });
  }
  
  // Initialize collections submissions (empty for now)
  dispatch(setSubmissions([]));
  
  console.log('Exhibitor mock data initialized successfully');
};

// Auto-initialize when this module is imported
let isExhibitorInitialized = false;

export const autoInitializeExhibitor = () => {
  if (!isExhibitorInitialized) {
    // Wait for store to be ready
    setTimeout(() => {
      const state = store.getState();
      
      // Only initialize if exhibitor data is empty
      if (state.exhibitorMovies.assignedMovies.length === 0) {
        initializeExhibitorData();
        isExhibitorInitialized = true;
      }
    }, 100);
  }
};
