import { store } from '../store';
import { setMovies } from '../store/moviesSlice';
import { setExhibitors } from '../store/exhibitorsSlice';
import { setCollections } from '../store/collectionsSlice';
import { setMetrics, setChartData, calculateMetrics } from '../store/analyticsSlice';
import { mockMovies } from '../fixtures/mockMovies';
import { mockExhibitors } from '../fixtures/mockExhibitors';
import { mockCollections } from '../fixtures/mockCollections';
import { mockAnalytics } from '../fixtures/mockAnalytics';

export const initializeMockData = () => {
  const { dispatch, getState } = store;
  
  // Initialize movies
  dispatch(setMovies(mockMovies));
  
  // Initialize exhibitors
  dispatch(setExhibitors(mockExhibitors));
  
  // Initialize collections
  dispatch(setCollections(mockCollections));
  
  // Initialize analytics with pre-calculated data
  dispatch(setMetrics(mockAnalytics.metrics));
  dispatch(setChartData(mockAnalytics.chartData));
  
  console.log('Mock data initialized successfully');
};

// Auto-initialize when this module is imported
let isInitialized = false;

export const autoInitialize = () => {
  if (!isInitialized) {
    // Wait for store to be ready
    setTimeout(() => {
      const state = store.getState();
      
      // Only initialize if data is empty
      if (state.movies.movies.length === 0) {
        initializeMockData();
        isInitialized = true;
      }
    }, 100);
  }
};
