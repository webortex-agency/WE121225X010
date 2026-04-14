import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectSelectedWeek,
  selectScheduleForWeek,
  selectShowsPerDay,
  selectExtraShowsByDate,
  addMovieToShow,
  removeMovieFromShow,
  updateShowDetails,
  setSelectedWeek,
  setShowsPerDay,
  addExtraShow,
  getCurrentWeek
} from '../../../store/exhibitorScheduleSlice';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SchedulingGrid = ({ onShowClick }) => {
  const dispatch = useDispatch();
  const selectedWeek = useSelector(selectSelectedWeek);
  const weekSchedule = useSelector(state => selectScheduleForWeek(state, selectedWeek));
  const showsPerDay = useSelector(selectShowsPerDay);
  const extraShowsByDate = useSelector(selectExtraShowsByDate);
  const [dragOverCell, setDragOverCell] = useState(null);

  // Generate week dates
  const weekDates = generateWeekDates(selectedWeek);
  const showTimes = getShowTimes(showsPerDay);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragEnter = useCallback((e, date, showNumber) => {
    e.preventDefault();
    setDragOverCell(`${date}-${showNumber}`);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    // Only clear if we're leaving the cell entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCell(null);
    }
  }, []);

  const handleDrop = useCallback((e, date, showNumber) => {
    e.preventDefault();
    setDragOverCell(null);

    try {
      const movieData = JSON.parse(e.dataTransfer.getData('application/json'));
      if (movieData && movieData.id) {
        dispatch(addMovieToShow({
          date,
          showNumber,
          movieData
        }));
      }
    } catch (error) {
      console.error('Error parsing dropped movie data:', error);
    }
  }, [dispatch]);

  const handleShowClick = (date, showNumber, showData) => {
    onShowClick({ date, showNumber, showData });
  };

  const handleRemoveShow = (e, date, showNumber) => {
    e.stopPropagation();
    dispatch(removeMovieFromShow({ date, showNumber }));
  };

  const navigateWeek = (direction) => {
    const currentStart = new Date(selectedWeek.startDate);
    const newStart = new Date(currentStart);
    newStart.setDate(currentStart.getDate() + (direction * 7));
    
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);
    
    const newWeek = {
      startDate: newStart.toISOString().split('T')[0],
      endDate: newEnd.toISOString().split('T')[0],
      year: newStart.getFullYear(),
      weekNumber: getWeekNumber(newStart)
    };
    
    dispatch(setSelectedWeek(newWeek));
  };

  const goToCurrentWeek = () => {
    const currentWeek = getCurrentWeek();
    dispatch(setSelectedWeek(currentWeek));
  };

  const handleAddExtraShow = (date) => {
    const activeForDay = extraShowsByDate[date] ?? showsPerDay;
    if (activeForDay < 6) {
      dispatch(addExtraShow({ date }));
    }
  };

  const getMaxShowsForDate = (date) => {
    const currentShows = weekSchedule[date] ? Object.keys(weekSchedule[date]).length : 0;
    return Math.max(extraShowsByDate[date] ?? showsPerDay, currentShows);
  };

  return (
    <div className="flex-1 bg-background tour-schedule-grid">
      {/* Week Navigation */}
      <div className="bg-card border-b border-border p-4 tour-week-navigation">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-foreground">Weekly Schedule</h2>
            <div className="text-sm text-muted-foreground">
              Week {selectedWeek.weekNumber}, {selectedWeek.year}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek(-1)}
            >
              <Icon name="ChevronLeft" size={16} className="mr-1" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
            >
              <Icon name="Calendar" size={16} className="mr-1" />
              <span className="hidden sm:inline">This Week</span>
              <span className="sm:hidden">Today</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateWeek(1)}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <Icon name="ChevronRight" size={16} className="ml-1" />
            </Button>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          {formatDateRange(selectedWeek.startDate, selectedWeek.endDate)}
        </div>
      </div>

      {/* Schedule Grid - Days Vertical, Shows Horizontal */}
      <div className="p-4">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-w-full">
          {/* Header Row - Show Times */}
          <div className="grid grid-cols-[200px_repeat(6,1fr)] lg:grid-cols-[200px_repeat(6,1fr)] md:grid-cols-[180px_repeat(6,minmax(140px,1fr))] sm:grid-cols-[150px_repeat(6,minmax(120px,1fr))] bg-muted/30 overflow-x-auto">
            <div className="p-3 border-r border-border font-medium text-foreground sticky left-0 bg-muted/30 z-10">
              <span className="hidden sm:inline">Day / Show</span>
              <span className="sm:hidden">Day</span>
            </div>
            {Array.from({ length: 6 }, (_, index) => {
              const showNumber = index + 1;
              const showTime = getShowTimes(6)[index];
              return (
                <div key={showNumber} className="p-3 border-r border-border last:border-r-0 min-w-[150px]">
                  <div className="font-medium text-foreground text-center">Show {showNumber}</div>
                  <div className="text-xs text-muted-foreground text-center">{showTime}</div>
                </div>
              );
            })}
          </div>

          {/* Schedule Rows - Each Day */}
          {weekDates.map((date) => {
            const maxShows = getMaxShowsForDate(date.dateString);
            const activeShowsForDay = extraShowsByDate[date.dateString] ?? showsPerDay;
            return (
              <div key={date.dateString} className="grid grid-cols-[200px_repeat(6,1fr)] lg:grid-cols-[200px_repeat(6,1fr)] md:grid-cols-[180px_repeat(6,minmax(140px,1fr))] sm:grid-cols-[150px_repeat(6,minmax(120px,1fr))] border-t border-border overflow-x-auto">
                {/* Day Column */}
                <div className="p-4 border-r border-border bg-muted/10 flex items-center justify-between sticky left-0 bg-muted/10 z-10">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{date.dayName}</div>
                    <div className="text-sm text-muted-foreground">{date.dateDisplay}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddExtraShow(date.dateString)}
                    className={`ml-2 p-1 h-8 w-8 flex-shrink-0 ${activeShowsForDay >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={activeShowsForDay >= 6 ? "Maximum shows reached" : "Add Extra Show"}
                    disabled={activeShowsForDay >= 6}
                  >
                    <Icon name="Plus" size={14} />
                  </Button>
                </div>

                {/* Show Cells */}
                {Array.from({ length: 6 }, (_, showIndex) => {
                  const showNumber = showIndex + 1;
                  const cellKey = `${date.dateString}-${showNumber}`;
                  const showData = weekSchedule[date.dateString]?.[`show_${showNumber}`];
                  const isDragOver = dragOverCell === cellKey;
                  const isActiveSlot = showNumber <= activeShowsForDay;

                  return (
                    <div
                      key={cellKey}
                      className={`
                        p-2 border-r border-border last:border-r-0 min-h-[100px] min-w-[150px] transition-all duration-200
                        ${!isActiveSlot ? 'bg-gray-50 opacity-50' : ''}
                        ${isDragOver && isActiveSlot ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/20'}
                        ${showData ? 'cursor-pointer' : 'cursor-default'}
                      `}
                      onDragOver={isActiveSlot ? handleDragOver : undefined}
                      onDragEnter={isActiveSlot ? (e) => handleDragEnter(e, date.dateString, showNumber) : undefined}
                      onDragLeave={handleDragLeave}
                      onDrop={isActiveSlot ? (e) => handleDrop(e, date.dateString, showNumber) : undefined}
                      onClick={() => showData && handleShowClick(date.dateString, showNumber, showData)}
                    >
                      {isActiveSlot ? (
                        showData ? (
                          <ScheduledShowCard 
                            showData={showData}
                            onRemove={(e) => handleRemoveShow(e, date.dateString, showNumber)}
                          />
                        ) : (
                          <EmptySlot isDragOver={isDragOver} />
                        )
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400">
                          {showNumber > 4 ? 'Click + to activate' : 'Inactive'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          </div>
        </div>

        {/* Drag & Drop Hint */}
        <div className="mt-4 p-4 bg-muted/30 border border-border rounded-lg tour-drag-drop-hint">
          <div className="flex items-center gap-3">
            <Icon name="MousePointer" size={20} className="text-primary" />
            <div>
              <h3 className="font-medium text-foreground">How to Schedule Movies</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Drag movies from the sidebar and drop them into time slots. Click the + button to add extra shows for any day.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ScheduledShowCard = ({ showData, onRemove }) => {
  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800 border-gray-200',
      'submitted': 'bg-blue-100 text-blue-800 border-blue-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || colors.draft;
  };

  const isCompleted = showData.totalSeats && showData.occupiedSeats && showData.ticketPrice;
  const occupancyPercentage = isCompleted ? 
    Math.round((showData.occupiedSeats / showData.totalSeats) * 100) : 0;

  return (
    <div className="bg-white border border-border rounded p-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-foreground text-sm truncate flex-1">
          {showData.movieTitle}
        </h4>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-red-500 transition-colors ml-1"
          title="Remove show"
        >
          <Icon name="X" size={14} />
        </button>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-muted-foreground">
          {showData.movieLanguage} • {showData.movieGenre}
        </div>
        
        {isCompleted ? (
          <div className="space-y-1">
            <div className="text-xs font-medium text-foreground">
              ₹{showData.netCollection?.toLocaleString() || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              {occupancyPercentage}% occupancy
            </div>
          </div>
        ) : (
          <div className="text-xs text-amber-600 font-medium">
            Details pending
          </div>
        )}

        <div className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium border ${getStatusColor(showData.status)}`}>
          {showData.status}
        </div>
      </div>
    </div>
  );
};

const EmptySlot = ({ isDragOver }) => (
  <div className={`
    h-full flex items-center justify-center border-2 border-dashed rounded transition-all duration-200
    ${isDragOver 
      ? 'border-primary/40 bg-primary/5 text-primary' 
      : 'border-muted text-muted-foreground hover:border-primary/30 hover:text-primary'
    }
  `}>
    <div className="text-center">
      <Icon name="Plus" size={16} className="mx-auto mb-1" />
      <div className="text-xs">
        {isDragOver ? 'Drop here' : 'Drag movie here'}
      </div>
    </div>
  </div>
);

// Helper functions
const generateWeekDates = (selectedWeek) => {
  if (!selectedWeek.startDate) return [];
  
  const dates = [];
  const startDate = new Date(selectedWeek.startDate);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    dates.push({
      dateString: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      dateDisplay: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }
  
  return dates;
};

const getShowTimes = (maxShows) => {
  const allShowTimes = [
    '11:00 AM', '2:00 PM', '5:00 PM', '8:00 PM', '11:00 PM', '1:00 AM'
  ];
  return allShowTimes.slice(0, maxShows);
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startFormatted = start.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
  
  const endFormatted = end.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
  
  return `${startFormatted} - ${endFormatted}`;
};

const getWeekNumber = (date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export default SchedulingGrid;
