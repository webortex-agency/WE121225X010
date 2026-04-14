import { useState, useEffect } from 'react';
import { getMyLedger } from '../../../utils/api';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { getStatusBadge } from '../../../utils/statusBadge';

const LedgerPage = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyLedger();
        // Backend may return { entries: [] } or an array
        setLedger(Array.isArray(data) ? data : (data.entries || data.collections || []));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredEntries = ledger.filter((entry) => {
    const d = new Date(entry.date);
    return d >= new Date(dateRange.startDate) && d <= new Date(dateRange.endDate);
  });

  const totalAmount = filteredEntries.reduce((s, e) => s + (e.net_collection || e.totals?.collection || 0), 0);
  const settledAmount = filteredEntries
    .filter((e) => e.status === 'approved')
    .reduce((s, e) => s + (e.net_collection || e.totals?.collection || 0), 0);
  const pendingAmount = filteredEntries
    .filter((e) => e.status !== 'approved')
    .reduce((s, e) => s + (e.net_collection || e.totals?.collection || 0), 0);

  const thisMonth = ledger
    .filter((e) => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, e) => s + (e.net_collection || e.totals?.collection || 0), 0);

  const handleExport = () => {
    const rows = [
      ['Date', 'Movie', 'Theater', 'Gross', 'Net', 'Status'],
      ...filteredEntries.map((e) => [
        e.date?.split('T')[0],
        e.movie_id,
        e.theater_name,
        e.totals?.collection || 0,
        e.net_collection || 0,
        e.status,
      ]),
    ]
      .map((r) => r.join(','))
      .join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="exhibitor" />

      <div className="container mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="BookOpen" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Financial Ledger</h1>
              <p className="text-muted-foreground">Track your collections, payments, and financial history</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Amount', value: totalAmount, icon: 'TrendingUp', color: 'text-primary' },
              { label: 'Approved', value: settledAmount, icon: 'CheckCircle', color: 'text-green-600' },
              { label: 'Pending', value: pendingAmount, icon: 'Clock', color: 'text-yellow-600' },
              { label: 'This Month', value: thisMonth, icon: 'Calendar', color: 'text-accent-foreground' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                    <Icon name={icon} size={24} className={color} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      ₹{value.toLocaleString('en-IN')}
                    </div>
                    <div className="text-sm text-muted-foreground">{label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <h2 className="text-lg font-semibold text-foreground">Collection History</h2>
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">From</label>
                  <Input type="date" value={dateRange.startDate}
                    onChange={(e) => setDateRange((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-40" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">To</label>
                  <Input type="date" value={dateRange.endDate}
                    onChange={(e) => setDateRange((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-40" />
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={filteredEntries.length === 0}>
              <Icon name="Download" size={16} className="mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner label="Loading ledger…" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Icon name="AlertCircle" size={40} className="text-destructive" />
              <p className="text-destructive font-medium">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Movie</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Theater</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-foreground">Gross</th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-foreground">Net</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium text-foreground mb-2">No Entries Found</h3>
                        <p className="text-muted-foreground">No collection data for the selected date range.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr key={entry._id || entry.id} className="hover:bg-muted/10">
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-foreground">{entry.movie_id || '—'}</td>
                        <td className="px-6 py-4 text-sm text-foreground">{entry.theater_name || '—'}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-foreground">
                          ₹{(entry.totals?.collection || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">
                          ₹{(entry.net_collection || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(entry.status)}`}>
                            {entry.status ? entry.status.charAt(0).toUpperCase() + entry.status.slice(1) : '—'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerPage;
