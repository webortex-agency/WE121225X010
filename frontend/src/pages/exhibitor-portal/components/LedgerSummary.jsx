import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LedgerSummary = ({ ledgerData, onViewDetails }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const periods = [
    { value: 'current', label: 'Current Week' },
    { value: 'last', label: 'Last Week' },
    { value: 'month', label: 'This Month' }
  ];

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'text-success';
    if (balance < 0) return 'text-error';
    return 'text-muted-foreground';
  };

  const recentTransactions = ledgerData?.recentTransactions || [];

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Icon name="BookOpen" size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Ledger Summary</h2>
              <p className="text-sm text-muted-foreground">Financial account overview</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            <Icon name="ExternalLink" size={16} className="mr-2" />
            View Full Ledger
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {periods?.map((period) => (
            <button
              key={period?.value}
              onClick={() => setSelectedPeriod(period?.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                selectedPeriod === period?.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {period?.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Credits
              </span>
              <Icon name="TrendingUp" size={16} className="text-success" />
            </div>
            <p className="text-2xl font-semibold text-success font-data">
              {formatCurrency(ledgerData?.totalCredits)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ledgerData?.creditCount} transactions
            </p>
          </div>

          <div className="bg-error/5 border border-error/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Debits
              </span>
              <Icon name="TrendingDown" size={16} className="text-error" />
            </div>
            <p className="text-2xl font-semibold text-error font-data">
              {formatCurrency(ledgerData?.totalDebits)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {ledgerData?.debitCount} transactions
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Current Balance
              </span>
              <Icon name="Wallet" size={16} className="text-primary" />
            </div>
            <p className={`text-2xl font-semibold font-data ${getBalanceColor(ledgerData?.currentBalance)}`}>
              {formatCurrency(ledgerData?.currentBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              As of {new Date()?.toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
            <span className="text-xs text-muted-foreground">Last 5 entries</span>
          </div>

          {recentTransactions?.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 rounded-lg">
              <Icon name="FileText" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions?.map((transaction) => (
                <div
                  key={transaction?.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction?.type === 'credit' ?'bg-success/10' :'bg-error/10'
                    }`}>
                      <Icon 
                        name={transaction?.type === 'credit' ? 'ArrowDownLeft' : 'ArrowUpRight'} 
                        size={16} 
                        className={transaction?.type === 'credit' ? 'text-success' : 'text-error'}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {transaction?.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date)?.toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold font-data ${
                      transaction?.type === 'credit' ? 'text-success' : 'text-error'
                    }`}>
                      {transaction?.type === 'credit' ? '+' : '-'}
                      {formatCurrency(transaction?.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bal: {formatCurrency(transaction?.runningBalance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LedgerSummary;