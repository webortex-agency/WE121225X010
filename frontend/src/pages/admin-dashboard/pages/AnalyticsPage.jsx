import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../../components/ui/QuickActionToolbar';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import KPIMetrics from '../components/KPIMetrics';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { selectMetrics, selectChartData, selectPeriod } from '../../../store/analyticsSlice';
import { autoInitialize } from '../../../utils/initializeMockData';

const AnalyticsPage = () => {
  const metrics = useSelector(selectMetrics);
  const chartData = useSelector(selectChartData);
  const currentPeriod = useSelector(selectPeriod);
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod || 'thisMonth');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    autoInitialize();
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const periodOptions = [
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisQuarter', label: 'This Quarter' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    // In a real app, this would dispatch an action to update analytics data
    console.log('Period changed to:', period);
  };

  const handleExportPDF = () => {
    console.log('Exporting report as PDF...');
    // Simulate PDF generation
    setTimeout(() => {
      alert('PDF report generated successfully!');
    }, 1000);
  };

  const handleExportExcel = () => {
    console.log('Exporting report as Excel...');
    // Simulate Excel generation
    setTimeout(() => {
      alert('Excel report generated successfully!');
    }, 1000);
  };

  const handleEmailReport = () => {
    console.log('Emailing report...');
    // Simulate email sending
    setTimeout(() => {
      alert('Report emailed successfully!');
    }, 1000);
  };

  const handleScheduleReport = () => {
    console.log('Opening schedule report dialog...');
    alert('Schedule report feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />
      {/* <QuickActionToolbar userRole="admin" /> */}
      
      <div className="main-content with-toolbar">
        <div className="content-container">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Analytics & Performance Dashboard</h1>
                <p className="text-muted-foreground">Comprehensive insights into collections, movies, and exhibitor performance</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Period Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Period:</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="mb-8">
            <KPIMetrics metrics={metrics} loading={loading} />
          </div>

          {/* Charts Section */}
          <div className="mb-8">
            <AnalyticsCharts 
              chartData={chartData} 
              period={selectedPeriod}
              loading={loading}
            />
          </div>

          {/* Export Options */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Export & Share</h3>
                <p className="text-sm text-muted-foreground">
                  Generate reports and share analytics with stakeholders
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  iconName="FileText"
                  iconPosition="left"
                >
                  Download PDF
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleExportExcel}
                  iconName="Download"
                  iconPosition="left"
                >
                  Download Excel
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleEmailReport}
                  iconName="Mail"
                  iconPosition="left"
                >
                  Email Report
                </Button>
                
                <Button
                  onClick={handleScheduleReport}
                  iconName="Calendar"
                  iconPosition="left"
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Schedule Report
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
