import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectFilteredMovies, 
  selectSearchFilter, 
  setSearchFilter,
  selectMoviesLoading 
} from '../../../store/exhibitorMoviesSlice';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MovieListSidebar = () => {
  const dispatch = useDispatch();
  const movies = useSelector(selectFilteredMovies);
  const searchFilter = useSelector(selectSearchFilter);
  const loading = useSelector(selectMoviesLoading);
  const [draggedMovie, setDraggedMovie] = useState(null);

  const handleSearchChange = (e) => {
    dispatch(setSearchFilter(e.target.value));
  };

  const handleDragStart = (e, movie) => {
    setDraggedMovie(movie);
    e.dataTransfer.setData('application/json', JSON.stringify(movie));
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedMovie(null);
  };

  const activeMovies = useMemo(() => 
    movies.filter(movie => movie.status === 'active'), 
    [movies]
  );

  const upcomingMovies = useMemo(() => 
    movies.filter(movie => movie.status === 'upcoming'), 
    [movies]
  );

  if (loading) {
    return (
      <div className="w-80 bg-card border-r border-border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-r border-border flex flex-col tour-movie-sidebar">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
            <Icon name="Film" size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Assigned Movies</h2>
            <p className="text-sm text-muted-foreground">Drag to schedule shows</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchFilter}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Movie Lists */}
      <div className="flex-1 overflow-y-auto">
        {/* Active Movies */}
        {activeMovies.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h3 className="font-medium text-foreground">Active Movies ({activeMovies.length})</h3>
            </div>
            <div className="space-y-2">
              {activeMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedMovie?.id === movie.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Movies */}
        {upcomingMovies.length > 0 && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <h3 className="font-medium text-foreground">Upcoming Movies ({upcomingMovies.length})</h3>
            </div>
            <div className="space-y-2">
              {upcomingMovies.map((movie) => (
                <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedMovie?.id === movie.id}
                  disabled={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {movies.length === 0 && (
          <div className="p-6 text-center">
            <Icon name="Film" size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">No Movies Found</h3>
            <p className="text-sm text-muted-foreground">
              {searchFilter ? 'Try adjusting your search terms' : 'No movies have been assigned to your cinema yet'}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-border tour-quick-actions">
        <h3 className="font-medium text-foreground mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => dispatch(setSearchFilter(''))}
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Clear Search
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => window.location.reload()}
          >
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Refresh Movies
          </Button>
        </div>
      </div>
    </div>
  );
};

const MovieCard = ({ movie, onDragStart, onDragEnd, isDragging, disabled = false }) => {
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getGenreColor = (genre) => {
    const colors = {
      'Action': 'bg-red-100 text-red-800 border-red-200',
      'Drama': 'bg-blue-100 text-blue-800 border-blue-200',
      'Comedy': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Horror': 'bg-purple-100 text-purple-800 border-purple-200',
      'Romance': 'bg-pink-100 text-pink-800 border-pink-200',
      'Thriller': 'bg-gray-100 text-gray-800 border-gray-200',
      'Fantasy': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Biography': 'bg-green-100 text-green-800 border-green-200',
      'Sports': 'bg-orange-100 text-orange-800 border-orange-200',
    };
    return colors[genre] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => !disabled && onDragStart(e, movie)}
      onDragEnd={onDragEnd}
      className={`
        p-3 border border-border rounded-lg bg-background transition-all duration-200
        ${!disabled ? 'cursor-grab hover:shadow-md hover:border-teal-300' : 'cursor-not-allowed opacity-60'}
        ${isDragging ? 'shadow-lg scale-105 border-teal-400' : ''}
        ${disabled ? 'bg-muted/50' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Movie Poster Placeholder */}
        <div className="w-12 h-16 bg-muted rounded flex items-center justify-center flex-shrink-0">
          {movie.posterUrl ? (
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <Icon name="Image" size={16} className="text-muted-foreground" />
          )}
        </div>

        {/* Movie Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground text-sm truncate mb-1">
            {movie.title}
          </h4>
          
          <div className="space-y-1">
            <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getGenreColor(movie.genre)}`}>
              {movie.genre}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Icon name="Globe" size={12} />
                {movie.language}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={12} />
                {formatDuration(movie.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Drag Handle */}
        {!disabled && (
          <div className="flex-shrink-0 text-muted-foreground">
            <Icon name="GripVertical" size={16} />
          </div>
        )}
      </div>

      {disabled && (
        <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
          <Icon name="Clock" size={12} />
          Coming Soon
        </div>
      )}
    </div>
  );
};

export default MovieListSidebar;
