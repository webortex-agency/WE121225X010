import MetricCard from '../../../components/shared/MetricCard';

const KPIMetrics = ({ metrics, loading = false }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const kpiCards = [
    {
      id: 'totalRevenue',
      title: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue || 0),
      change: '+15% vs last period',
      changeType: 'positive',
      icon: 'DollarSign',
      iconColor: 'bg-green-600'
    },
    {
      id: 'totalCollections',
      title: 'Total Collections Submitted',
      value: metrics.totalCollections || 0,
      change: `Pending: ${Math.floor((metrics.totalCollections || 0) * 0.3)}, Approved: ${Math.floor((metrics.totalCollections || 0) * 0.6)}, Rejected: ${Math.floor((metrics.totalCollections || 0) * 0.1)}`,
      changeType: 'neutral',
      icon: 'Package',
      iconColor: 'bg-blue-600'
    },
    {
      id: 'activeMovies',
      title: 'Active Movies',
      value: metrics.activeMovies || 0,
      change: `Avg collections: ${formatCurrency((metrics.totalRevenue || 0) / Math.max(metrics.activeMovies || 1, 1))}`,
      changeType: 'neutral',
      icon: 'Film',
      iconColor: 'bg-purple-600'
    },
    {
      id: 'activeExhibitors',
      title: 'Active Exhibitors',
      value: metrics.activeExhibitors || 0,
      change: `Avg collections: ${formatCurrency((metrics.totalRevenue || 0) / Math.max(metrics.activeExhibitors || 1, 1))}`,
      changeType: 'neutral',
      icon: 'Building2',
      iconColor: 'bg-indigo-600'
    },
    {
      id: 'approvalRate',
      title: 'Approval Rate',
      value: `${metrics.approvalRate || 0}%`,
      change: 'Out of total submissions',
      changeType: metrics.approvalRate >= 80 ? 'positive' : metrics.approvalRate >= 60 ? 'warning' : 'negative',
      icon: 'CheckCircle',
      iconColor: 'bg-emerald-600'
    },
    {
      id: 'avgCollectionValue',
      title: 'Avg Collection Value',
      value: formatCurrency(metrics.avgCollectionValue || 0),
      change: '+8% vs last period',
      changeType: 'positive',
      icon: 'TrendingUp',
      iconColor: 'bg-primary'
    }
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-2">Key Performance Indicators</h2>
        <p className="text-sm text-muted-foreground">
          Overview of critical business metrics and performance indicators
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card) => (
          <MetricCard
            key={card.id}
            title={card.title}
            value={card.value}
            change={card.change}
            changeType={card.changeType}
            icon={card.icon}
            iconColor={card.iconColor}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
};

export default KPIMetrics;
