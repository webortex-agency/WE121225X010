import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const LedgerSummary = ({ ledgerData }) => {
  const [selectedTheater, setSelectedTheater] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const getFilteredData = () => {
    if (selectedTheater === 'all') return ledgerData?.entries;
    return ledgerData?.entries?.filter(entry => entry?.theaterName === selectedTheater);
  };

  const uniqueTheaters = [...new Set(ledgerData.entries.map(entry => entry.theaterName))];

  const calculateRunningBalance = (entries) => {
    let balance = 0;
    return entries?.map(entry => {
      if (entry?.type === 'Credit') {
        balance += entry?.amount;
      } else {
        balance -= entry?.amount;
      }
      return { ...entry, runningBalance: balance };
    });
  };

  const entriesWithBalance = calculateRunningBalance(getFilteredData());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Credits</span>
            <Icon name="ArrowDownCircle" size={16} className="text-success" />
          </div>
          <div className="text-2xl font-semibold text-success font-data">{formatCurrency(ledgerData?.summary?.totalCredits)}</div>
          <div className="text-xs text-muted-foreground mt-1">{ledgerData?.summary?.creditCount} transactions</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Debits</span>
            <Icon name="ArrowUpCircle" size={16} className="text-error" />
          </div>
          <div className="text-2xl font-semibold text-error font-data">{formatCurrency(ledgerData?.summary?.totalDebits)}</div>
          <div className="text-xs text-muted-foreground mt-1">{ledgerData?.summary?.debitCount} transactions</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Net Balance</span>
            <Icon name="Wallet" size={16} className="text-primary" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-data">{formatCurrency(ledgerData?.summary?.netBalance)}</div>
          <div className="text-xs text-muted-foreground mt-1">Current balance</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending Settlements</span>
            <Icon name="Clock" size={16} className="text-warning" />
          </div>
          <div className="text-2xl font-semibold text-foreground font-data">{formatCurrency(ledgerData?.summary?.pendingSettlements)}</div>
          <div className="text-xs text-muted-foreground mt-1">{ledgerData?.summary?.pendingCount} pending</div>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Ledger Entries</h3>
          <div className="flex items-center gap-3">
            <select
              value={selectedTheater}
              onChange={(e) => setSelectedTheater(e?.target?.value)}
              className="px-4 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Theaters</option>
              {uniqueTheaters?.map(theater => (
                <option key={theater} value={theater}>{theater}</option>
              ))}
            </select>
            <button className="px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors">
              <Icon name="Download" size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Theater</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">Running Balance</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entriesWithBalance?.map((entry, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{entry?.date}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Building2" size={16} className="text-muted-foreground" />
                      {entry?.theaterName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{entry?.description}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      entry?.type === 'Credit' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      <Icon name={entry?.type === 'Credit' ? 'ArrowDownCircle' : 'ArrowUpCircle'} size={12} />
                      {entry?.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-semibold text-right font-data ${
                    entry?.type === 'Credit' ? 'text-success' : 'text-error'
                  }`}>
                    {entry?.type === 'Credit' ? '+' : '-'}{formatCurrency(entry?.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground text-right font-data">
                    {formatCurrency(entry?.runningBalance)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`status-indicator ${
                      entry?.status === 'Settled' ? 'success' : 'warning'
                    }`}>
                      <Icon name={entry?.status === 'Settled' ? 'CheckCircle2' : 'Clock'} size={12} />
                      {entry?.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {entriesWithBalance?.length} entries</span>
          <div className="flex items-center gap-2">
            <span className="text-xs">Read-only access</span>
            <Icon name="Lock" size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LedgerSummary;