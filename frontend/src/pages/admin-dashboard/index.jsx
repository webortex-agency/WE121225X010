import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectActiveMovies } from '../../store/moviesSlice';
import { selectActiveExhibitors } from '../../store/exhibitorsSlice';
import { selectAllCollections } from '../../store/collectionsSlice';
import { selectMetrics } from '../../store/analyticsSlice';
import { autoInitialize } from '../../utils/initializeMockData';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import StatusIndicatorPanel from '../../components/ui/StatusIndicatorPanel';
import MetricCard from './components/MetricCard';
import RecentCollectionsTable from './components/RecentCollectionsTable';
import NavigationTile from './components/NavigationTile';
import SystemAlerts from './components/SystemAlerts';
import QuickStats from './components/QuickStats';
import MovieManagement from './components/MovieManagement';
import ExhibitorManagement from './components/ExhibitorManagement';
import GlobalSearch from './components/GlobalSearch';
import CollectionDataManagement from './components/CollectionDataManagement';
import Icon from '../../components/AppIcon';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const activeMovies = useSelector(selectActiveMovies);
  const activeExhibitors = useSelector(selectActiveExhibitors);
  const allCollections = useSelector(selectAllCollections);
  const analyticsMetrics = useSelector(selectMetrics);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [metrics, setMetrics] = useState({
    todayCollections: 2450000,
    weeklyTotal: 15750000,
    pendingSubmissions: 12,
    systemActivity: 245,
  });

  const [quickStats, setQuickStats] = useState({
    totalMovies: 8,
    activeTheaters: 45,
    totalExhibitors: 32,
    pendingApprovals: 12,
    weeklyRevenue: 15750000,
    monthlyRevenue: 62500000,
  });

  const [recentCollections, setRecentCollections] = useState([
    {
      id: 'COL-2023-001',
      theater: 'PVR Cinemas',
      location: 'Mumbai - Juhu',
      movie: 'Pathaan',
      date: '2023-12-12',
      amount: 245000,
      status: 'pending',
    },
    {
      id: 'COL-2023-002',
      theater: 'INOX Megaplex',
      location: 'Delhi - Connaught Place',
      movie: 'Jawan',
      date: '2023-12-12',
      amount: 185000,
      status: 'pending',
    },
    {
      id: 'COL-2023-003',
      theater: 'Cinepolis',
      location: 'Bangalore - Koramangala',
      movie: 'Dunki',
      date: '2023-12-11',
      amount: 165000,
      status: 'approved',
    },
    {
      id: 'COL-2023-004',
      theater: 'Carnival Cinemas',
      location: 'Pune - Aundh',
      movie: 'Pathaan',
      date: '2023-12-11',
      amount: 125000,
      status: 'pending',
    },
    {
      id: 'COL-2023-005',
      theater: 'Miraj Cinemas',
      location: 'Hyderabad - Banjara Hills',
      movie: 'Jawan',
      date: '2023-12-10',
      amount: 95000,
      status: 'approved',
    },
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    {
      id: 'alert-001',
      type: 'critical',
      title: 'Pending Approvals Threshold',
      message: '12 collections pending approval for more than 24 hours',
      details: 'Collections from PVR Cinemas (3), INOX Megaplex (4), Cinepolis (2), and others require immediate attention to maintain workflow efficiency.',
      timestamp: new Date(Date.now() - 3600000),
      actionLabel: 'Review Now',
      dismissed: false,
    },
    {
      id: 'alert-002',
      type: 'warning',
      title: 'Ledger Reconciliation Due',
      message: '5 exhibitor accounts require reconciliation',
      details: 'Monthly reconciliation deadline approaching for exhibitors: PVR Cinemas, INOX Megaplex, Carnival Cinemas, Miraj Cinemas, and Wave Cinemas.',
      timestamp: new Date(Date.now() - 7200000),
      actionLabel: 'View Accounts',
      dismissed: false,
    },
    {
      id: 'alert-003',
      type: 'info',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance on 15th December 2023, 02:00 AM - 04:00 AM IST',
      details: 'Database optimization and security updates will be performed. System will be unavailable during this period. All users have been notified via email.',
      timestamp: new Date(Date.now() - 10800000),
      dismissed: false,
    },
  ]);

  const navigationTiles = [
    {
      title: 'Movie Management',
      description: 'Add, edit, and manage movie assignments',
      icon: 'Film',
      iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      count: quickStats?.totalMovies,
      countLabel: 'active movies',
      route: '/admin/movies',
    },
    {
      title: 'Exhibitor Management',
      description: 'Manage exhibitor accounts and assignments',
      icon: 'Building2',
      iconColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      count: quickStats?.totalExhibitors,
      countLabel: 'registered exhibitors',
      route: '/admin/exhibitors',
    },
    {
      title: 'Collections Approval',
      description: 'Review and approve collection submissions',
      icon: 'CheckCircle2',
      iconColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
      count: quickStats?.pendingApprovals,
      countLabel: 'pending approvals',
      badge: quickStats?.pendingApprovals,
    },
    {
      title: 'Ledger Operations',
      description: 'View and manage exhibitor ledgers',
      icon: 'BookOpen',
      iconColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      count: quickStats?.activeTheaters,
      countLabel: 'active accounts',
    },
    {
      title: 'Closing Statements',
      description: 'Generate picture closing statements',
      icon: 'FileText',
      iconColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      route: '/closing-statement-generation',
    },
    {
      title: 'Reports Dashboard',
      description: 'Access comprehensive reports and analytics',
      icon: 'BarChart3',
      iconColor: 'bg-gradient-to-br from-green-500 to-green-600',
      route: '/admin/analytics',
    },
  ];

  useEffect(() => {
    // Check authentication
    if (!userInfo || userInfo.user?.role !== 'admin') {
      navigate('/');
      return;
    }

    // Initialize mock data
    autoInitialize();

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [navigate, userInfo]);

  const handleApproveCollection = (collectionId) => {
    setRecentCollections((prev) =>
      prev?.map((col) =>
        col?.id === collectionId ? { ...col, status: 'approved' } : col
      )
    );
    setQuickStats((prev) => ({
      ...prev,
      pendingApprovals: Math.max(0, prev?.pendingApprovals - 1),
    }));
  };

  const handleRejectCollection = (collectionId) => {
    setRecentCollections((prev) =>
      prev?.map((col) =>
        col?.id === collectionId ? { ...col, status: 'rejected' } : col
      )
    );
    setQuickStats((prev) => ({
      ...prev,
      pendingApprovals: Math.max(0, prev?.pendingApprovals - 1),
    }));
  };

  const handleViewCollection = (collectionId) => {
    console.log('Viewing collection:', collectionId);
  };

  const handleDismissAlert = (alertId) => {
    setSystemAlerts((prev) =>
      prev?.map((alert) =>
        alert?.id === alertId ? { ...alert, dismissed: true } : alert
      )
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  // Admin dashboard sections
  const adminSections = [
    { id: 'overview', label: 'Dashboard Overview', icon: 'LayoutDashboard' },
    { id: 'movies', label: 'Movie Management', icon: 'Film' },
    { id: 'exhibitors', label: 'Exhibitor Management', icon: 'Building2' },
    { id: 'search', label: 'Global Search', icon: 'Search' },
    { id: 'collections', label: 'Collection Data', icon: 'IndianRupee' },
    { id: 'ledger', label: 'Ledger Management', icon: 'BookOpen' },
    { id: 'statements', label: 'Closing Statements', icon: 'FileText' },
    { id: 'reports', label: 'Reports & Analytics', icon: 'BarChart3' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />
      {/* <QuickActionToolbar userRole="admin" /> */}
      <div className="main-content with-toolbar">
        <div className="content-container p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Home Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userInfo?.user?.name || 'Admin'}. Here's a summary of the current system status.</p>
          </div>

          {/* New Metrics Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Active Movies"
              value={activeMovies.length}
              change="View Movies"
              changeType="link"
              icon="Film"
              iconColor="bg-teal-600"
              loading={loading}
              onClick={() => navigate('/admin/movies')}
            />
            <MetricCard
              title="Active Exhibitors"
              value={activeExhibitors.length}
              change="View Exhibitors"
              changeType="link"
              icon="Building2"
              iconColor="bg-teal-600"
              loading={loading}
              onClick={() => navigate('/admin/exhibitors')}
            />
            <MetricCard
              title="Active Collections"
              value={allCollections.filter(c => c.status === 'pending' || c.status === 'approved').length}
              change="View Collections"
              changeType="link"
              icon="TrendingUp"
              iconColor="bg-teal-600"
              loading={loading}
              onClick={() => console.log('Navigate to collections')}
            />
            <MetricCard
              title="Total Revenue (This Month)"
              value={formatCurrency(analyticsMetrics.totalRevenue || 0)}
              change="+15% vs last month"
              changeType="positive"
              icon="DollarSign"
              iconColor="bg-green-600"
              loading={loading}
              onClick={() => navigate('/admin/analytics')}
            />
          </div>

          {/* Quick Links Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button onClick={() => navigate('/admin/movies')} className="p-4 bg-card border rounded-lg flex items-center gap-4 hover:bg-muted transition-colors">
                    <Icon name="Film" size={24} className="text-primary"/>
                    <span className="font-medium">View All Movies</span>
                </button>
                <button onClick={() => navigate('/admin/exhibitors')} className="p-4 bg-card border rounded-lg flex items-center gap-4 hover:bg-muted transition-colors">
                    <Icon name="Building2" size={24} className="text-primary"/>
                    <span className="font-medium">View All Exhibitors</span>
                </button>
                <button onClick={() => navigate('/admin/analytics')} className="p-4 bg-card border rounded-lg flex items-center gap-4 hover:bg-muted transition-colors">
                    <Icon name="BarChart3" size={24} className="text-primary"/>
                    <span className="font-medium">View Analytics</span>
                </button>
                <button onClick={() => navigate('/statements')} className="p-4 bg-card border rounded-lg flex items-center gap-4 hover:bg-muted transition-colors">
                    <Icon name="FileText" size={24} className="text-primary"/>
                    <span className="font-medium">View Statements</span>
                </button>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
            <RecentCollectionsTable
              collections={recentCollections}
              onApprove={handleApproveCollection}
              onReject={handleRejectCollection}
              onView={handleViewCollection}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;