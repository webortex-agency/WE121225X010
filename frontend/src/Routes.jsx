import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ClosingStatementGeneration from "./pages/closing-statement-generation";
import AdminDashboard from "./pages/admin-dashboard";
import MovieManagerDashboard from "./pages/movie-manager-dashboard";
import ExhibitorPortal from "./pages/exhibitor-portal";
import LoginPage from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import MoviesManagement from "./pages/admin-dashboard/pages/MoviesManagement";
import ExhibitorsManagement from "./pages/admin-dashboard/pages/ExhibitorsManagement";
import ExhibitorDetailsPage from "./pages/admin-dashboard/pages/ExhibitorDetailsPage";
import AnalyticsPage from "./pages/admin-dashboard/pages/AnalyticsPage";
// Exhibitor Dashboard imports
import ExhibitorDashboard from "./pages/exhibitor-dashboard";
import ExhibitorHome from "./pages/exhibitor-dashboard/pages/ExhibitorHome";
import ExhibitorCollectionsPage from "./pages/exhibitor-dashboard/pages/CollectionsPage";
import ExhibitorLedgerPage from "./pages/exhibitor-dashboard/pages/LedgerPage";
import ExhibitorProfilePage from "./pages/exhibitor-dashboard/pages/ProfilePage";
import MovieDetailsPage from "./pages/exhibitor-dashboard/pages/MovieDetailsPage";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          <Route path="/" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/closing-statement-generation"
              element={<ClosingStatementGeneration />}
            />

            {/* Admin Routes */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin/movies" element={<MoviesManagement />} />
            <Route path="/admin/exhibitors" element={<ExhibitorsManagement />} />
            <Route path="/admin/exhibitors/:exhibitor_id" element={<ExhibitorDetailsPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />

            {/* Movie Manager Routes */}
            <Route
              path="/movie-manager-dashboard/:movie_id?"
              element={<MovieManagerDashboard />}
            />

            {/* Exhibitor Dashboard Routes */}
            <Route path="/exhibitor/home" element={<ExhibitorHome />} />
            <Route path="/exhibitor/dashboard/:movieId" element={<ExhibitorDashboard />} />
            <Route path="/exhibitor/movie/:movieId" element={<MovieDetailsPage />} />
            <Route path="/exhibitor/collections" element={<ExhibitorCollectionsPage />} />
            <Route path="/exhibitor/ledger" element={<ExhibitorLedgerPage />} />
            <Route path="/exhibitor/profile" element={<ExhibitorProfilePage />} />

            {/* Legacy Exhibitor Portal Route (redirect to new dashboard) */}
            <Route path="/exhibitor-portal" element={<ExhibitorDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
