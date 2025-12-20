import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  metrics: {
    totalRevenue: 0,
    totalCollections: 0,
    activeMovies: 0,
    activeExhibitors: 0,
    approvalRate: 0,
    avgCollectionValue: 0
  },
  chartData: {
    revenueTrend: [],
    topMovies: [],
    topExhibitors: [],
    statusDistribution: [],
    dailySummary: [],
    moviePerformanceByRegion: []
  },
  period: 'thisMonth',
  loading: false
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setMetrics: (state, action) => {
      state.metrics = { ...state.metrics, ...action.payload };
    },
    setChartData: (state, action) => {
      state.chartData = { ...state.chartData, ...action.payload };
    },
    setPeriod: (state, action) => {
      state.period = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    calculateMetrics: (state, action) => {
      const { collections, movies, exhibitors } = action.payload;
      
      // Calculate total revenue (approved collections only)
      const approvedCollections = collections.filter(c => c.status === 'approved');
      const totalRevenue = approvedCollections.reduce((sum, c) => sum + c.netAmount, 0);
      
      // Calculate approval rate
      const approvalRate = collections.length > 0 
        ? Math.round((approvedCollections.length / collections.length) * 100) 
        : 0;
      
      // Calculate average collection value
      const avgCollectionValue = approvedCollections.length > 0 
        ? Math.round(totalRevenue / approvedCollections.length) 
        : 0;
      
      state.metrics = {
        totalRevenue,
        totalCollections: collections.length,
        activeMovies: movies.filter(m => m.status === 'active').length,
        activeExhibitors: exhibitors.filter(e => e.status === 'active').length,
        approvalRate,
        avgCollectionValue
      };
    }
  }
});

export const {
  setMetrics,
  setChartData,
  setPeriod,
  setLoading,
  calculateMetrics
} = analyticsSlice.actions;

// Selectors
export const selectMetrics = (state) => state.analytics.metrics;
export const selectChartData = (state) => state.analytics.chartData;
export const selectPeriod = (state) => state.analytics.period;
export const selectAnalyticsLoading = (state) => state.analytics.loading;

export default analyticsSlice.reducer;
