import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const NavigationTile = ({ title, description, icon, iconColor, count, countLabel, route, badge }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-card border border-border rounded-lg p-6 text-left transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-1 relative group"
    >
      {badge && (
        <span className="absolute top-4 right-4 inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-error text-error-foreground text-xs font-semibold">
          {badge}
        </span>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${iconColor} transition-transform group-hover:scale-110`}>
          <Icon name={icon} size={28} color="#FFFFFF" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {count !== undefined && (
        <div className="flex items-baseline gap-2 pt-4 border-t border-border">
          <span className="text-2xl font-semibold text-foreground font-data">{count}</span>
          <span className="text-sm text-muted-foreground">{countLabel}</span>
        </div>
      )}

      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Icon name="ArrowRight" size={20} className="text-primary" />
      </div>
    </button>
  );
};

export default NavigationTile;