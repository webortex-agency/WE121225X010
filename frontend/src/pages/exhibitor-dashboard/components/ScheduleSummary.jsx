import { useSelector } from 'react-redux';
import { 
  selectTotalShowsThisWeek,
  selectCompletedShowsThisWeek,
  selectEstimatedGrossCollectionWeek,
  selectSelectedWeek
} from '../../../store/exhibitorScheduleSlice';
import Icon from '../../../components/AppIcon';

const ScheduleSummary = () => {
  const selectedWeek = useSelector(selectSelectedWeek);
  const totalShows = useSelector(selectTotalShowsThisWeek);
  const completedShows = useSelector(selectCompletedShowsThisWeek);
  const estimatedGross = useSelector(selectEstimatedGrossCollectionWeek);

  const completionPercentage = totalShows > 0 ? Math.round((completedShows / totalShows) * 100) : 0;

  const stats = [
    {
      label: 'Total Shows',
      value: totalShows,
      icon: 'Calendar',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Completed',
      value: completedShows,
      icon: 'CheckCircle',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Completion',
      value: `${completionPercentage}%`,
      icon: 'TrendingUp',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Est. Gross',
      value: `₹${estimatedGross.toLocaleString()}`,
      icon: 'IndianRupee',
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 tour-schedule-summary w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
          <Icon name="BarChart3" size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Week Summary</h3>
          <p className="text-sm text-muted-foreground">
            Week {selectedWeek.weekNumber}, {selectedWeek.year}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon name={stat.icon} size={16} className={stat.color} />
              </div>
              <span className="text-sm font-medium text-foreground">{stat.label}</span>
            </div>
            <div className="text-lg font-semibold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      {totalShows > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedShows} of {totalShows} shows completed
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-foreground">{totalShows * 4}</div>
            <div className="text-xs text-muted-foreground">Avg Shows/Month</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">
              {totalShows > 0 ? Math.round(estimatedGross / totalShows) : 0}
            </div>
            <div className="text-xs text-muted-foreground">Avg/Show</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-foreground">
              ₹{(estimatedGross * 4).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Est. Monthly</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSummary;
