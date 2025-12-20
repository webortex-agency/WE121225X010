import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AssignedMoviesPanel = ({ movies = [] }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getMovieStatus = (releaseDate, endDate) => {
    const now = new Date();
    const release = new Date(releaseDate);
    const end = new Date(endDate);

    if (now < release) {
      return { label: 'Upcoming', className: 'bg-primary/10 text-primary', icon: 'Calendar' };
    } else if (now > end) {
      return { label: 'Completed', className: 'bg-muted text-muted-foreground', icon: 'CheckCircle2' };
    } else {
      return { label: 'Running', className: 'bg-success/10 text-success', icon: 'Play' };
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Film" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Assigned Movies</h2>
            <p className="text-sm text-muted-foreground">{movies?.length} active assignments</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        {movies?.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Icon name="Film" size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No movies assigned</h3>
            <p className="text-sm text-muted-foreground">
              Contact admin to get movie assignments
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {movies?.map((movie) => {
              const status = getMovieStatus(movie?.releaseDate, movie?.endDate);
              
              return (
                <div
                  key={movie?.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="w-20 h-28 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={movie?.poster}
                      alt={movie?.posterAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-1">
                          {movie?.title}
                        </h3>
                        <p className="text-xs text-muted-foreground font-data">
                          {movie?.movieId}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status?.className}`}>
                        <Icon name={status?.icon} size={12} />
                        {status?.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Icon name="Calendar" size={14} className="text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Release Date</p>
                          <p className="text-sm font-medium text-foreground">
                            {formatDate(movie?.releaseDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="CalendarX" size={14} className="text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">End Date</p>
                          <p className="text-sm font-medium text-foreground">
                            {formatDate(movie?.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Icon name="Users" size={12} />
                        <span>{movie?.language}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon name="Clock" size={12} />
                        <span>{movie?.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Icon name="Star" size={12} />
                        <span>{movie?.genre}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedMoviesPanel;