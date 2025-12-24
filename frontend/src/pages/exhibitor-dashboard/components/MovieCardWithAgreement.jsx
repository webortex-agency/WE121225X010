import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MovieCardWithAgreement = ({ assignment, onAcceptAgreement }) => {
    const navigate = useNavigate();
    const { movie_id, agreement_accepted } = assignment;
    const movie = movie_id;

    const handleViewDetails = () => {
        navigate(`/exhibitor/movie/${movie._id}`);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div
            className={`bg-card rounded-lg shadow-md overflow-hidden transition-all duration-300 border border-border ${agreement_accepted ? 'hover:shadow-xl' : 'opacity-75'
                }`}
        >
            {/* Movie Poster/Image */}
            <div className={`h-48 bg-gradient-to-br from-primary to-accent relative ${!agreement_accepted && 'opacity-50'}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="movie" className="w-20 h-20 text-white opacity-50" />
                </div>
                {!agreement_accepted && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Icon name="lock" className="w-3 h-3" />
                        Locked
                    </div>
                )}
                {agreement_accepted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Icon name="check_circle" className="w-3 h-3" />
                        Active
                    </div>
                )}
            </div>

            {/* Movie Details */}
            <div className="p-5">
                <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">
                    {movie?.title || 'Untitled Movie'}
                </h3>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon name="calendar_today" className="w-4 h-4" />
                        <span>Release: {movie?.release_date ? formatDate(movie.release_date) : 'TBA'}</span>
                    </div>
                    {movie?.genre && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon name="category" className="w-4 h-4" />
                            <span>{movie.genre}</span>
                        </div>
                    )}
                </div>

                {movie?.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {movie.description}
                    </p>
                )}

                {/* Status and Action */}
                <div className="border-t border-border pt-4">
                    {!agreement_accepted ? (
                        <>
                            <div className="flex items-center gap-2 mb-3 text-yellow-600">
                                <Icon name="warning" className="w-5 h-5" />
                                <span className="text-sm font-medium">Agreement Required</span>
                            </div>
                            <Button
                                onClick={() => onAcceptAgreement(assignment)}
                                className="w-full bg-primary hover:bg-primary/90 text-white"
                            >
                                <Icon name="description" className="w-4 h-4 mr-2" />
                                Accept Agreement
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-3 text-green-600">
                                <Icon name="check_circle" className="w-5 h-5" />
                                <span className="text-sm font-medium">Agreement Accepted</span>
                            </div>
                            <Button
                                onClick={handleViewDetails}
                                className="w-full bg-primary hover:bg-primary/90 text-white"
                            >
                                View Details
                                <Icon name="arrow_forward" className="w-4 h-4 ml-2" />
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieCardWithAgreement;
