import { useState, useEffect, useCallback } from 'react';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import KPIMetrics from '../components/KPIMetrics';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { getDashboardAnalytics, exportCollectionsCSV } from '../../../utils/api';

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0, totalCollections: 0, activeMovies: 0,
    activeExhibitors: 0, approvalRate: 0, avgCollectionValue: 0,
    pendingCount: 0, rejectedCount: 0,
  });
  const [chartData, setChartData] = useState({
    revenueTrend: [], topMovies: [], topExhibitors: [],
    statusDistribution: [], dailySummary: [],
  });

  const periodOptions = [
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' },
  ];

  const fetchAnalytics = useCallback(async (period) => {
    setLoading(true);
    try {
      const data = await getDashboardAnalytics({ period });
      setMetrics(data.metrics || {});
      setChartData(data.chartData || {});
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(selectedPeriod);
  }, [selectedPeriod, fetchAnalytics]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportCollectionsCSV({ period: selectedPeriod });
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading live analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />

      <div className="main-content with-toolbar">
        <div className="content-container">
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Analytics & Performance Dashboard</h1>
                <p className="text-muted-foreground">
                  Live insights from real collection data
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Period:</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {periodOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => fetchAnalytics(selectedPeriod)}
                  className="flex items-center gap-1.5 text-sm border border-border px-3 py-2 rounded-md hover:bg-muted"
                >
                  <Icon name="RefreshCw" size={14} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Live KPI summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Pending Approvals', value: metrics.pendingCount, icon: 'Clock', color: 'text-amber-500' },
              { label: 'Total Submitted', value: metrics.totalCollections, icon: 'FileText', color: 'text-blue-500' },
              { label: 'Approval Rate', value: `${metrics.approvalRate}%`, icon: 'CheckCircle', color: 'text-green-500' },
              { label: 'Rejected', value: metrics.rejectedCount, icon: 'XCircle', color: 'text-red-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                <Icon name={stat.icon} size={22} className={stat.color} />
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-8">
            <KPIMetrics metrics={metrics} loading={false} />
          </div>

          <div className="mb-8">
            <AnalyticsCharts chartData={chartData} period={selectedPeriod} loading={false} />
          </div>

          {/* Export section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Export & Share</h3>
                <p className="text-sm text-muted-foreground">Download live collection data for the selected period</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  disabled={exporting}
                  iconName={exporting ? 'Loader2' : 'Download'}
                  iconPosition="left"
                >
                  {exporting ? 'Exporting...' : 'Download CSV'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  iconName="Printer"
                  iconPosition="left"
                >
                  Print Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
