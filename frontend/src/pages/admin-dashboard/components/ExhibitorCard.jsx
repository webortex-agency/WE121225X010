import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ExhibitorCard = ({ exhibitor, onEdit, onDelete, onViewDetails }) => {
  const [showMoreActions, setShowMoreActions] = useState(false);

  const formatCurrency = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleMoreActions = (action) => {
    setShowMoreActions(false);
    switch (action) {
      case 'credentials':
        console.log('View login credentials for:', exhibitor.exhibitorName);
        break;
      case 'password':
        console.log('Generate new password for:', exhibitor.exhibitorName);
        break;
      case 'collections':
        console.log('View collections history for:', exhibitor.exhibitorName);
        break;
      case 'toggle':
        console.log('Toggle status for:', exhibitor.exhibitorName);
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
            {exhibitor.exhibitorName}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(exhibitor.status)}`}>
            {exhibitor.status.charAt(0).toUpperCase() + exhibitor.status.slice(1)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {exhibitor.cinemaName}
        </p>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Location */}
        <div className="flex items-center gap-2">
          <Icon name="MapPin" size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground line-clamp-1">{exhibitor.location}</span>
        </div>

        {/* Contact Person */}
        <div className="flex items-center gap-2">
          <Icon name="User" size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground line-clamp-1">{exhibitor.contactPerson}</span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2">
          <Icon name="Mail" size={14} className="text-muted-foreground flex-shrink-0" />
          <a 
            href={`mailto:${exhibitor.email}`}
            className="text-sm text-primary hover:text-primary/80 line-clamp-1"
          >
            {exhibitor.email}
          </a>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2">
          <Icon name="Phone" size={14} className="text-muted-foreground flex-shrink-0" />
          <a 
            href={`tel:${exhibitor.phone}`}
            className="text-sm text-primary hover:text-primary/80"
          >
            {exhibitor.phone}
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Active Movies</p>
            <p className="text-sm font-medium text-foreground flex items-center gap-1">
              <Icon name="Film" size={12} />
              {exhibitor.activeMovies}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Collections</p>
            <p className="text-sm font-medium text-foreground">
              {formatCurrency(exhibitor.totalCollections)}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(exhibitor.id)}
            iconName="Eye"
            className="flex-1"
          >
            Details
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(exhibitor)}
            iconName="Edit"
            className="flex-1"
          >
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(exhibitor)}
            iconName="Trash2"
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>

          {/* More Actions Dropdown */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMoreActions(!showMoreActions)}
              iconName="MoreVertical"
            />
            
            {showMoreActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleMoreActions('credentials')}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Icon name="Key" size={14} />
                    View Login Credentials
                  </button>
                  <button
                    onClick={() => handleMoreActions('password')}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Icon name="RefreshCw" size={14} />
                    Generate New Password
                  </button>
                  <button
                    onClick={() => handleMoreActions('collections')}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Icon name="BarChart3" size={14} />
                    View Collections History
                  </button>
                  <button
                    onClick={() => handleMoreActions('toggle')}
                    className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted flex items-center gap-2"
                  >
                    <Icon name="ToggleLeft" size={14} />
                    {exhibitor.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showMoreActions && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMoreActions(false)}
        />
      )}
    </div>
  );
};

export default ExhibitorCard;
