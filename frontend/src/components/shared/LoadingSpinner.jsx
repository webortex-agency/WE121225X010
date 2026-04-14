import Icon from '../AppIcon';

/**
 * Shared loading spinner.
 * Usage: <LoadingSpinner size={24} /> or <LoadingSpinner size={16} className="text-primary" />
 */
const LoadingSpinner = ({ size = 24, className = 'text-primary', label = 'Loading…' }) => (
  <span className={`inline-flex items-center gap-2 ${className}`} aria-label={label}>
    <Icon name="Loader2" size={size} className="animate-spin" />
    {label && <span className="text-sm text-muted-foreground">{label}</span>}
  </span>
);

export default LoadingSpinner;
