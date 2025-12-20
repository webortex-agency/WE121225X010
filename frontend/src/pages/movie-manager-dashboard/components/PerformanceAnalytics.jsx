import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const PerformanceAnalytics = ({ analyticsData }) => {
  const [chartType, setChartType] = useState('daily');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const COLORS = ['#1E40AF', '#059669', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              <span style={{ color: entry?.color }}>{entry?.name}: </span>
              <span className="font-semibold font-data">{formatCurrency(entry?.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChartType('daily')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === 'daily' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Daily Trend
          </button>
          <button
            onClick={() => setChartType('weekly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === 'weekly' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Weekly Analysis
          </button>
          <button
            onClick={() => setChartType('theater')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              chartType === 'theater' ?'bg-primary text-primary-foreground' :'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Theater Comparison
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors">
            <Icon name="Download" size={16} />
          </button>
          <button className="px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors">
            <Icon name="Share2" size={16} />
          </button>
        </div>
      </div>
      {chartType === 'daily' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Collection Trend</h3>
          <div className="w-full h-80" aria-label="Daily Collection Trend Line Chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${(value / 100000)?.toFixed(1)}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="collection" stroke="#1E40AF" strokeWidth={2} name="Collection" dot={{ fill: '#1E40AF', r: 4 }} />
                <Line type="monotone" dataKey="occupancy" stroke="#059669" strokeWidth={2} name="Occupancy %" dot={{ fill: '#059669', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {chartType === 'weekly' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Week-over-Week Analysis (Friday-Thursday)</h3>
          <div className="w-full h-80" aria-label="Weekly Collection Bar Chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.weeklyAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${(value / 100000)?.toFixed(1)}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar dataKey="collection" fill="#1E40AF" name="Collection" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="#059669" name="Target" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {chartType === 'theater' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Theater-wise Collections</h3>
            <div className="w-full h-80" aria-label="Theater Collections Pie Chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData?.theaterComparison}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="collection"
                  >
                    {analyticsData?.theaterComparison?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Theaters</h3>
            <div className="space-y-4">
              {analyticsData?.theaterComparison?.sort((a, b) => b?.collection - a?.collection)?.slice(0, 5)?.map((theater, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{theater?.name}</div>
                        <div className="text-xs text-muted-foreground">{theater?.city}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground font-data">{formatCurrency(theater?.collection)}</div>
                      <div className="text-xs text-success">
                        <Icon name="TrendingUp" size={10} className="inline mr-1" />
                        {theater?.growth}%
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Peak Day</span>
            <Icon name="Calendar" size={16} className="text-primary" />
          </div>
          <div className="text-xl font-semibold text-foreground">{analyticsData?.insights?.peakDay}</div>
          <div className="text-xs text-muted-foreground mt-1">{formatCurrency(analyticsData?.insights?.peakDayCollection)}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Per Theater</span>
            <Icon name="Building2" size={16} className="text-accent" />
          </div>
          <div className="text-xl font-semibold text-foreground font-data">{formatCurrency(analyticsData?.insights?.avgPerTheater)}</div>
          <div className="text-xs text-muted-foreground mt-1">Daily average</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Best Show</span>
            <Icon name="Clock" size={16} className="text-success" />
          </div>
          <div className="text-xl font-semibold text-foreground">{analyticsData?.insights?.bestShow}</div>
          <div className="text-xs text-muted-foreground mt-1">{analyticsData?.insights?.bestShowOccupancy}% occupancy</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Growth Rate</span>
            <Icon name="TrendingUp" size={16} className="text-warning" />
          </div>
          <div className="text-xl font-semibold text-foreground">{analyticsData?.insights?.growthRate}%</div>
          <div className="text-xs text-success mt-1">
            <Icon name="ArrowUp" size={10} className="inline mr-1" />
            Week-over-week
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;