import Icon from '../../../components/AppIcon';

const QuickStats = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const getStatIcon = (key) => {
    const icons = {
      totalMovies: 'Film',
      activeTheaters: 'Building2',
      totalExhibitors: 'Users',
      pendingApprovals: 'Clock',
      weeklyRevenue: 'TrendingUp',
      monthlyRevenue: 'BarChart3',
    };
    return icons?.[key] || 'Activity';
  };

  const getStatColor = (key) => {
    const colors = {
      totalMovies: 'bg-gradient-to-br from-blue-500 to-blue-600',
      activeTheaters: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      totalExhibitors: 'bg-gradient-to-br from-purple-500 to-purple-600',
      pendingApprovals: 'bg-gradient-to-br from-amber-500 to-amber-600',
      weeklyRevenue: 'bg-gradient-to-br from-green-500 to-green-600',
      monthlyRevenue: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    };
    return colors?.[key] || 'bg-gradient-to-br from-slate-500 to-slate-600';
  };

  const formatLabel = (key) => {
    const labels = {
      totalMovies: 'Total Movies',
      activeTheaters: 'Active Theaters',
      totalExhibitors: 'Total Exhibitors',
      pendingApprovals: 'Pending Approvals',
      weeklyRevenue: 'Weekly Revenue',
      monthlyRevenue: 'Monthly Revenue',
    };
    return labels?.[key] || key;
  };

  const formatValue = (key, value) => {
    if (key?.includes('Revenue') || key?.includes('revenue')) {
      return formatCurrency(value);
    }
    return value?.toLocaleString('en-IN');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Object.entries(stats)?.map(([key, value]) => (
        <div
          key={key}
          className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatColor(key)}`}>
              <Icon name={getStatIcon(key)} size={20} color="#FFFFFF" />
            </div>
          </div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {formatLabel(key)}
          </p>
          <p className="text-xl font-semibold text-foreground font-data">
            {formatValue(key, value)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;