import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecentCollectionsTable = ({ collections, onApprove, onReject, onView }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-warning/10 text-warning', icon: 'Clock', label: 'Pending' },
      approved: { color: 'bg-success/10 text-success', icon: 'CheckCircle2', label: 'Approved' },
      rejected: { color: 'bg-error/10 text-error', icon: 'XCircle', label: 'Rejected' },
    };

    const config = statusConfig?.[status] || statusConfig?.pending;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        <Icon name={config?.icon} size={12} />
        {config?.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedCollections = [...collections]?.sort((a, b) => {
    if (sortConfig?.key === 'amount') {
      return sortConfig?.direction === 'asc' ? a?.amount - b?.amount : b?.amount - a?.amount;
    }
    if (sortConfig?.key === 'date') {
      return sortConfig?.direction === 'asc'
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    return 0;
  });

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Collection Submissions</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest submissions requiring review</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Collection ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Theater
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                Movie
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  Date
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th
                className="px-6 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider cursor-pointer hover:bg-muted"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end gap-1">
                  Amount
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedCollections?.map((collection) => (
              <tr key={collection?.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-foreground font-data">{collection?.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-foreground">{collection?.theater}</div>
                  <div className="text-xs text-muted-foreground">{collection?.location}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-foreground">{collection?.movie}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-foreground">{formatDate(collection?.date)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="text-sm font-semibold text-foreground font-data">
                    {formatCurrency(collection?.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">{getStatusBadge(collection?.status)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => onView(collection?.id)}>
                      <Icon name="Eye" size={16} />
                    </Button>
                    {collection?.status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => onApprove(collection?.id)}
                        >
                          <Icon name="Check" size={16} />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => onReject(collection?.id)}
                        >
                          <Icon name="X" size={16} />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sortedCollections?.length} of {sortedCollections?.length} submissions
          </p>
          <Button variant="outline" size="sm">
            View All Collections
            <Icon name="ArrowRight" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecentCollectionsTable;