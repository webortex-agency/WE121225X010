import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const MovieDetailsHeader = ({ movieData }) => {
  const [imageError, setImageError] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value?.toFixed(1)}%`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-shrink-0">
          <div className="w-48 h-72 rounded-lg overflow-hidden bg-muted">
            <Image
              src={movieData?.posterImage}
              alt={movieData?.posterImageAlt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-primary/10 text-primary text-sm font-medium font-data">
                  {movieData?.movieId}
                </span>
                <span className={`status-indicator ${movieData?.status === 'Running' ? 'success' : 'info'}`}>
                  <Icon name={movieData?.status === 'Running' ? 'Play' : 'Clock'} size={12} />
                  {movieData?.status}
                </span>
              </div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">{movieData?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="Calendar" size={16} />
                  Released: {movieData?.releaseDate}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={16} />
                  {movieData?.duration} mins
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Film" size={16} />
                  {movieData?.genre}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Collections</span>
                <Icon name="IndianRupee" size={16} className="text-primary" />
              </div>
              <div className="text-2xl font-semibold text-foreground font-data">{formatCurrency(movieData?.totalCollections)}</div>
              <div className={`text-xs font-medium mt-1 ${movieData?.collectionTrend > 0 ? 'text-success' : 'text-error'}`}>
                <Icon name={movieData?.collectionTrend > 0 ? 'TrendingUp' : 'TrendingDown'} size={12} className="inline mr-1" />
                {formatPercentage(movieData?.collectionTrend)} vs last week
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Theater Count</span>
                <Icon name="Building2" size={16} className="text-accent" />
              </div>
              <div className="text-2xl font-semibold text-foreground font-data">{movieData?.theaterCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Across {movieData?.cityCount} cities</div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg Occupancy</span>
                <Icon name="Users" size={16} className="text-success" />
              </div>
              <div className="text-2xl font-semibold text-foreground font-data">{movieData?.avgOccupancy}%</div>
              <div className={`text-xs font-medium mt-1 ${movieData?.occupancyTrend > 0 ? 'text-success' : 'text-error'}`}>
                <Icon name={movieData?.occupancyTrend > 0 ? 'TrendingUp' : 'TrendingDown'} size={12} className="inline mr-1" />
                {formatPercentage(movieData?.occupancyTrend)}
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ROI Analysis</span>
                <Icon name="TrendingUp" size={16} className="text-warning" />
              </div>
              <div className="text-2xl font-semibold text-foreground font-data">{formatPercentage(movieData?.roi)}</div>
              <div className="text-xs text-muted-foreground mt-1">Budget: {formatCurrency(movieData?.budget)}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              <Icon name="Download" size={16} />
              Export Report
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              <Icon name="FileText" size={16} />
              View Closing Statement
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors">
              <Icon name="BarChart3" size={16} />
              Detailed Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsHeader;