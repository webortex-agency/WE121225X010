import { useState, useEffect } from 'react';
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

const MovieManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('collections');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { movie_id } = useParams();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo || (userInfo.user?.role !== 'manager' && userInfo.user?.role !== 'producer')) {
      navigate('/');
      return;
    }

    // Check if movie_id is provided and matches user's assigned movie
    if (movie_id && userInfo.user?.assigned_movie_id !== movie_id) {
      setError({
        type: 'movie_not_assigned',
        message: `The movie "${movie_id}" is not assigned to you, ${userInfo.user?.name || 'User'}. You are assigned to movie "${userInfo.user?.assigned_movie_id}".`,
        userMovie: userInfo.user?.assigned_movie_id,
        requestedMovie: movie_id,
        userName: userInfo.user?.name
      });
      setIsLoading(false);
      return;
    }

    // If no movie_id in URL but user has assigned movie, redirect to correct URL
    if (!movie_id && userInfo.user?.assigned_movie_id) {
      navigate(`/movie-manager-dashboard/${userInfo.user.assigned_movie_id}`, { replace: true });
      return;
    }

    setTimeout(() => setIsLoading(false), 800);
  }, [navigate, userInfo, movie_id]);

  const movieData = {
    movieId: "MOV-2023-045",
    title: "Pathaan",
    posterImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1435ef291-1764821685582.png",
    posterImageAlt: "Action-packed movie poster featuring intense dramatic scene with protagonist in dynamic pose against explosive background with vibrant orange and blue color grading",
    releaseDate: "25/01/2023",
    duration: 146,
    genre: "Action Thriller",
    status: "Running",
    totalCollections: 157500000,
    collectionTrend: 12.5,
    theaterCount: 245,
    cityCount: 48,
    avgOccupancy: 78,
    occupancyTrend: 5.2,
    roi: 285.5,
    budget: 55000000
  };

  const collectionsData = [
  {
    date: "08/12/2023",
    theaterName: "PVR Cinemas Phoenix",
    matinee: 125000,
    afternoon: 185000,
    firstShow: 245000,
    secondShow: 195000,
    acCharges: 15000,
    totalCollection: 735000,
    status: "Approved"
  },
  {
    date: "08/12/2023",
    theaterName: "INOX Megaplex",
    matinee: 95000,
    afternoon: 145000,
    firstShow: 225000,
    secondShow: 175000,
    acCharges: 12800,
    totalCollection: 627200,
    status: "Approved"
  },
  {
    date: "07/12/2023",
    theaterName: "Cinepolis DLF",
    matinee: 115000,
    afternoon: 165000,
    firstShow: 235000,
    secondShow: 185000,
    acCharges: 14000,
    totalCollection: 686000,
    status: "Pending"
  },
  {
    date: "07/12/2023",
    theaterName: "PVR Cinemas Phoenix",
    matinee: 135000,
    afternoon: 195000,
    firstShow: 255000,
    secondShow: 205000,
    acCharges: 15800,
    totalCollection: 774200,
    status: "Approved"
  },
  {
    date: "06/12/2023",
    theaterName: "Carnival Cinemas",
    matinee: 85000,
    afternoon: 125000,
    firstShow: 195000,
    secondShow: 155000,
    acCharges: 11200,
    totalCollection: 548800,
    status: "Approved"
  }];


  const analyticsData = {
    dailyTrend: [
    { date: "01/12", collection: 6500000, occupancy: 72 },
    { date: "02/12", collection: 7200000, occupancy: 75 },
    { date: "03/12", collection: 8100000, occupancy: 78 },
    { date: "04/12", collection: 7800000, occupancy: 76 },
    { date: "05/12", collection: 8500000, occupancy: 80 },
    { date: "06/12", collection: 9200000, occupancy: 82 },
    { date: "07/12", collection: 8900000, occupancy: 79 }],

    weeklyAnalysis: [
    { week: "Week 1 (Fri-Thu)", collection: 45000000, target: 40000000 },
    { week: "Week 2 (Fri-Thu)", collection: 52000000, target: 45000000 },
    { week: "Week 3 (Fri-Thu)", collection: 48000000, target: 42000000 },
    { week: "Week 4 (Fri-Thu)", collection: 12500000, target: 15000000 }],

    theaterComparison: [
    { name: "PVR Cinemas Phoenix", city: "Mumbai", collection: 15750000, growth: 12.5 },
    { name: "INOX Megaplex", city: "Delhi", collection: 14200000, growth: 8.3 },
    { name: "Cinepolis DLF", city: "Bangalore", collection: 12800000, growth: 15.2 },
    { name: "Carnival Cinemas", city: "Pune", collection: 9500000, growth: 6.7 },
    { name: "Miraj Cinemas", city: "Hyderabad", collection: 8750000, growth: 10.1 }],

    insights: {
      peakDay: "Saturday",
      peakDayCollection: 9200000,
      avgPerTheater: 642857,
      bestShow: "First Show",
      bestShowOccupancy: 85,
      growthRate: 8.3
    }
  };

  const ledgerData = {
    summary: {
      totalCredits: 157500000,
      creditCount: 245,
      totalDebits: 45200000,
      debitCount: 89,
      netBalance: 112300000,
      pendingSettlements: 8500000,
      pendingCount: 12
    },
    entries: [
    {
      date: "08/12/2023",
      theaterName: "PVR Cinemas Phoenix",
      description: "Daily collection - 4 shows",
      type: "Credit",
      amount: 735000,
      status: "Settled"
    },
    {
      date: "08/12/2023",
      theaterName: "INOX Megaplex",
      description: "Daily collection - 4 shows",
      type: "Credit",
      amount: 627200,
      status: "Settled"
    },
    {
      date: "07/12/2023",
      theaterName: "PVR Cinemas Phoenix",
      description: "Settlement payment",
      type: "Debit",
      amount: 500000,
      status: "Settled"
    },
    {
      date: "07/12/2023",
      theaterName: "Cinepolis DLF",
      description: "Daily collection - 4 shows",
      type: "Credit",
      amount: 686000,
      status: "Pending"
    },
    {
      date: "06/12/2023",
      theaterName: "Carnival Cinemas",
      description: "Daily collection - 4 shows",
      type: "Credit",
      amount: 548800,
      status: "Settled"
    }]

  };

  const statementsData = [
  {
    title: "Week 1 Closing Statement",
    period: "01/12/2023 - 07/12/2023",
    generatedDate: "08/12/2023",
    status: "Final",
    totalCollections: 45000000,
    acCharges: 900000,
    netPayable: 44100000,
    theaterCount: 245,
    totalShows: 6860,
    daywiseSummary: [
    { date: "01/12/2023", shows: 980, gross: 6500000, acCharges: 130000, net: 6370000 },
    { date: "02/12/2023", shows: 980, gross: 7200000, acCharges: 144000, net: 7056000 },
    { date: "03/12/2023", shows: 980, gross: 8100000, acCharges: 162000, net: 7938000 },
    { date: "04/12/2023", shows: 980, gross: 7800000, acCharges: 156000, net: 7644000 },
    { date: "05/12/2023", shows: 980, gross: 8500000, acCharges: 170000, net: 8330000 },
    { date: "06/12/2023", shows: 980, gross: 9200000, acCharges: 184000, net: 9016000 },
    { date: "07/12/2023", shows: 980, gross: 8900000, acCharges: 178000, net: 8722000 }]

  },
  {
    title: "Week 2 Closing Statement",
    period: "08/12/2023 - 14/12/2023",
    generatedDate: "15/12/2023",
    status: "Draft",
    totalCollections: 52000000,
    acCharges: 1040000,
    netPayable: 50960000,
    theaterCount: 245,
    totalShows: 6860,
    daywiseSummary: [
    { date: "08/12/2023", shows: 980, gross: 7500000, acCharges: 150000, net: 7350000 },
    { date: "09/12/2023", shows: 980, gross: 8200000, acCharges: 164000, net: 8036000 },
    { date: "10/12/2023", shows: 980, gross: 7800000, acCharges: 156000, net: 7644000 },
    { date: "11/12/2023", shows: 980, gross: 6900000, acCharges: 138000, net: 6762000 },
    { date: "12/12/2023", shows: 980, gross: 7200000, acCharges: 144000, net: 7056000 },
    { date: "13/12/2023", shows: 980, gross: 7100000, acCharges: 142000, net: 6958000 },
    { date: "14/12/2023", shows: 980, gross: 7300000, acCharges: 146000, net: 7154000 }]
  }];

  let tabs = [
    { id: 'collections', label: 'Collections View', icon: 'IndianRupee' },
    { id: 'analytics', label: 'Performance Analytics', icon: 'BarChart3' },
    { id: 'ledger', label: 'Ledger Summary', icon: 'BookOpen' },
    { id: 'statements', label: 'Closing Statements', icon: 'FileText' }
  ];

  // Show error if movie is not assigned to user
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
                <p className="text-muted-foreground">Monitor movie performance and financial data with read-only access</p>
              </div>
              <div className="w-full lg:w-96">
                <SearchInterface userRole="manager" />
              </div>
            </div>
          </div>

          <StatusIndicatorPanel userRole="manager" />

          <div className="mt-6">
            <MovieDetailsHeader movieData={movieData} />
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border overflow-x-auto">
              <div className="flex">
                {tabs?.map((tab) =>
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab?.id ?
                  'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'}`
                  }>

                    <Icon name={tab?.icon} size={16} />
                    {tab?.label}
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {activeTab === 'collections' && <CollectionsView collectionsData={collectionsData} />}
              {activeTab === 'analytics' && <PerformanceAnalytics analyticsData={analyticsData} />}
              {activeTab === 'ledger' && <LedgerSummary ledgerData={ledgerData} />}
              {activeTab === 'statements' && <ClosingStatements statementsData={statementsData} />}
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
    </div>);

};

export default MovieManagerDashboard;