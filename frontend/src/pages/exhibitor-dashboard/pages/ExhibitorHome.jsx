import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import SearchInterface from '../../../components/ui/SearchInterface';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import QuickStatsCard from '../components/QuickStatsCard';
import MovieCardWithAgreement from '../components/MovieCardWithAgreement';
import AgreementModal from '../components/AgreementModal';
import {
    fetchExhibitorAssignments,
    fetchExhibitorStats,
    acceptAgreement,
} from '../../../store/exhibitorHomeSlice';
import { selectAssignedMovies } from '../../../store/exhibitorMoviesSlice';

const ExhibitorHome = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
    const [acceptingAgreement, setAcceptingAgreement] = useState(false);
    // Static state to track accepted agreements (for prototype)
    const [acceptedAgreements, setAcceptedAgreements] = useState(new Set());

    // View and filter states
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'accepted', 'pending'
    const [searchQuery, setSearchQuery] = useState('');
    const [genreFilter, setGenreFilter] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = viewMode === 'grid' ? 9 : 10;

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const exhibitorId = user.user?.exhibitor_id;

    // Redux state - use both slices
    const { assignments, stats, loading, statsLoading, error } = useSelector(
        (state) => state.exhibitorHome
    );
    const dashboardMovies = useSelector(selectAssignedMovies);

    useEffect(() => {
        if (exhibitorId) {
            dispatch(fetchExhibitorAssignments(exhibitorId));
            dispatch(fetchExhibitorStats(exhibitorId));
        }
    }, [dispatch, exhibitorId]);

    // Merge dashboard movies with assignment data and local accepted state
    const mergedMovies = dashboardMovies.map((movie) => {
        const assignment = assignments.find(
            (a) => a.movie_id?._id === movie.id || a.movie_id?.movie_id === movie.id
        );
        // Check if agreement is accepted either from backend or local state
        const isAccepted = assignment?.agreement_accepted || acceptedAgreements.has(movie.id);

        return {
            ...movie,
            assignment: assignment,
            agreement_accepted: isAccepted,
            _id: assignment?._id || movie.id, // Use movie.id as fallback
        };
    });

    // Debug logging
    useEffect(() => {
        console.log('Dashboard Movies:', dashboardMovies);
        console.log('Assignments from API:', assignments);
        console.log('Accepted Agreements (local):', Array.from(acceptedAgreements));
        console.log('Merged Movies:', mergedMovies);
    }, [dashboardMovies, assignments, acceptedAgreements]);

    // Apply filters
    const filteredMovies = mergedMovies.filter((movie) => {
        // Status filter
        if (statusFilter === 'accepted' && !movie.agreement_accepted) return false;
        if (statusFilter === 'pending' && movie.agreement_accepted) return false;

        // Search filter
        if (searchQuery && !movie.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !movie.genre.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Genre filter
        if (genreFilter.length > 0 && !genreFilter.includes(movie.genre)) {
            return false;
        }

        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMovies = filteredMovies.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchQuery, genreFilter]);

    // Static agreement acceptance (for prototype)
    const handleAcceptAgreement = async (assignmentId) => {
        console.log('Accepting agreement for assignment/movie ID:', assignmentId);

        setAcceptingAgreement(true);

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Add to accepted agreements set
        setAcceptedAgreements(prev => new Set([...prev, assignmentId]));

        // Close modal
        setIsAgreementModalOpen(false);
        setSelectedAssignment(null);
        setAcceptingAgreement(false);

        console.log('Agreement accepted successfully (static)');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const statusOptions = [
        { value: 'all', label: 'All Movies' },
        { value: 'accepted', label: 'Agreement Accepted' },
        { value: 'pending', label: 'Pending Agreement' },
    ];

    const genreOptions = [
        'Action', 'Drama', 'Comedy', 'Thriller', 'Romance', 'Horror',
        'Adventure', 'Sci-Fi', 'Fantasy', 'Biography', 'History',
        'Crime', 'Animation'
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <RoleBasedNavigation userRole="exhibitor" />

            {/* Main Content */}
            <div className="main-content with-toolbar">
                <div className="content-container">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-foreground mb-2">Welcome Back!</h1>
                                <p className="text-muted-foreground">Your assigned movies and statistics</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <QuickStatsCard
                                icon="movie"
                                label="Active Movies"
                                value={formatNumber(stats.active_movies)}
                                loading={statsLoading}
                            />
                            <QuickStatsCard
                                icon="payments"
                                label="Yesterday's Collection"
                                value={formatCurrency(stats.previous_day_collection)}
                                loading={statsLoading}
                            />
                            <QuickStatsCard
                                icon="confirmation_number"
                                label="Tickets Sold"
                                value={formatNumber(stats.tickets_sold)}
                                loading={statsLoading}
                            />
                            <QuickStatsCard
                                icon="pending_actions"
                                label="Pending Approvals"
                                value={formatNumber(stats.pending_approvals)}
                                loading={statsLoading}
                            />
                        </div>
                    </div>

                    {/* Filters and Controls */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                            <div className="flex flex-wrap gap-2">
                                {statusOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setStatusFilter(option.value)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === option.value
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
                                        className={`p-2 rounded transition-colors ${viewMode === 'grid'
                                            ? 'bg-background text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Icon name="Grid3X3" size={16} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 rounded transition-colors ${viewMode === 'list'
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
                                        userRole="exhibitor"
                                        placeholder="Search movies..."
                                        onSearch={setSearchQuery}
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
                                        const newGenres = genreFilter.includes(genre)
                                            ? genreFilter.filter((g) => g !== genre)
                                            : [...genreFilter, genre];
                                        setGenreFilter(newGenres);
                                    }}
                                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${genreFilter.includes(genre)
                                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 text-red-800">
                                <Icon name="error" className="w-5 h-5" />
                                <p className="font-medium">Error loading data</p>
                            </div>
                            <p className="text-sm text-red-600 mt-1">{error}</p>
                        </div>
                    )}

                    {/* Movies Display */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {paginatedMovies.map((movie) => {
                                const assignmentForCard = movie.assignment || {
                                    _id: movie._id,
                                    movie_id: {
                                        _id: movie.id,
                                        title: movie.title,
                                        release_date: movie.releaseDate,
                                        genre: movie.genre,
                                        description: movie.description || `${movie.title} - ${movie.genre} movie`,
                                    },
                                    agreement_accepted: movie.agreement_accepted,
                                };

                                return (
                                    <MovieCardWithAgreement
                                        key={movie.id}
                                        assignment={assignmentForCard}
                                        onAcceptAgreement={(assignment) => {
                                            console.log('onAcceptAgreement called with:', assignment);
                                            setSelectedAssignment(assignment);
                                            setIsAgreementModalOpen(true);
                                        }}
                                    />
                                );
                            })}
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
                                            <th className="text-left p-4 font-medium text-foreground">Agreement Status</th>
                                            <th className="text-left p-4 font-medium text-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedMovies.map((movie, index) => (
                                            <tr key={movie.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-16 bg-gradient-to-br from-primary to-accent rounded flex items-center justify-center">
                                                            <Icon name="Film" size={20} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-foreground">{movie.title}</p>
                                                            <p className="text-sm text-muted-foreground">{movie.language}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground">
                                                    {formatDate(movie.releaseDate)}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                        {movie.genre}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    {movie.agreement_accepted ? (
                                                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                                                            <Icon name="check_circle" className="w-3 h-3" />
                                                            Accepted
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 flex items-center gap-1 w-fit">
                                                            <Icon name="lock" className="w-3 h-3" />
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    {movie.agreement_accepted ? (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => navigate(`/exhibitor/movie/${movie.id}`)}
                                                            iconName="Eye"
                                                        >
                                                            View Details
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const assignment = movie.assignment;
                                                                if (assignment && assignment._id) {
                                                                    console.log('List view - Accept Agreement clicked:', assignment);
                                                                    setSelectedAssignment(assignment);
                                                                    setIsAgreementModalOpen(true);
                                                                } else {
                                                                    alert('Unable to open agreement. This movie may not be properly assigned to you.');
                                                                }
                                                            }}
                                                            iconName="description"
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            Accept Agreement
                                                        </Button>
                                                    )}
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
                                {filteredMovies.length === 0
                                    ? 'No movies assigned yet. Contact the administrator.'
                                    : 'Try adjusting your filters to see more results'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredMovies.length)} of {filteredMovies.length} movies
                            </p>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                                            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${currentPage === page
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
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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

            {/* Agreement Modal */}
            <AgreementModal
                isOpen={isAgreementModalOpen}
                onClose={() => {
                    setIsAgreementModalOpen(false);
                    setSelectedAssignment(null);
                }}
                assignment={selectedAssignment}
                onAccept={handleAcceptAgreement}
                loading={acceptingAgreement}
            />
        </div>
    );
};

export default ExhibitorHome;
