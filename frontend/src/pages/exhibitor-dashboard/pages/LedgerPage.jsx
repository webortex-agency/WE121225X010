import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectApprovedSubmissions, selectTotalCollectionsThisMonth } from '../../../store/exhibitorCollectionsSlice';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const LedgerPage = () => {
  const approvedSubmissions = useSelector(selectApprovedSubmissions);
  const totalCollectionsThisMonth = useSelector(selectTotalCollectionsThisMonth);
  
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Mock financial data - in real app this would come from backend
  const mockTransactions = [
    {
      id: 'txn_001',
      date: '2025-01-15',
      type: 'collection',
      description: 'Movie Collections - Week 3',
      amount: 125000,
      status: 'settled',
      reference: 'COL_W3_2025'
    },
    {
      id: 'txn_002',
      date: '2025-01-08',
      type: 'collection',
      description: 'Movie Collections - Week 2',
      amount: 98500,
      status: 'settled',
      reference: 'COL_W2_2025'
    },
    {
      id: 'txn_003',
      date: '2025-01-01',
      type: 'collection',
      description: 'Movie Collections - Week 1',
      amount: 87300,
      status: 'pending',
      reference: 'COL_W1_2025'
    },
    {
      id: 'txn_004',
      date: '2024-12-25',
      type: 'adjustment',
      description: 'Year-end Adjustment',
      amount: -2500,
      status: 'settled',
      reference: 'ADJ_YE_2024'
    }
  ];

  useEffect(() => {
    // Filter transactions based on date range
    const filtered = mockTransactions.filter(txn => {
      const txnDate = new Date(txn.date);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return txnDate >= start && txnDate <= end;
    });
    setFilteredTransactions(filtered);
  }, [dateRange]);

  const totalAmount = filteredTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  const settledAmount = filteredTransactions
    .filter(txn => txn.status === 'settled')
    .reduce((sum, txn) => sum + txn.amount, 0);
  const pendingAmount = filteredTransactions
    .filter(txn => txn.status === 'pending')
    .reduce((sum, txn) => sum + txn.amount, 0);

  const handleExportLedger = () => {
    // Mock export functionality
    const csvContent = [
      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Reference'],
      ...filteredTransactions.map(txn => [
        txn.date,
        txn.type,
        txn.description,
        txn.amount,
        txn.status,
        txn.reference
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="exhibitor" />
      
      <div className="container mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
              <Icon name="BookOpen" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Financial Ledger</h1>
              <p className="text-muted-foreground">Track your collections, payments, and financial history</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Icon name="CheckCircle" size={24} className="text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{settledAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Settled</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Icon name="Clock" size={24} className="text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{pendingAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Icon name="Calendar" size={24} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    ₹{totalCollectionsThisMonth.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-foreground">Transaction History</h2>
              
              <div className="flex items-center gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">From</label>
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-40"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">To</label>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-40"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleExportLedger}>
                <Icon name="Download" size={16} className="mr-2" />
                Export CSV
              </Button>
              
              <Button variant="outline">
                <Icon name="Printer" size={16} className="mr-2" />
                Print Report
              </Button>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Description</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-foreground">Amount</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-foreground">Reference</th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium text-foreground mb-2">No Transactions Found</h3>
                      <p className="text-muted-foreground">
                        No transactions found for the selected date range
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Schedule */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Payments</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <h3 className="font-medium text-foreground">Weekly Settlement</h3>
                <p className="text-sm text-muted-foreground">Next payment scheduled for January 22, 2025</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">₹45,200</div>
                <div className="text-sm text-muted-foreground">Estimated</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <h3 className="font-medium text-foreground">Monthly Bonus</h3>
                <p className="text-sm text-muted-foreground">Performance bonus for January 2025</p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">₹12,500</div>
                <div className="text-sm text-muted-foreground">Projected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TransactionRow = ({ transaction }) => {
  const getStatusColor = (status) => {
    const colors = {
      'settled': 'bg-green-100 text-green-800 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'failed': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || colors.pending;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'collection': 'TrendingUp',
      'adjustment': 'RefreshCw',
      'bonus': 'Gift',
      'deduction': 'TrendingDown',
    };
    return icons[type] || 'FileText';
  };

  const getTypeColor = (type) => {
    const colors = {
      'collection': 'text-green-600',
      'adjustment': 'text-blue-600',
      'bonus': 'text-purple-600',
      'deduction': 'text-red-600',
    };
    return colors[type] || 'text-gray-600';
  };

  return (
    <tr className="hover:bg-muted/10">
      <td className="px-6 py-4 text-sm text-foreground">
        {formatDate(transaction.date)}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon name={getTypeIcon(transaction.type)} size={16} className={getTypeColor(transaction.type)} />
          <span className="text-sm font-medium text-foreground capitalize">
            {transaction.type}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-foreground">
        {transaction.description}
      </td>
      <td className="px-6 py-4 text-right">
        <span className={`text-sm font-semibold ${
          transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.amount >= 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-muted-foreground font-mono">
        {transaction.reference}
      </td>
      <td className="px-6 py-4 text-center">
        <Button variant="outline" size="sm">
          <Icon name="Eye" size={14} className="mr-1" />
          View
        </Button>
      </td>
    </tr>
  );
};

// Helper function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default LedgerPage;
