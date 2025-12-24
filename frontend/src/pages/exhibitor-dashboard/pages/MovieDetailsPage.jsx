import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { selectAssignedMovies } from '../../../store/exhibitorMoviesSlice';
import ScheduleShowsModal from '../components/ScheduleShowsModal';
import SubmitCollectionsModal from '../components/SubmitCollectionsModal';

const MovieDetailsPage = () => {
    const { movieId } = useParams();
    const navigate = useNavigate();
    const assignedMovies = useSelector(selectAssignedMovies);
    const [movie, setMovie] = useState(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isCollectionsModalOpen, setIsCollectionsModalOpen] = useState(false);

    useEffect(() => {
        // Find the movie from assigned movies
        const foundMovie = assignedMovies.find(m => m.id === movieId);
        setMovie(foundMovie);
    }, [movieId, assignedMovies]);

    if (!movie) {
        return (
            <div className="min-h-screen bg-background">
                <RoleBasedNavigation userRole="exhibitor" />
                <div className="main-content with-toolbar">
                    <div className="content-container">
                        <div className="flex flex-col items-center justify-center py-20">
                            <Icon name="movie" className="w-20 h-20 text-muted-foreground mb-4" />
                            <h2 className="text-2xl font-bold text-foreground mb-2">Movie Not Found</h2>
                            <p className="text-muted-foreground mb-6">The movie you're looking for doesn't exist or you don't have access to it.</p>
                            <Button onClick={() => navigate('/exhibitor/home')} iconName="arrow_back">
                                Back to Home
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Sample scheduling data (static for prototype)
    const sampleSchedule = [
        { time: '10:00 AM', screen: 'Screen 1', seats: 150, booked: 45 },
        { time: '1:30 PM', screen: 'Screen 2', seats: 200, booked: 120 },
        { time: '4:45 PM', screen: 'Screen 1', seats: 150, booked: 89 },
        { time: '8:00 PM', screen: 'Screen 3', seats: 250, booked: 210 },
    ];

    // Sample collections data (static for prototype)
    const sampleCollections = {
        today: 125000,
        yesterday: 98000,
        thisWeek: 650000,
        total: 2450000,
        ticketsSold: 3250,
        averageOccupancy: 68,
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-background">
            <RoleBasedNavigation userRole="exhibitor" />

            <div className="main-content with-toolbar">
                <div className="content-container">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => navigate('/exhibitor/home')}
                            iconName="arrow_back"
                        >
                            Back to Movies
                        </Button>
                    </div>

                    {/* Movie Header */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Movie Poster Placeholder */}
                            <div className="w-full lg:w-64 h-96 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name="movie" className="w-32 h-32 text-white opacity-50" />
                            </div>

                            {/* Movie Info */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h1 className="text-3xl font-bold text-foreground mb-2">{movie.title}</h1>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                {movie.genre}
                                            </span>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                                                {movie.language}
                                            </span>
                                            {movie.status === 'active' && (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                                                    <Icon name="check_circle" className="w-4 h-4" />
                                                    Agreement Accepted
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Icon name="calendar_today" className="w-5 h-5" />
                                        <span className="font-medium">Release Date:</span>
                                        <span>{formatDate(movie.releaseDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Icon name="schedule" className="w-5 h-5" />
                                        <span className="font-medium">Duration:</span>
                                        <span>{movie.duration || '2h 30m'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Icon name="star" className="w-5 h-5" />
                                        <span className="font-medium">Rating:</span>
                                        <span>{movie.rating || 'U/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Icon name="language" className="w-5 h-5" />
                                        <span className="font-medium">Language:</span>
                                        <span>{movie.language}</span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Description</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {movie.description || `${movie.title} is a captivating ${movie.genre.toLowerCase()} film that promises to deliver an unforgettable cinematic experience. With stunning visuals and a compelling storyline, this movie has been highly anticipated by audiences.`}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3">
                                    <Button
                                        className="bg-primary hover:bg-primary/90 text-white"
                                        iconName="event"
                                        onClick={() => setIsScheduleModalOpen(true)}
                                    >
                                        Schedule Shows
                                    </Button>
                                    <Button
                                        variant="outline"
                                        iconName="payments"
                                        onClick={() => setIsCollectionsModalOpen(true)}
                                    >
                                        Submit Collections
                                    </Button>
                                    <Button variant="outline" iconName="download">
                                        Download Agreement
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Collections Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Collections Stats */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Icon name="payments" className="w-6 h-6 text-primary" />
                                Collections Summary
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-600 mb-1">Today's Collection</p>
                                    <p className="text-2xl font-bold text-green-900">{formatCurrency(sampleCollections.today)}</p>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-600 mb-1">Yesterday</p>
                                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(sampleCollections.yesterday)}</p>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <p className="text-sm text-purple-600 mb-1">This Week</p>
                                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(sampleCollections.thisWeek)}</p>
                                </div>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <p className="text-sm text-orange-600 mb-1">Total Collection</p>
                                    <p className="text-2xl font-bold text-orange-900">{formatCurrency(sampleCollections.total)}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-border">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-muted-foreground">Tickets Sold</span>
                                    <span className="font-semibold text-foreground">{sampleCollections.ticketsSold.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Average Occupancy</span>
                                    <span className="font-semibold text-foreground">{sampleCollections.averageOccupancy}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Performance Chart Placeholder */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Icon name="trending_up" className="w-6 h-6 text-primary" />
                                Performance Overview
                            </h2>
                            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <Icon name="bar_chart" className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">Performance chart will be displayed here</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Today's Schedule */}
                    <div className="bg-card border border-border rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                            <Icon name="event" className="w-6 h-6 text-primary" />
                            Today's Schedule
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-4 font-medium text-foreground">Show Time</th>
                                        <th className="text-left p-4 font-medium text-foreground">Screen</th>
                                        <th className="text-left p-4 font-medium text-foreground">Total Seats</th>
                                        <th className="text-left p-4 font-medium text-foreground">Booked</th>
                                        <th className="text-left p-4 font-medium text-foreground">Occupancy</th>
                                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sampleSchedule.map((show, index) => {
                                        const occupancy = Math.round((show.booked / show.seats) * 100);
                                        return (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Icon name="schedule" className="w-4 h-4 text-primary" />
                                                        <span className="font-medium text-foreground">{show.time}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-muted-foreground">{show.screen}</td>
                                                <td className="p-4 text-muted-foreground">{show.seats}</td>
                                                <td className="p-4">
                                                    <span className="font-medium text-foreground">{show.booked}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${occupancy >= 80 ? 'bg-green-500' : occupancy >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                style={{ width: `${occupancy}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">{occupancy}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded ${occupancy >= 80 ? 'bg-green-100 text-green-800' :
                                                        occupancy >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {occupancy >= 80 ? 'Housefull' : occupancy >= 50 ? 'Good' : 'Low'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Cast & Crew */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Icon name="people" className="w-6 h-6 text-primary" />
                                Cast & Crew
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Director</p>
                                    <p className="font-medium text-foreground">{movie.director || 'Director Name'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Lead Cast</p>
                                    <p className="font-medium text-foreground">{movie.cast || 'Actor 1, Actor 2, Actor 3'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Producer</p>
                                    <p className="font-medium text-foreground">{movie.producer || 'Producer Name'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Distribution Details */}
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Icon name="business" className="w-6 h-6 text-primary" />
                                Distribution Details
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Distributor</p>
                                    <p className="font-medium text-foreground">{movie.distributor || 'Distribution Company'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Agreement Status</p>
                                    <p className="font-medium text-green-600 flex items-center gap-1">
                                        <Icon name="check_circle" className="w-4 h-4" />
                                        Accepted
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Revenue Share</p>
                                    <p className="font-medium text-foreground">{movie.revenueShare || '50/50'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ScheduleShowsModal
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                movie={movie}
            />
            <SubmitCollectionsModal
                isOpen={isCollectionsModalOpen}
                onClose={() => setIsCollectionsModalOpen(false)}
                movie={movie}
            />
        </div>
    );
};

export default MovieDetailsPage;
