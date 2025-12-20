import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, change, changeType, icon, iconColor, loading = false }) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-error';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
          ) : (
            <h3 className="text-3xl font-semibold text-foreground font-data">
              {value}
            </h3>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon name={icon} size={24} color="#FFFFFF" />
        </div>
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-sm font-medium ${getChangeColor()}`}>
          <Icon name={getChangeIcon()} size={14} />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;