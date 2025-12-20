import { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  iconColor = 'bg-primary', 
  loading = false,
  onClick,
  className = ''
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      case 'link':
        return 'text-primary hover:text-primary/80';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      case 'warning':
        return 'AlertTriangle';
      case 'link':
        return 'ExternalLink';
      default:
        return null;
    }
  };

  const cardContent = (
    <div 
      className={`bg-card border border-border rounded-lg p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/20' : ''
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </h3>
          {loading ? (
            <div className="flex items-center gap-2">
              <Icon name="Loader2" size={16} className="animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-foreground">
              {value}
            </p>
          )}
        </div>
        
        <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center transition-transform duration-200 ${
          isHovered && onClick ? 'scale-110' : ''
        }`}>
          <Icon name={icon} size={24} className="text-white" />
        </div>
      </div>

      {change && (
        <div className="flex items-center gap-2">
          {getChangeIcon(changeType) && (
            <Icon 
              name={getChangeIcon(changeType)} 
              size={14} 
              className={getChangeColor(changeType)} 
            />
          )}
          <span className={`text-sm font-medium ${getChangeColor(changeType)}`}>
            {change}
          </span>
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {cardContent}
      </button>
    );
  }

  return cardContent;
};

export default MetricCard;
