import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../../components/ui/QuickActionToolbar';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { selectExhibitorById } from '../../../store/exhibitorsSlice';
import { selectCollectionsByExhibitor } from '../../../store/collectionsSlice';
import { autoInitialize } from '../../../utils/initializeMockData';

const ExhibitorDetailsPage = () => {
  const { exhibitor_id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const exhibitor = useSelector(state => selectExhibitorById(state, exhibitor_id));
  const collections = useSelector(state => selectCollectionsByExhibitor(state, exhibitor_id));

  useEffect(() => {
    autoInitialize();
  }, []);

  if (!exhibitor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Exhibitor Not Found</h2>
          <p className="text-muted-foreground mb-4">The exhibitor you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/admin/exhibitors')}>
            Back to Exhibitors
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'User' },
    { id: 'movies', label: 'Assigned Movies', icon: 'Film' },
    { id: 'collections', label: 'Collections', icon: 'IndianRupee' },
    { id: 'ledger', label: 'Ledger', icon: 'BookOpen' },
    { id: 'reconciliation', label: 'Payment Reconciliation', icon: 'CreditCard' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />
      <QuickActionToolbar userRole="admin" />
      
      <div className="main-content with-toolbar">
        <div className="content-container">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => navigate('/admin/exhibitors')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to Exhibitors
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{exhibitor.exhibitorName}</h1>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(exhibitor.status)}`}>
                    {exhibitor.status.charAt(0).toUpperCase() + exhibitor.status.slice(1)}
                  </span>
                </div>
                <p className="text-muted-foreground">{exhibitor.cinemaName} • {exhibitor.location}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" iconName="Edit">Edit</Button>
                <Button variant="outline" iconName="FileText">Generate Report</Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
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
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Exhibitor Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Exhibitor Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Exhibitor Name</label>
                          <p className="text-foreground">{exhibitor.exhibitorName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Cinema Name</label>
                          <p className="text-foreground">{exhibitor.cinemaName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Location</label>
                          <p className="text-foreground">{exhibitor.location}</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Contact Person</label>
                          <p className="text-foreground">{exhibitor.contactPerson}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-foreground">
                            <a href={`mailto:${exhibitor.email}`} className="text-primary hover:text-primary/80">
                              {exhibitor.email}
                            </a>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-foreground">
                            <a href={`tel:${exhibitor.phone}`} className="text-primary hover:text-primary/80">
                              {exhibitor.phone}
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Film" size={16} className="text-primary" />
                          <span className="text-sm font-medium text-foreground">Active Movies</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{exhibitor.activeMovies}</p>
                        <p className="text-xs text-success">+2 this month</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="IndianRupee" size={16} className="text-primary" />
                          <span className="text-sm font-medium text-foreground">Total Collections</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(exhibitor.totalCollections)}</p>
                        <p className="text-xs text-success">+12% this month</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="TrendingUp" size={16} className="text-primary" />
                          <span className="text-sm font-medium text-foreground">Avg Collection/Day</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{formatCurrency(Math.round(exhibitor.totalCollections / 30))}</p>
                        <p className="text-xs text-success">+8% vs last month</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="Clock" size={16} className="text-warning" />
                          <span className="text-sm font-medium text-foreground">Pending Approvals</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                          {collections.filter(c => c.status === 'pending').length}
                        </p>
                        <p className="text-xs text-muted-foreground">Awaiting review</p>
                      </div>
                    </div>
                  </div>

                  {/* Login Credentials */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4">Login Credentials</h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Username</label>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="bg-background px-2 py-1 rounded text-sm font-mono">{exhibitor.username}</code>
                            <Button variant="ghost" size="sm" iconName="Copy">Copy</Button>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Password (Last Reset)</label>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {exhibitor.lastCollectionDate ? new Date(exhibitor.lastCollectionDate).toLocaleDateString() : 'Never reset'}
                            </span>
                            <Button variant="ghost" size="sm" iconName="RefreshCw">Generate New</Button>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Last login: {exhibitor.lastCollectionDate ? new Date(exhibitor.lastCollectionDate).toLocaleString() : 'Never logged in'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs would be implemented similarly */}
              {activeTab !== 'overview' && (
                <div className="text-center py-12">
                  <Icon name={tabs.find(t => t.id === activeTab)?.icon} size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {tabs.find(t => t.id === activeTab)?.label} - Coming Soon
                  </h3>
                  <p className="text-muted-foreground">
                    This section is under development and will be available soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExhibitorDetailsPage;
