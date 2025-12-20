import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CollectionsView = ({ collectionsData }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filterTheater, setFilterTheater] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig?.key === key && sortConfig?.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getSortedData = () => {
    const sorted = [...collectionsData]?.sort((a, b) => {
      if (sortConfig?.key === 'date') {
        return sortConfig?.direction === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      if (sortConfig?.key === 'total') {
        return sortConfig?.direction === 'asc' 
          ? a?.totalCollection - b?.totalCollection
          : b?.totalCollection - a?.totalCollection;
      }
      return 0;
    });

    return sorted?.filter(item => {
      const theaterMatch = filterTheater === 'all' || item?.theaterName === filterTheater;
      const statusMatch = filterStatus === 'all' || item?.status === filterStatus;
      return theaterMatch && statusMatch;
    });
  };

  const uniqueTheaters = [...new Set(collectionsData.map(item => item.theaterName))];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">Filter by Theater</label>
          <select
            value={filterTheater}
            onChange={(e) => setFilterTheater(e?.target?.value)}
            className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Theaters</option>
            {uniqueTheaters?.map(theater => (
              <option key={theater} value={theater}>{theater}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-foreground mb-2">Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e?.target?.value)}
            className="w-full px-4 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    Date
                    <Icon name={sortConfig?.key === 'date' && sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider">Theater</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">Matinee</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">Afternoon</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">First Show</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">Second Show</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">AC Charges</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('total')}
                    className="flex items-center gap-2 hover:text-primary transition-colors ml-auto"
                  >
                    Total
                    <Icon name={sortConfig?.key === 'total' && sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={14} />
                  </button>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {getSortedData()?.map((item, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-foreground whitespace-nowrap">{item?.date}</td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Building2" size={16} className="text-muted-foreground" />
                      {item?.theaterName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground text-right font-data">{formatCurrency(item?.matinee)}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right font-data">{formatCurrency(item?.afternoon)}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right font-data">{formatCurrency(item?.firstShow)}</td>
                  <td className="px-4 py-3 text-sm text-foreground text-right font-data">{formatCurrency(item?.secondShow)}</td>
                  <td className="px-4 py-3 text-sm text-error text-right font-data">-{formatCurrency(item?.acCharges)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground text-right font-data">{formatCurrency(item?.totalCollection)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`status-indicator ${
                      item?.status === 'Approved' ? 'success' : 
                      item?.status === 'Pending' ? 'warning' : 'error'
                    }`}>
                      <Icon name={
                        item?.status === 'Approved' ? 'CheckCircle2' : 
                        item?.status === 'Pending' ? 'Clock' : 'XCircle'
                      } size={12} />
                      {item?.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {getSortedData()?.length} of {collectionsData?.length} collections</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded-md border border-border hover:bg-muted transition-colors">
            <Icon name="Download" size={14} className="inline mr-1" />
            Export Excel
          </button>
          <button className="px-3 py-1 rounded-md border border-border hover:bg-muted transition-colors">
            <Icon name="FileText" size={14} className="inline mr-1" />
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionsView;