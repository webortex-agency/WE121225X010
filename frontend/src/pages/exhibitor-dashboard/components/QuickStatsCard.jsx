import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStatsCard = ({ icon, label, value, trend, loading }) => {
    return (
        <div className="bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-border">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon name={icon} className="w-6 h-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    </div>
                    {loading ? (
                        <div className="h-8 w-24 bg-muted animate-pulse rounded"></div>
                    ) : (
                        <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
                    )}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={trend > 0 ? 'trending_up' : 'trending_down'} className="w-4 h-4" />
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuickStatsCard;
