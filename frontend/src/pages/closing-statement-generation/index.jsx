import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import SearchInterface from '../../components/ui/SearchInterface';
import StatusIndicatorPanel from '../../components/ui/StatusIndicatorPanel';
import StatementConfigurationPanel from './components/StatementConfigurationPanel';
import StatementPreviewPanel from './components/StatementPreviewPanel';
import ValidationAlertPanel from './components/ValidationAlertPanel';
import BatchProcessingPanel from './components/BatchProcessingPanel';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const ClosingStatementGeneration = () => {
  const navigate = useNavigate();
  const [userRole] = useState('admin');
  const [activeTab, setActiveTab] = useState('single');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [statementData, setStatementData] = useState(null);
  const [validationResults, setValidationResults] = useState([]);

  useEffect(() => {
    document.title = 'Closing Statement Generation - Movie Distribution Dashboard';
  }, []);

  const generateMockStatementData = (config) => {
    const startDate = new Date(config.startDate);
    const endDate = new Date(config.endDate);
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const dailyCollections = [];
    let totalGross = 0;
    let totalACCharges = 0;
    let totalTickets = 0;

    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate?.setDate(startDate?.getDate() + i);

      const showCount = Math.floor(Math.random() * 2) + 3;
      const tickets = Math.floor(Math.random() * 500) + 200;
      const grossCollection = tickets * (Math.floor(Math.random() * 100) + 150);
      const acCharges = tickets * 5;
      const netCollection = grossCollection - acCharges;

      dailyCollections?.push({
        date: currentDate?.toISOString(),
        dayName: currentDate?.toLocaleDateString('en-IN', { weekday: 'long' }),
        showCount,
        totalTickets: tickets,
        grossCollection,
        acCharges,
        netCollection,
      });

      totalGross += grossCollection;
      totalACCharges += acCharges;
      totalTickets += tickets;
    }

    const totalNet = totalGross - totalACCharges;
    const distributorSharePercent = 60;
    const exhibitorSharePercent = 40;
    const distributorShare = (totalNet * distributorSharePercent) / 100;
    const exhibitorShare = (totalNet * exhibitorSharePercent) / 100;

    const weeklySummaries = [];
    let weekNumber = 1;
    let weekStart = 0;

    while (weekStart < dailyCollections?.length) {
      const weekEnd = Math.min(weekStart + 7, dailyCollections?.length);
      const weekCollections = dailyCollections?.slice(weekStart, weekEnd);
      const weekNet = weekCollections?.reduce((sum, day) => sum + day?.netCollection, 0);
      const avgPerDay = weekNet / weekCollections?.length;

      weeklySummaries?.push({
        weekNumber,
        period: `${new Date(weekCollections[0].date)?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} - ${new Date(weekCollections[weekCollections.length - 1].date)?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`,
        netCollection: weekNet,
        avgPerDay,
      });

      weekNumber++;
      weekStart = weekEnd;
    }

    return {
      statementNumber: `STMT-${new Date()?.getFullYear()}-${Math.floor(Math.random() * 10000)?.toString()?.padStart(4, '0')}`,
      movieId: config?.movieId,
      movieTitle: 'Pathaan',
      exhibitorName: 'PVR Cinemas - Mumbai Central',
      exhibitorLocation: 'Mumbai, Maharashtra',
      exhibitorGST: '27AAACP1234A1Z5',
      startDate: config?.startDate,
      endDate: config?.endDate,
      dailyCollections,
      weeklySummaries: config?.includeWeeklySummary ? weeklySummaries : null,
      totalTickets,
      totalGross,
      totalACCharges,
      totalNet,
      distributorSharePercent,
      exhibitorSharePercent,
      distributorShare,
      exhibitorShare,
    };
  };

  const generateMockValidationResults = () => {
    return [
      {
        severity: 'warning',
        message: 'Missing collections for 2 days',
        details: 'Collections not submitted for some dates in the selected period',
        affectedDates: ['2023-12-05', '2023-12-08'],
        resolvable: true,
      },
      {
        severity: 'info',
        message: 'Week calculation adjusted',
        details: 'Statement period does not align with Friday-Thursday week boundaries',
        resolvable: false,
      },
      {
        severity: 'info',
        message: 'AC charges calculated automatically',
        details: '₹5 per ticket deducted as per standard policy',
        resolvable: false,
      },
    ];
  };

  const handleGenerate = (config) => {
    setIsGenerating(true);
    setValidationResults([]);

    setTimeout(() => {
      const mockData = generateMockStatementData(config);
      const mockValidation = generateMockValidationResults();

      setStatementData(mockData);
      setValidationResults(mockValidation);
      setIsGenerating(false);
    }, 2000);
  };

  const handleExport = () => {
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);
      alert('Statement exported successfully as PDF!');
    }, 1500);
  };

  const handleResolveValidation = (issue) => {
    console.log('Resolving validation issue:', issue);
    alert(`Navigating to resolve: ${issue?.message}`);
  };

  const handleBatchGenerate = (batchConfig) => {
    console.log('Starting batch generation:', batchConfig);
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole={userRole} />
      {/* <QuickActionToolbar userRole={userRole} /> */}
      <div className="main-content with-toolbar">
        <div className="content-container">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Closing Statement Generation</h1>
                <p className="text-muted-foreground">
                  Generate comprehensive financial statements with automated calculations and professional formatting
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/admin-dashboard')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to Dashboard
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <SearchInterface userRole={userRole} />
            </div>

            <StatusIndicatorPanel userRole={userRole} />
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 border-b border-border">
              <button
                onClick={() => setActiveTab('single')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'single' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="FileText" size={16} className="inline mr-2" />
                Single Statement
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'batch' ?'text-primary border-b-2 border-primary' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Layers" size={16} className="inline mr-2" />
                Batch Processing
              </button>
            </div>
          </div>

          {activeTab === 'single' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-6">
                <StatementConfigurationPanel
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                />

                {validationResults?.length > 0 && (
                  <ValidationAlertPanel
                    validationResults={validationResults}
                    onResolve={handleResolveValidation}
                  />
                )}
              </div>

              <div className="xl:sticky xl:top-24 xl:self-start">
                <StatementPreviewPanel
                  statementData={statementData}
                  onExport={handleExport}
                  isExporting={isExporting}
                />
              </div>
            </div>
          ) : (
            <BatchProcessingPanel onBatchGenerate={handleBatchGenerate} />
          )}

          <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Info" size={20} className="text-primary mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-2">Statement Generation Guidelines</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Statements follow Friday-Thursday week calculation as per industry standard</li>
                  <li>• AC charges (₹5 per ticket) are automatically deducted from gross collections</li>
                  <li>• All amounts are displayed in Indian Rupees with proper formatting</li>
                  <li>• GST details are included when available in exhibitor records</li>
                  <li>• Generated statements are digitally signed and ready for distribution</li>
                  <li>• Batch processing allows generation of multiple statements simultaneously</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosingStatementGeneration;