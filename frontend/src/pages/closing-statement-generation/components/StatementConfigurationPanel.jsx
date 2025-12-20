import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const StatementConfigurationPanel = ({ onGenerate, isGenerating }) => {
  const [config, setConfig] = useState({
    movieId: '',
    exhibitorId: '',
    startDate: '',
    endDate: '',
    templateFormat: 'standard',
    includeWeeklySummary: true,
    includeGSTDetails: true,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const movieOptions = [
    { value: 'MOV-2023-001', label: 'Pathaan - Shah Rukh Khan Productions' },
    { value: 'MOV-2023-002', label: 'Jawan - Red Chillies Entertainment' },
    { value: 'MOV-2023-003', label: 'Dunki - Rajkumar Hirani Films' },
    { value: 'MOV-2023-004', label: 'Tiger 3 - Yash Raj Films' },
    { value: 'MOV-2023-005', label: 'Animal - T-Series Films' },
  ];

  const exhibitorOptions = [
    { value: 'EXH-001', label: 'PVR Cinemas - Mumbai Central (GST: 27AAACP1234A1Z5)' },
    { value: 'EXH-002', label: 'INOX Megaplex - Delhi Connaught Place (GST: 07AAACP5678B1Z9)' },
    { value: 'EXH-003', label: 'Cinepolis - Bangalore Whitefield (GST: 29AAACP9012C1Z3)' },
    { value: 'EXH-004', label: 'Carnival Cinemas - Pune Bund Garden (GST: 27AAACP3456D1Z7)' },
    { value: 'EXH-005', label: 'Miraj Cinemas - Hyderabad Banjara Hills (GST: 36AAACP7890E1Z1)' },
  ];

  const templateOptions = [
    { value: 'standard', label: 'Standard Format', description: 'Day-wise breakdown with weekly summaries' },
    { value: 'detailed', label: 'Detailed Format', description: 'Show-wise breakdown with AC charges' },
    { value: 'summary', label: 'Summary Format', description: 'Weekly totals only' },
    { value: 'producer', label: 'Producer Report', description: 'ROI analysis with performance metrics' },
  ];

  const validateConfiguration = () => {
    const errors = {};

    if (!config?.movieId) {
      errors.movieId = 'Please select a movie';
    }

    if (!config?.exhibitorId) {
      errors.exhibitorId = 'Please select an exhibitor';
    }

    if (!config?.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!config?.endDate) {
      errors.endDate = 'End date is required';
    }

    if (config?.startDate && config?.endDate) {
      const start = new Date(config.startDate);
      const end = new Date(config.endDate);
      
      if (end < start) {
        errors.endDate = 'End date must be after start date';
      }

      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (daysDiff > 90) {
        errors.endDate = 'Date range cannot exceed 90 days';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleGenerate = () => {
    if (validateConfiguration()) {
      onGenerate(config);
    }
  };

  const handleReset = () => {
    setConfig({
      movieId: '',
      exhibitorId: '',
      startDate: '',
      endDate: '',
      templateFormat: 'standard',
      includeWeeklySummary: true,
      includeGSTDetails: true,
    });
    setValidationErrors({});
  };

  const handleQuickDateRange = (range) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'thisWeek':
        const dayOfWeek = today?.getDay();
        const daysToFriday = dayOfWeek >= 5 ? dayOfWeek - 5 : dayOfWeek + 2;
        startDate?.setDate(today?.getDate() - daysToFriday);
        break;
      case 'lastWeek':
        startDate?.setDate(today?.getDate() - 7);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        break;
      default:
        break;
    }

    setConfig({
      ...config,
      startDate: startDate?.toISOString()?.split('T')?.[0],
      endDate: today?.toISOString()?.split('T')?.[0],
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon name="Settings" size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Statement Configuration</h2>
            <p className="text-sm text-muted-foreground">Configure parameters for statement generation</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <Icon name="RotateCcw" size={16} className="mr-2" />
          Reset
        </Button>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Select
            label="Select Movie"
            description="Choose the movie for statement generation"
            placeholder="Select a movie"
            options={movieOptions}
            value={config?.movieId}
            onChange={(value) => setConfig({ ...config, movieId: value })}
            error={validationErrors?.movieId}
            required
            searchable
          />

          <Select
            label="Select Exhibitor"
            description="Choose the theater/exhibitor"
            placeholder="Select an exhibitor"
            options={exhibitorOptions}
            value={config?.exhibitorId}
            onChange={(value) => setConfig({ ...config, exhibitorId: value })}
            error={validationErrors?.exhibitorId}
            required
            searchable
          />
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Quick Date Ranges</span>
            <Icon name="Calendar" size={16} className="text-muted-foreground" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('thisWeek')}
              className="text-xs"
            >
              This Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('lastWeek')}
              className="text-xs"
            >
              Last Week
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('thisMonth')}
              className="text-xs"
            >
              This Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateRange('lastMonth')}
              className="text-xs"
            >
              Last Month
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            type="date"
            label="Start Date"
            description="Statement period start date (Friday preferred)"
            value={config?.startDate}
            onChange={(e) => setConfig({ ...config, startDate: e?.target?.value })}
            error={validationErrors?.startDate}
            required
          />

          <Input
            type="date"
            label="End Date"
            description="Statement period end date (Thursday preferred)"
            value={config?.endDate}
            onChange={(e) => setConfig({ ...config, endDate: e?.target?.value })}
            error={validationErrors?.endDate}
            required
          />
        </div>

        <Select
          label="Statement Template"
          description="Choose the format for statement generation"
          options={templateOptions}
          value={config?.templateFormat}
          onChange={(value) => setConfig({ ...config, templateFormat: value })}
        />

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config?.includeWeeklySummary}
              onChange={(e) => setConfig({ ...config, includeWeeklySummary: e?.target?.checked })}
              className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Include Weekly Summary</span>
              <p className="text-xs text-muted-foreground">Add Friday-Thursday weekly breakdowns</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config?.includeGSTDetails}
              onChange={(e) => setConfig({ ...config, includeGSTDetails: e?.target?.checked })}
              className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
            />
            <div>
              <span className="text-sm font-medium text-foreground">Include GST Details</span>
              <p className="text-xs text-muted-foreground">Add GST numbers and tax breakdowns</p>
            </div>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleReset}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleGenerate}
            loading={isGenerating}
            iconName="FileText"
            iconPosition="left"
          >
            Generate Statement
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatementConfigurationPanel;