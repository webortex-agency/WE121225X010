import { useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell, Tooltip as PieTooltip, Legend as PieLegend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import Icon from '../../../components/AppIcon';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCurrency = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

// ── Sub-charts ────────────────────────────────────────────────────────────────

const RevenueTrendChart = ({ data }) => {
  if (!data?.length) return <Empty message="No revenue trend data available." />;
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    amount: d.amount,
  }));
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Daily Collection Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} />
          <Tooltip formatter={(v) => [formatCurrency(v), 'Collections']} />
          <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const TopMoviesChart = ({ data }) => {
  if (!data?.length) return <Empty message="No movie data available." />;
  const chartData = data.slice(0, 10).map((m) => ({ name: m.name, amount: m.amount, collections: m.collections }));
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Top 10 Movies by Collections</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={90} />
          <Tooltip formatter={(v) => [formatCurrency(v), 'Collections']} />
          <Bar dataKey="amount" fill="#22c55e" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const TopExhibitorsChart = ({ data }) => {
  if (!data?.length) return <Empty message="No exhibitor data available." />;
  const chartData = data.slice(0, 10).map((e) => ({ name: e.name, amount: e.amount, collections: e.collections }));
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Top 10 Exhibitors by Collections</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={120} />
          <Tooltip formatter={(v) => [formatCurrency(v), 'Collections']} />
          <Bar dataKey="amount" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatusPieChart = ({ data }) => {
  if (!data?.length) return <Empty message="No status distribution data." />;
  // Filter out zero-count items — Recharts generates invalid SVG arcs for 0-value slices
  const validData = data.filter(d => d.count > 0);
  if (!validData.length) return <Empty message="No collections recorded yet." />;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Collection Status Distribution</h3>
      <div className="flex flex-col lg:flex-row items-center gap-8">
        <ResponsiveContainer width={280} height={280}>
          <PieChart>
            <Pie data={validData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ percentage }) => `${percentage}%`}>
              {validData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <PieTooltip formatter={(v, name) => [v, name]} />
            <PieLegend />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-3 flex-1">
          {validData.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm font-medium text-foreground capitalize">{item.status}</span>
              </div>
              <span className="text-sm text-muted-foreground">{item.count} ({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DailySummaryTable = ({ data }) => {
  if (!data?.length) return <Empty message="No daily summary data." />;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Daily Collections Summary</h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              {['Date', 'Total', 'Avg/Theater', 'Top Movie', 'Pending', 'Approved', 'Rejected'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((day, i) => (
              <tr key={i} className="hover:bg-muted/10">
                <td className="px-4 py-3 text-foreground">
                  {new Date(day.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(day.totalCollections)}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatCurrency(day.avgPerTheater)}</td>
                <td className="px-4 py-3 text-foreground">{day.topMovie || '—'}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">{day.pending}</span></td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">{day.approved}</span></td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">{day.rejected}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RegionalTable = ({ data }) => {
  if (!data?.length) return <Empty message="No regional data available." />;
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Movie Performance by Region</h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              {['Movie', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Others'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium text-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-muted/10">
                <td className="px-4 py-3 font-medium text-foreground">{row.movie}</td>
                {['mumbai', 'delhi', 'bangalore', 'pune', 'others'].map((city) => (
                  <td key={city} className="px-4 py-3 text-muted-foreground">
                    {row[city] ? formatCurrency(row[city]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Empty = ({ message }) => (
  <div className="flex flex-col items-center py-12 gap-3">
    <Icon name="BarChart3" size={40} className="text-muted-foreground" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const AnalyticsCharts = ({ chartData = {}, loading = false }) => {
  const [activeChart, setActiveChart] = useState('revenue');

  const chartTabs = [
    { id: 'revenue', label: 'Revenue Trend', icon: 'TrendingUp' },
    { id: 'movies', label: 'Top Movies', icon: 'Film' },
    { id: 'exhibitors', label: 'Top Exhibitors', icon: 'Building2' },
    { id: 'status', label: 'Status Breakdown', icon: 'PieChart' },
    { id: 'daily', label: 'Daily Summary', icon: 'Calendar' },
    { id: 'regional', label: 'Regional', icon: 'Map' },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="Loading chart data…" />
        </div>
      );
    }
    switch (activeChart) {
      case 'revenue': return <RevenueTrendChart data={chartData.revenueTrend} />;
      case 'movies': return <TopMoviesChart data={chartData.topMovies} />;
      case 'exhibitors': return <TopExhibitorsChart data={chartData.topExhibitors} />;
      case 'status': return <StatusPieChart data={chartData.statusDistribution} />;
      case 'daily': return <DailySummaryTable data={chartData.dailySummary} />;
      case 'regional': return <RegionalTable data={chartData.moviePerformanceByRegion} />;
      default: return <RevenueTrendChart data={chartData.revenueTrend} />;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveChart(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
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

      {/* Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
};

export default AnalyticsCharts;
