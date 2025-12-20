import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AnalyticsCharts = ({ chartData, period, loading = false }) => {
  const [activeChart, setActiveChart] = useState('revenue');

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const chartTabs = [
    { id: 'revenue', label: 'Revenue Trend', icon: 'TrendingUp' },
    { id: 'movies', label: 'Top Movies', icon: 'Film' },
    { id: 'exhibitors', label: 'Top Exhibitors', icon: 'Building2' },
    { id: 'status', label: 'Collection Status', icon: 'PieChart' },
    { id: 'daily', label: 'Daily Summary', icon: 'Calendar' },
    { id: 'regional', label: 'Regional Performance', icon: 'Map' }
  ];

  const renderRevenueTrend = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Daily Collection Amounts</h3>
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="space-y-3">
          {chartData.revenueTrend?.slice(0, 10).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {new Date(item.date).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short' 
                })}
              </span>
              <div className="flex items-center gap-3 flex-1 mx-4">
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 transition-all duration-500"
                    style={{ 
                      width: `${(item.amount / Math.max(...chartData.revenueTrend.map(d => d.amount))) * 100}%` 
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-foreground min-w-[80px] text-right">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTopMovies = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Top 10 Performing Movies</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartData.topMovies?.slice(0, 10).map((movie, index) => (
          <div key={index} className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index < 3 ? 'bg-yellow-500' : 'bg-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <h4 className="font-medium text-foreground">{movie.name}</h4>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Collections:</span>
                <span className="font-medium text-foreground">{formatCurrency(movie.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submissions:</span>
                <span className="font-medium text-foreground">{movie.collections}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTopExhibitors = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Top 10 Performing Exhibitors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartData.topExhibitors?.slice(0, 10).map((exhibitor, index) => (
          <div key={index} className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  index < 3 ? 'bg-green-500' : 'bg-muted-foreground'
                }`}>
                  {index + 1}
                </span>
                <h4 className="font-medium text-foreground">{exhibitor.name}</h4>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Collections:</span>
                <span className="font-medium text-foreground">{formatCurrency(exhibitor.amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submissions:</span>
                <span className="font-medium text-foreground">{exhibitor.collections}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStatusDistribution = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Collection Status Distribution</h3>
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="space-y-4">
          {chartData.statusDistribution?.map((status, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm font-medium text-foreground">{status.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{status.count} items</span>
                  <span className="text-sm font-medium text-foreground">{status.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: status.color,
                    width: `${status.percentage}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDailySummary = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Daily Collections Summary</h3>
      <div className="bg-muted/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Date</th>
                <th className="text-left p-4 font-medium text-foreground">Total Collections</th>
                <th className="text-left p-4 font-medium text-foreground">Avg per Theater</th>
                <th className="text-left p-4 font-medium text-foreground">Top Movie</th>
                <th className="text-left p-4 font-medium text-foreground">Status Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {chartData.dailySummary?.map((day, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="p-4 text-sm text-foreground">
                    {new Date(day.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-4 text-sm font-medium text-foreground">
                    {formatCurrency(day.totalCollections)}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {formatCurrency(day.avgPerTheater)}
                  </td>
                  <td className="p-4 text-sm text-foreground">{day.topMovie}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                        P: {day.pending}
                      </span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        A: {day.approved}
                      </span>
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                        R: {day.rejected}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRegionalPerformance = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Movie Performance by Region</h3>
      <div className="bg-muted/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">Movie</th>
                <th className="text-left p-4 font-medium text-foreground">Mumbai</th>
                <th className="text-left p-4 font-medium text-foreground">Delhi</th>
                <th className="text-left p-4 font-medium text-foreground">Bangalore</th>
                <th className="text-left p-4 font-medium text-foreground">Pune</th>
                <th className="text-left p-4 font-medium text-foreground">Others</th>
              </tr>
            </thead>
            <tbody>
              {chartData.moviePerformanceByRegion?.map((movie, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                  <td className="p-4 text-sm font-medium text-foreground">{movie.movie}</td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {movie.mumbai ? formatCurrency(movie.mumbai) : '-'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {movie.delhi ? formatCurrency(movie.delhi) : '-'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {movie.bangalore ? formatCurrency(movie.bangalore) : '-'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {movie.pune ? formatCurrency(movie.pune) : '-'}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {movie.others ? formatCurrency(movie.others) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderActiveChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin text-primary" />
        </div>
      );
    }

    switch (activeChart) {
      case 'revenue':
        return renderRevenueTrend();
      case 'movies':
        return renderTopMovies();
      case 'exhibitors':
        return renderTopExhibitors();
      case 'status':
        return renderStatusDistribution();
      case 'daily':
        return renderDailySummary();
      case 'regional':
        return renderRegionalPerformance();
      default:
        return renderRevenueTrend();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Chart Tabs */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeChart === tab.id
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

      {/* Chart Content */}
      <div className="p-6">
        {renderActiveChart()}
      </div>
    </div>
  );
};

export default AnalyticsCharts;
