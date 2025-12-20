import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../../components/ui/QuickActionToolbar';
import SearchInterface from '../../../components/ui/SearchInterface';
import StatusIndicatorPanel from '../../../components/ui/StatusIndicatorPanel';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import MovieCard from '../components/MovieCard';
import MovieFormModal from '../components/MovieFormModal';
import { 
  selectFilteredMovies, 
  selectMoviesLoading, 
  selectMoviesFilter,
  setFilter 
} from '../../../store/moviesSlice';
import { autoInitialize } from '../../../utils/initializeMockData';

const MoviesManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const movies = useSelector(selectFilteredMovies);
  const loading = useSelector(selectMoviesLoading);
  const filter = useSelector(selectMoviesFilter);
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 9 : 10;

  // Initialize mock data
  useEffect(() => {
    autoInitialize();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(movies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = movies.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handleFilterChange = (newFilter) => {
    dispatch(setFilter(newFilter));
  };

  const handleStatusFilter = (status) => {
    handleFilterChange({ status });
  };

  const handleGenreFilter = (genres) => {
    handleFilterChange({ genre: genres });
  };

  const handleSearch = (search) => {
    handleFilterChange({ search });
  };

  const handleAddMovie = () => {
    setEditingMovie(null);
    setShowAddModal(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowAddModal(true);
  };

  const handleViewCollections = (movieId) => {
    // Navigate to collections page filtered by movie
    console.log('Viewing collections for movie:', movieId);
    // This would navigate to a collections page with movie filter
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingMovie(null);
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'upcoming', label: 'Upcoming' }
  ];

  const genreOptions = [
    'Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Horror', 
    'Adventure', 'Sci-Fi', 'Fantasy', 'Biography', 'History', 
    'Crime', 'Animation'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="admin" />
      {/* <QuickActionToolbar userRole="admin" /> */}
      
      <div className="main-content with-toolbar">
        <div className="content-container">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Movies Management</h1>
                <p className="text-muted-foreground">View, Edit, and Add Movies</p>
              </div>
              <Button
                onClick={handleAddMovie}
                iconName="Plus"
                iconPosition="left"
                className="bg-teal-600 hover:bg-teal-700"
              >
                Add New Movie
              </Button>
            </div>

            <StatusIndicatorPanel userRole="admin" />
          </div>

          {/* Filters and Controls */}
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleStatusFilter(option.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      filter.status === option.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-md p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name="Grid3X3" size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name="List" size={16} />
                  </button>
                </div>

                {/* Search */}
                <div className="w-64">
                  <SearchInterface 
                    userRole="admin"
                    placeholder="Search movies..."
                    onSearch={handleSearch}
                  />
                </div>
              </div>
            </div>

            {/* Genre Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">Genres:</span>
              {genreOptions.map((genre) => (
                <button
                  key={genre}
                  onClick={() => {
                    const newGenres = filter.genre.includes(genre)
                      ? filter.genre.filter(g => g !== genre)
                      : [...filter.genre, genre];
                    handleGenreFilter(newGenres);
                  }}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    filter.genre.includes(genre)
                      ? 'bg-teal-100 text-teal-800 border border-teal-300'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Movies Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {paginatedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onEdit={handleEditMovie}
                  onViewCollections={handleViewCollections}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-foreground">Title</th>
                      <th className="text-left p-4 font-medium text-foreground">Release Date</th>
                      <th className="text-left p-4 font-medium text-foreground">Genre</th>
                      <th className="text-left p-4 font-medium text-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-foreground">Exhibitors</th>
                      <th className="text-left p-4 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMovies.map((movie, index) => (
                      <tr key={movie.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                              {movie.posterUrl ? (
                                <img 
                                  src={movie.posterUrl} 
                                  alt={movie.title}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Icon name="Film" size={20} className="text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{movie.title}</p>
                              <p className="text-sm text-muted-foreground">₹{(movie.budget / 10000000).toFixed(1)}Cr budget</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(movie.releaseDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {movie.genres.slice(0, 2).map((genre) => (
                              <span
                                key={genre}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {genre}
                              </span>
                            ))}
                            {movie.genres.length > 2 && (
                              <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded">
                                +{movie.genres.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            movie.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : movie.status === 'upcoming'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {movie.status.charAt(0).toUpperCase() + movie.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {movie.exhibitorCount}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMovie(movie)}
                              iconName="Edit"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCollections(movie.id)}
                              iconName="BarChart3"
                            >
                              Collections
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State */}
          {paginatedMovies.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Film" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">No movies found</h3>
              <p className="text-muted-foreground mb-4">
                {movies.length === 0 
                  ? "Get started by adding your first movie"
                  : "Try adjusting your filters to see more results"
                }
              </p>
              {movies.length === 0 && (
                <Button onClick={handleAddMovie} iconName="Plus" iconPosition="left">
                  Add New Movie
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, movies.length)} of {movies.length} movies
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  iconName="ChevronLeft"
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                        currentPage === page
                          ? 'bg-teal-600 text-white'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  iconName="ChevronRight"
                  iconPosition="right"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Movie Modal */}
      {showAddModal && (
        <MovieFormModal
          movie={editingMovie}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MoviesManagement;
