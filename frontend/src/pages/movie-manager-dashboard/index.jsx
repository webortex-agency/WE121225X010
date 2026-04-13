import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import SearchInterface from '../../components/ui/SearchInterface';
import StatusIndicatorPanel from '../../components/ui/StatusIndicatorPanel';
import MovieDetailsHeader from './components/MovieDetailsHeader';
import CollectionsView from './components/CollectionsView';
import PerformanceAnalytics from './components/PerformanceAnalytics';
import LedgerSummary from './components/LedgerSummary';
import ClosingStatements from './components/ClosingStatements';
import Icon from '../../components/AppIcon';
import { getCollectionsByMovie, getMovieAnalytics, listStatements } from '../../utils/api';

const MovieManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('collections');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { movie_id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  // Live data state
  const [movieData, setMovieData] = useState(null);
  const [collectionsData, setCollectionsData] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [statementsData, setStatementsData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!userInfo || (userInfo.user?.role !== 'manager' && userInfo.user?.role !== 'producer')) {
      navigate('/');
      return;
    }

    if (movie_id && userInfo.user?.assigned_movie_id !== movie_id) {
      setError({
        type: 'movie_not_assigned',
        message: `The movie "${movie_id}" is not assigned to you, ${userInfo.user?.name || 'User'}. You are assigned to movie "${userInfo.user?.assigned_movie_id}".`,
        userMovie: userInfo.user?.assigned_movie_id,
        requestedMovie: movie_id,
        userName: userInfo.user?.name,
      });
      setIsLoading(false);
      return;
    }

    if (!movie_id && userInfo.user?.assigned_movie_id) {
      navigate(`/movie-manager-dashboard/${userInfo.user.assigned_movie_id}`, { replace: true });
      return;
    }

    setIsLoading(false);
  }, [navigate, userInfo, movie_id]);

  const fetchLiveData = useCallback(async () => {
    if (!movie_id) return;
    setDataLoading(true);
    try {
      const [colRes, analyticsRes, stmtRes] = await Promise.allSettled([
        getCollectionsByMovie(movie_id, { limit: 50 }),
        getMovieAnalytics(movie_id),
        listStatements({ movie_id }),
      ]);

      // Collections
      if (colRes.status === 'fulfilled') {
        const mapped = (colRes.value.collections || []).map((c) => ({
          date: c.date ? new Date(c.date).toLocaleDateString('en-IN') : '',
          theaterName: c.theater_name || 'Unknown',
          matinee: c.shows?.matinee?.collection || 0,
          afternoon: c.shows?.afternoon?.collection || 0,
          firstShow: c.shows?.first_show?.collection || 0,
          secondShow: c.shows?.second_show?.collection || 0,
          acCharges: 0,
          totalCollection: c.totals?.collection || 0,
          netCollection: c.net_collection || 0,
          status: c.status.charAt(0).toUpperCase() + c.status.slice(1),
        }));
        setCollectionsData(mapped);
      }

      // Analytics
      if (analyticsRes.status === 'fulfilled') {
        const a = analyticsRes.value;
        setMovieData((prev) => ({
          ...(prev || {}),
          movieId: movie_id,
          title: movie_id,
          totalCollections: a.totalGross || 0,
          theaterCount: a.theaterCount || 0,
          status: 'Running',
        }));

        const dailyTrend = (a.dailyTrend || []).map((d) => ({
          date: d.date ? new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '',
          collection: d.gross || 0,
          net: d.net || 0,
          occupancy: 0,
        }));

        const weeklyAnalysis = (a.weeklySummary || []).map((w) => ({
          week: w.week,
          collection: w.gross || 0,
          net: w.net || 0,
          target: 0,
        }));

        const theaterComparison = (a.theaterSummary || []).map((t) => ({
          name: t.theater,
          city: t.location || '',
          collection: t.gross || 0,
          net: t.net || 0,
          growth: 0,
        }));

        setAnalyticsData({
          dailyTrend,
          weeklyAnalysis,
          theaterComparison,
          insights: {
            peakDay: 'N/A',
            peakDayCollection: 0,
            avgPerTheater: a.theaterCount > 0 ? Math.round(a.totalGross / a.theaterCount) : 0,
            bestShow: 'N/A',
            bestShowOccupancy: 0,
            growthRate: 0,
          },
          totals: {
            totalGross: a.totalGross || 0,
            totalNet: a.totalNet || 0,
            totalDays: a.totalDays || 0,
            totalShows: a.totalShows || 0,
          },
        });

        // Build ledger summary from analytics data
        setLedgerData({
          summary: {
            totalCredits: a.totalNet || 0,
            creditCount: a.totalDays || 0,
            totalDebits: 0,
            debitCount: 0,
            netBalance: a.totalNet || 0,
            pendingSettlements: 0,
            pendingCount: 0,
          },
          entries: (a.dailyTrend || []).slice(0, 10).map((d) => ({
            date: d.date ? new Date(d.date).toLocaleDateString('en-IN') : '',
            theaterName: d.theater || '',
            description: `Daily collection - ${d.day_name || ''}`,
            type: 'Credit',
            amount: d.net || 0,
            status: 'Settled',
          })),
        });
      }

      // Statements
      if (stmtRes.status === 'fulfilled') {
        const mapped = (stmtRes.value.statements || []).map((s) => ({
          id: s._id,
          title: `${s.theater_name} — ${new Date(s.date_from).toLocaleDateString('en-IN')} to ${new Date(s.date_to).toLocaleDateString('en-IN')}`,
          period: `${new Date(s.date_from).toLocaleDateString('en-IN')} - ${new Date(s.date_to).toLocaleDateString('en-IN')}`,
          generatedDate: new Date(s.generated_date).toLocaleDateString('en-IN'),
          status: 'Final',
          totalCollections: s.totals?.total_gross || 0,
          acCharges: 0,
          netPayable: s.totals?.total_payable || 0,
          theaterName: s.theater_name,
        }));
        setStatementsData(mapped);
      }
    } catch (err) {
      console.error('Failed to load live data:', err);
    } finally {
      setDataLoading(false);
    }
  }, [movie_id]);

  useEffect(() => {
    if (!isLoading && movie_id && !error) {
      fetchLiveData();
    }
  }, [isLoading, movie_id, error, fetchLiveData]);

  const tabs = [
    { id: 'collections', label: 'Collections View', icon: 'IndianRupee' },
    { id: 'analytics', label: 'Performance Analytics', icon: 'BarChart3' },
    { id: 'ledger', label: 'Ledger Summary', icon: 'BookOpen' },
    { id: 'statements', label: 'Closing Statements', icon: 'FileText' },
  ];

  if (error && error.type === 'movie_not_assigned') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-card border border-destructive/20 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertTriangle" size={32} className="text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Movie Not Assigned</h2>
            <p className="text-muted-foreground mb-6">{error.message}</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/movie-manager-dashboard/${error.userMovie}`)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Go to Your Assigned Movie ({error.userMovie})
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Fallback movie data if analytics haven't loaded yet
  const displayMovieData = movieData || {
    movieId: movie_id,
    title: movie_id,
    status: 'Running',
    totalCollections: 0,
    theaterCount: 0,
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole={userInfo?.user?.role || 'manager'} />
      <QuickActionToolbar userRole={userInfo?.user?.role || 'manager'} />
      <div className="main-content with-toolbar">
        <div className="content-container">
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">Movie Manager Dashboard</h1>
                <p className="text-muted-foreground">
                  Live performance data for <strong>{movie_id}</strong>
                  {dataLoading && <span className="ml-2 text-xs text-muted-foreground animate-pulse">Loading...</span>}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchLiveData}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-md"
                >
                  <Icon name="RefreshCw" size={14} />
                  Refresh
                </button>
                <div className="w-full lg:w-80">
                  <SearchInterface userRole="manager" />
                </div>
              </div>
            </div>
          </div>

          <StatusIndicatorPanel userRole="manager" />

          <div className="mt-6">
            <MovieDetailsHeader movieData={displayMovieData} />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border overflow-x-auto">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Icon name={tab.icon} size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {dataLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Icon name="Loader2" size={28} className="animate-spin text-muted-foreground mr-3" />
                  <span className="text-muted-foreground">Fetching live data...</span>
                </div>
              ) : (
                <>
                  {activeTab === 'collections' && (
                    collectionsData.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Icon name="FileX" size={40} className="mx-auto mb-3 opacity-40" />
                        <p>No approved collections found for {movie_id} yet.</p>
                      </div>
                    ) : (
                      <CollectionsView collectionsData={collectionsData} />
                    )
                  )}
                  {activeTab === 'analytics' && (
                    analyticsData ? (
                      <PerformanceAnalytics analyticsData={analyticsData} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Icon name="BarChart3" size={40} className="mx-auto mb-3 opacity-40" />
                        <p>No analytics data available yet.</p>
                      </div>
                    )
                  )}
                  {activeTab === 'ledger' && (
                    ledgerData ? (
                      <LedgerSummary ledgerData={ledgerData} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Icon name="BookOpen" size={40} className="mx-auto mb-3 opacity-40" />
                        <p>No ledger data available yet.</p>
                      </div>
                    )
                  )}
                  {activeTab === 'statements' && (
                    <ClosingStatements statementsData={statementsData} movieId={movie_id} />
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="Lock" size={16} />
              <span>You have read-only access to this movie's data. Contact admin for edit permissions.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieManagerDashboard;
