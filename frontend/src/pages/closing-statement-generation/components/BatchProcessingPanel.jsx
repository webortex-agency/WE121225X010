import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BatchProcessingPanel = ({ onBatchGenerate }) => {
  const [batchConfig, setBatchConfig] = useState({
    movieIds: [],
    exhibitorIds: [],
    dateRange: 'thisMonth',
    templateFormat: 'standard',
  });

  const [processingQueue, setProcessingQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const movieOptions = [
    { value: 'MOV-2023-001', label: 'Pathaan' },
    { value: 'MOV-2023-002', label: 'Jawan' },
    { value: 'MOV-2023-003', label: 'Dunki' },
    { value: 'MOV-2023-004', label: 'Tiger 3' },
    { value: 'MOV-2023-005', label: 'Animal' },
  ];

  const exhibitorOptions = [
    { value: 'EXH-001', label: 'PVR Cinemas - Mumbai' },
    { value: 'EXH-002', label: 'INOX Megaplex - Delhi' },
    { value: 'EXH-003', label: 'Cinepolis - Bangalore' },
    { value: 'EXH-004', label: 'Carnival Cinemas - Pune' },
    { value: 'EXH-005', label: 'Miraj Cinemas - Hyderabad' },
  ];

  const dateRangeOptions = [
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
  ];

  const templateOptions = [
    { value: 'standard', label: 'Standard Format' },
    { value: 'detailed', label: 'Detailed Format' },
    { value: 'summary', label: 'Summary Format' },
  ];

  const handleStartBatch = () => {
    if (batchConfig?.movieIds?.length === 0 || batchConfig?.exhibitorIds?.length === 0) {
      return;
    }

    const queue = [];
    batchConfig?.movieIds?.forEach((movieId) => {
      batchConfig?.exhibitorIds?.forEach((exhibitorId) => {
        queue?.push({
          id: `${movieId}-${exhibitorId}`,
          movieId,
          exhibitorId,
          status: 'pending',
          progress: 0,
        });
      });
    });

    setProcessingQueue(queue);
    setIsProcessing(true);
    simulateBatchProcessing(queue);
  };

  const simulateBatchProcessing = (queue) => {
    let currentIndex = 0;

    const processNext = () => {
      if (currentIndex >= queue?.length) {
        setIsProcessing(false);
        return;
      }

      setProcessingQueue((prev) =>
        prev?.map((item, idx) =>
          idx === currentIndex ? { ...item, status: 'processing', progress: 0 } : item
        )
      );

      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        setProcessingQueue((prev) =>
          prev?.map((item, idx) =>
            idx === currentIndex ? { ...item, progress } : item
          )
        );

        if (progress >= 100) {
          clearInterval(progressInterval);
          setProcessingQueue((prev) =>
            prev?.map((item, idx) =>
              idx === currentIndex ? { ...item, status: 'completed', progress: 100 } : item
            )
          );
          currentIndex++;
          setTimeout(processNext, 500);
        }
      }, 200);
    };

    processNext();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Icon name="Clock" size={16} className="text-muted-foreground" />;
      case 'processing':
        return <Icon name="Loader2" size={16} className="text-primary animate-spin" />;
      case 'completed':
        return <Icon name="CheckCircle2" size={16} className="text-success" />;
      case 'failed':
        return <Icon name="XCircle" size={16} className="text-error" />;
      default:
        return <Icon name="Circle" size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-muted-foreground';
      case 'processing':
        return 'text-primary';
      case 'completed':
        return 'text-success';
      case 'failed':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const completedCount = processingQueue?.filter((item) => item?.status === 'completed')?.length;
  const totalCount = processingQueue?.length;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Icon name="Layers" size={20} className="text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Batch Processing</h2>
          <p className="text-sm text-muted-foreground">Generate multiple statements simultaneously</p>
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <Select
          label="Select Movies"
          description="Choose one or more movies"
          placeholder="Select movies"
          options={movieOptions}
          value={batchConfig?.movieIds}
          onChange={(value) => setBatchConfig({ ...batchConfig, movieIds: value })}
          multiple
          searchable
        />

        <Select
          label="Select Exhibitors"
          description="Choose one or more exhibitors"
          placeholder="Select exhibitors"
          options={exhibitorOptions}
          value={batchConfig?.exhibitorIds}
          onChange={(value) => setBatchConfig({ ...batchConfig, exhibitorIds: value })}
          multiple
          searchable
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={batchConfig?.dateRange}
            onChange={(value) => setBatchConfig({ ...batchConfig, dateRange: value })}
          />

          <Select
            label="Template Format"
            options={templateOptions}
            value={batchConfig?.templateFormat}
            onChange={(value) => setBatchConfig({ ...batchConfig, templateFormat: value })}
          />
        </div>

        {batchConfig?.movieIds?.length > 0 && batchConfig?.exhibitorIds?.length > 0 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground">
              <span className="font-semibold">
                {batchConfig?.movieIds?.length * batchConfig?.exhibitorIds?.length} statements
              </span>{' '}
              will be generated ({batchConfig?.movieIds?.length} movies × {batchConfig?.exhibitorIds?.length} exhibitors)
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-3 pb-4 border-b border-border">
        <Button
          variant="outline"
          onClick={() => {
            setBatchConfig({
              movieIds: [],
              exhibitorIds: [],
              dateRange: 'thisMonth',
              templateFormat: 'standard',
            });
            setProcessingQueue([]);
          }}
          disabled={isProcessing}
        >
          Reset
        </Button>
        <Button
          variant="default"
          onClick={handleStartBatch}
          disabled={
            isProcessing ||
            batchConfig?.movieIds?.length === 0 ||
            batchConfig?.exhibitorIds?.length === 0
          }
          iconName="Play"
          iconPosition="left"
        >
          Start Batch Processing
        </Button>
      </div>
      {processingQueue?.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Processing Queue</h3>
            <span className="text-sm text-muted-foreground">
              {completedCount} / {totalCount} completed
            </span>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {processingQueue?.map((item, index) => (
              <div
                key={item?.id}
                className="p-3 bg-muted/30 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item?.status)}
                    <span className="text-sm font-medium text-foreground">
                      Statement #{index + 1}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${getStatusColor(item?.status)}`}>
                    {item?.status?.charAt(0)?.toUpperCase() + item?.status?.slice(1)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {item?.movieId} - {item?.exhibitorId}
                </div>
                {item?.status === 'processing' && (
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${item?.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {isProcessing && (
            <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="Loader2" size={16} className="text-primary animate-spin" />
                <p className="text-sm text-foreground">
                  Processing statements... Please do not close this window.
                </p>
              </div>
            </div>
          )}

          {!isProcessing && completedCount === totalCount && (
            <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={16} className="text-success" />
                <p className="text-sm text-foreground">
                  All statements generated successfully! Ready for export.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchProcessingPanel;