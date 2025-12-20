import { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const MovieCard = ({ movie, onEdit, onViewCollections }) => {
  const [imageError, setImageError] = useState(false);

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
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Movie Poster */}
      <div className="relative h-64 bg-muted flex items-center justify-center">
        {movie.posterUrl && !imageError ? (
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <Icon name="Film" size={48} className="mb-2 opacity-50" />
            <span className="text-sm">No poster available</span>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(movie.status)}`}>
            {movie.status.charAt(0).toUpperCase() + movie.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Movie Details */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-2">
            {movie.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Released: {new Date(movie.releaseDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mb-3">
          {movie.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
            >
              {genre}
            </span>
          ))}
          {movie.genres.length > 3 && (
            <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
              +{movie.genres.length - 3} more
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <p className="text-muted-foreground">Budget</p>
            <p className="font-medium text-foreground">{formatCurrency(movie.budget)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-medium text-foreground">{movie.duration} min</p>
          </div>
          <div>
            <p className="text-muted-foreground">Exhibitors</p>
            <p className="font-medium text-foreground flex items-center gap-1">
              <Icon name="Building2" size={14} />
              {movie.exhibitorCount}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Collections</p>
            <p className="font-medium text-foreground">{formatCurrency(movie.totalCollections)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(movie)}
            iconName="Edit"
            iconPosition="left"
            className="flex-1"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewCollections(movie.id)}
            iconName="BarChart3"
            iconPosition="left"
            className="flex-1"
          >
            Collections
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
