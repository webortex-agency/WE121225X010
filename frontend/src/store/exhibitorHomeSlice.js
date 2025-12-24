import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Get token from localStorage
const getAuthToken = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.token;
};

// Async thunks
export const fetchExhibitorAssignments = createAsyncThunk(
    'exhibitorHome/fetchAssignments',
    async (exhibitorId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(
                `${API_URL}/api/assignments/exhibitor/${exhibitorId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
        }
    }
);

export const fetchExhibitorStats = createAsyncThunk(
    'exhibitorHome/fetchStats',
    async (exhibitorId, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.get(
                `${API_URL}/api/assignments/exhibitor/${exhibitorId}/stats`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
        }
    }
);

export const acceptAgreement = createAsyncThunk(
    'exhibitorHome/acceptAgreement',
    async ({ assignmentId, agreementVersion }, { rejectWithValue }) => {
        try {
            const token = getAuthToken();
            const response = await axios.post(
                `${API_URL}/api/assignments/${assignmentId}/accept-agreement`,
                { agreement_version: agreementVersion },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to accept agreement');
        }
    }
);

const exhibitorHomeSlice = createSlice({
    name: 'exhibitorHome',
    initialState: {
        assignments: [],
        stats: {
            active_movies: 0,
            previous_day_collection: 0,
            tickets_sold: 0,
            pending_approvals: 0,
        },
        loading: false,
        statsLoading: false,
        error: null,
        statsError: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
            state.statsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch assignments
            .addCase(fetchExhibitorAssignments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExhibitorAssignments.fulfilled, (state, action) => {
                state.loading = false;
                state.assignments = action.payload;
            })
            .addCase(fetchExhibitorAssignments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch stats
            .addCase(fetchExhibitorStats.pending, (state) => {
                state.statsLoading = true;
                state.statsError = null;
            })
            .addCase(fetchExhibitorStats.fulfilled, (state, action) => {
                state.statsLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchExhibitorStats.rejected, (state, action) => {
                state.statsLoading = false;
                state.statsError = action.payload;
            })
            // Accept agreement
            .addCase(acceptAgreement.fulfilled, (state, action) => {
                const index = state.assignments.findIndex(
                    (a) => a._id === action.payload._id
                );
                if (index !== -1) {
                    state.assignments[index] = action.payload;
                }
            });
    },
});

export const { clearError } = exhibitorHomeSlice.actions;
export default exhibitorHomeSlice.reducer;
