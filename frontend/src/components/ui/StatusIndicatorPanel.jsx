import { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const StatusIndicatorPanel = ({ userRole = 'admin' }) => {
  const [statusData, setStatusData] = useState({
    admin: {
      totalCollections: 2450000,
      pendingApprovals: 12,
      activeMovies: 8,
      systemHealth: 'healthy',
    },
    manager: {
      movieRevenue: 15750000,
      screenCount: 245,
      averageOccupancy: 78,
      trendDirection: 'up',
    },
    exhibitor: {
      todayCollection: 125000,
      pendingSubmissions: 2,
      ledgerBalance: 450000,
      lastSync: new Date(),
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusData((prev) => ({
        ...prev,
        admin: {
          ...prev?.admin,
          totalCollections: prev?.admin?.totalCollections + Math.floor(Math.random() * 50000),
          pendingApprovals: Math.max(0, prev?.admin?.pendingApprovals + Math.floor(Math.random() * 3) - 1),
        },
        exhibitor: {
          ...prev?.exhibitor,
          lastSync: new Date(),
        },
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'info';
    }
  };

  const renderAdminStatus = () => (
    <>
      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Total Collections</span>
          <Icon name="IndianRupee" size={16} className="status-card-icon text-primary" />
        </div>
        <div className="status-card-value">{formatCurrency(statusData?.admin?.totalCollections)}</div>
        <div className="status-card-change positive">
          <Icon name="TrendingUp" size={12} className="inline mr-1" />
          +12.5% from last week
        </div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Pending Approvals</span>
          <Icon name="Clock" size={16} className="status-card-icon text-warning" />
        </div>
        <div className="status-card-value">{statusData?.admin?.pendingApprovals}</div>
        <div className="status-card-change">Requires attention</div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Active Movies</span>
          <Icon name="Film" size={16} className="status-card-icon text-accent" />
        </div>
        <div className="status-card-value">{statusData?.admin?.activeMovies}</div>
        <div className="status-card-change">Currently running</div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">System Health</span>
          <Icon name="Activity" size={16} className="status-card-icon text-success" />
        </div>
        <div className="mt-2">
          <span className={`status-indicator ${getStatusColor(statusData?.admin?.systemHealth)}`}>
            <Icon name="CheckCircle2" size={12} />
            All Systems Operational
          </span>
        </div>
      </div>
    </>
  );

  const renderManagerStatus = () => (
    <>
      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Movie Revenue</span>
          <Icon name="IndianRupee" size={16} className="status-card-icon text-primary" />
        </div>
        <div className="status-card-value">{formatCurrency(statusData?.manager?.movieRevenue)}</div>
        <div className="status-card-change positive">
          <Icon name="TrendingUp" size={12} className="inline mr-1" />
          +8.3% this month
        </div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Screen Count</span>
          <Icon name="Monitor" size={16} className="status-card-icon text-accent" />
        </div>
        <div className="status-card-value">{statusData?.manager?.screenCount}</div>
        <div className="status-card-change">Across all theaters</div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Avg Occupancy</span>
          <Icon name="Users" size={16} className="status-card-icon text-success" />
        </div>
        <div className="status-card-value">{statusData?.manager?.averageOccupancy}%</div>
        <div className="status-card-change positive">
          <Icon name="TrendingUp" size={12} className="inline mr-1" />
          Above target
        </div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Performance</span>
          <Icon name="BarChart3" size={16} className="status-card-icon text-primary" />
        </div>
        <div className="mt-2">
          <span className="status-indicator success">
            <Icon name="TrendingUp" size={12} />
            Strong Performance
          </span>
        </div>
      </div>
    </>
  );

  const renderExhibitorStatus = () => (
    <>
      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Today's Collection</span>
          <Icon name="IndianRupee" size={16} className="status-card-icon text-primary" />
        </div>
        <div className="status-card-value">{formatCurrency(statusData?.exhibitor?.todayCollection)}</div>
        <div className="status-card-change">As of now</div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Pending Submissions</span>
          <Icon name="Clock" size={16} className="status-card-icon text-warning" />
        </div>
        <div className="status-card-value">{statusData?.exhibitor?.pendingSubmissions}</div>
        <div className="status-card-change">Submit before EOD</div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Ledger Balance</span>
          <Icon name="BookOpen" size={16} className="status-card-icon text-accent" />
        </div>
        <div className="status-card-value">{formatCurrency(statusData?.exhibitor?.ledgerBalance)}</div>
        <div className="status-card-change">Current balance</div>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <span className="status-card-label">Last Sync</span>
          <Icon name="RefreshCw" size={16} className="status-card-icon text-success" />
        </div>
        <div className="mt-2">
          <span className="status-indicator success">
            <Icon name="CheckCircle2" size={12} />
            {statusData?.exhibitor?.lastSync?.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </>
  );

  const renderStatus = () => {
    switch (userRole) {
      case 'admin':
        return renderAdminStatus();
      case 'manager':
        return renderManagerStatus();
      case 'exhibitor':
        return renderExhibitorStatus();
      default:
        return renderAdminStatus();
    }
  };

  return (
    <div className="status-panel">
      <div className="status-panel-header">
        <h3 className="status-panel-title">System Status</h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <Icon name="RefreshCw" size={16} />
        </button>
      </div>
      <div className="status-panel-grid">{renderStatus()}</div>
    </div>
  );
};

export default StatusIndicatorPanel;