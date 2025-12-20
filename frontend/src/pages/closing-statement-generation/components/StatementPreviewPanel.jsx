import { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const StatementPreviewPanel = ({ statementData, onExport, isExporting }) => {
  const [zoomLevel, setZoomLevel] = useState(100);

  if (!statementData) {
    return (
      <div className="bg-card border border-border rounded-lg p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Icon name="FileText" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Statement Generated</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Configure the statement parameters and click "Generate Statement" to preview the closing statement document
          </p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50));
  };

  const handleZoomReset = () => {
    setZoomLevel(100);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Icon name="Eye" size={20} className="text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Statement Preview</h3>
            <p className="text-xs text-muted-foreground">
              {statementData?.movieTitle} - {statementData?.exhibitorName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-background rounded-md border border-border">
            <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-7 w-7">
              <Icon name="ZoomOut" size={14} />
            </Button>
            <span className="text-xs font-medium text-foreground min-w-[3rem] text-center">
              {zoomLevel}%
            </span>
            <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-7 w-7">
              <Icon name="ZoomIn" size={14} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomReset} className="h-7 w-7">
              <Icon name="Maximize2" size={14} />
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={onExport}
            loading={isExporting}
            iconName="Download"
            iconPosition="left"
          >
            Export PDF
          </Button>
        </div>
      </div>
      <div className="p-6 overflow-auto max-h-[calc(100vh-300px)] bg-muted/10">
        <div
          className="bg-white mx-auto shadow-lg"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
          }}
        >
          <div className="space-y-6">
            <div className="text-center border-b-2 border-gray-800 pb-4">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">PICTURE CLOSING STATEMENT</h1>
              <p className="text-sm text-gray-600">Statement No: {statementData?.statementNumber}</p>
              <p className="text-sm text-gray-600">Generated on: {formatDate(new Date())}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Movie Details</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><span className="font-medium">Title:</span> {statementData?.movieTitle}</p>
                  <p><span className="font-medium">Movie ID:</span> {statementData?.movieId}</p>
                  <p><span className="font-medium">Period:</span> {formatDate(statementData?.startDate)} to {formatDate(statementData?.endDate)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Exhibitor Details</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  <p><span className="font-medium">Name:</span> {statementData?.exhibitorName}</p>
                  <p><span className="font-medium">Location:</span> {statementData?.exhibitorLocation}</p>
                  <p><span className="font-medium">GST No:</span> {statementData?.exhibitorGST}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Day-wise Collection Summary</h3>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-2 text-left">Date</th>
                    <th className="border border-gray-300 px-2 py-2 text-left">Day</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">Shows</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">Tickets</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">Gross Collection</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">AC Charges</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">Net Collection</th>
                  </tr>
                </thead>
                <tbody>
                  {statementData?.dailyCollections?.map((day, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-2 py-1.5">{formatDate(day?.date)}</td>
                      <td className="border border-gray-300 px-2 py-1.5">{day?.dayName}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right">{day?.showCount}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right">{day?.totalTickets}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-data">{formatCurrency(day?.grossCollection)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-data">{formatCurrency(day?.acCharges)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right font-data font-medium">{formatCurrency(day?.netCollection)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-200 font-semibold">
                    <td colSpan="3" className="border border-gray-300 px-2 py-2 text-right">Total:</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">{statementData?.totalTickets}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-data">{formatCurrency(statementData?.totalGross)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-data">{formatCurrency(statementData?.totalACCharges)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-data">{formatCurrency(statementData?.totalNet)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {statementData?.weeklySummaries && statementData?.weeklySummaries?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Weekly Summary (Friday-Thursday)</h3>
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-2 text-left">Week</th>
                      <th className="border border-gray-300 px-2 py-2 text-left">Period</th>
                      <th className="border border-gray-300 px-2 py-2 text-right">Net Collection</th>
                      <th className="border border-gray-300 px-2 py-2 text-right">Avg/Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData?.weeklySummaries?.map((week, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 px-2 py-1.5">Week {week?.weekNumber}</td>
                        <td className="border border-gray-300 px-2 py-1.5">{week?.period}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-right font-data font-medium">{formatCurrency(week?.netCollection)}</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-right font-data">{formatCurrency(week?.avgPerDay)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded border border-gray-300">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Financial Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Gross Collection:</span>
                  <span className="font-data font-medium">{formatCurrency(statementData?.totalGross)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total AC Charges Deducted:</span>
                  <span className="font-data font-medium">- {formatCurrency(statementData?.totalACCharges)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="font-semibold text-gray-900">Net Collection:</span>
                  <span className="font-data font-bold text-lg">{formatCurrency(statementData?.totalNet)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Distributor Share ({statementData?.distributorSharePercent}%):</span>
                  <span className="font-data font-medium">{formatCurrency(statementData?.distributorShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Exhibitor Share ({statementData?.exhibitorSharePercent}%):</span>
                  <span className="font-data font-medium">{formatCurrency(statementData?.exhibitorShare)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t-2 border-gray-800">
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-12">
                  <p className="text-sm font-medium text-gray-900">Distributor Signature</p>
                  <p className="text-xs text-gray-600 mt-1">Date: ______________</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 pt-2 mt-12">
                  <p className="text-sm font-medium text-gray-900">Exhibitor Signature</p>
                  <p className="text-xs text-gray-600 mt-1">Date: ______________</p>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-gray-300">
              <p>This is a computer-generated statement and does not require a physical signature for validity.</p>
              <p className="mt-1">For queries, contact: finance@moviedistribution.com | +91-22-1234-5678</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatementPreviewPanel;