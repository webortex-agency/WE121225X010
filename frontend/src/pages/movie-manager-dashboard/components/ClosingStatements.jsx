import { useState } from 'react';
import Icon from '../../../components/AppIcon';

const ClosingStatements = ({ statementsData }) => {
  const [selectedStatement, setSelectedStatement] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const handleViewStatement = (statement) => {
    setSelectedStatement(statement);
  };

  const handleCloseModal = () => {
    setSelectedStatement(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Generated Closing Statements</h3>
          <p className="text-sm text-muted-foreground mt-1">View and download picture closing statements</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Icon name="Plus" size={16} />
          Request New Statement
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {statementsData?.map((statement, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="FileText" size={20} className="text-primary" />
                  <h4 className="text-base font-semibold text-foreground">{statement?.title}</h4>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="Calendar" size={12} />
                    {statement?.period}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="Clock" size={12} />
                    Generated: {statement?.generatedDate}
                  </span>
                </div>
              </div>
              <span className={`status-indicator ${
                statement?.status === 'Final' ? 'success' : 'warning'
              }`}>
                <Icon name={statement?.status === 'Final' ? 'CheckCircle2' : 'Clock'} size={12} />
                {statement?.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Total Collections</div>
                <div className="text-lg font-semibold text-foreground font-data">{formatCurrency(statement?.totalCollections)}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Net Payable</div>
                <div className="text-lg font-semibold text-success font-data">{formatCurrency(statement?.netPayable)}</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Theater Count:</span>
                <span className="font-medium text-foreground">{statement?.theaterCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Shows:</span>
                <span className="font-medium text-foreground">{statement?.totalShows}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AC Charges Deducted:</span>
                <span className="font-medium text-error">{formatCurrency(statement?.acCharges)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewStatement(statement)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Icon name="Eye" size={16} />
                View Details
              </button>
              <button className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors">
                <Icon name="Download" size={16} />
              </button>
              <button className="px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors">
                <Icon name="Printer" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedStatement && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{selectedStatement?.title}</h3>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-md hover:bg-muted transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">Statement Period</div>
                  <div className="text-base font-semibold text-foreground">{selectedStatement?.period}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">Generated On</div>
                  <div className="text-base font-semibold text-foreground">{selectedStatement?.generatedDate}</div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b border-border">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">Day-wise Summary</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">Date</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-foreground">Shows</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-foreground">Gross Collection</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-foreground">AC Charges</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-foreground">Net Collection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selectedStatement?.daywiseSummary?.map((day, index) => (
                        <tr key={index} className="hover:bg-muted/20">
                          <td className="px-4 py-2 text-sm text-foreground">{day?.date}</td>
                          <td className="px-4 py-2 text-sm text-foreground text-right">{day?.shows}</td>
                          <td className="px-4 py-2 text-sm text-foreground text-right font-data">{formatCurrency(day?.gross)}</td>
                          <td className="px-4 py-2 text-sm text-error text-right font-data">-{formatCurrency(day?.acCharges)}</td>
                          <td className="px-4 py-2 text-sm font-semibold text-foreground text-right font-data">{formatCurrency(day?.net)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Gross Collection</div>
                    <div className="text-xl font-semibold text-foreground font-data">{formatCurrency(selectedStatement?.totalCollections)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total AC Charges</div>
                    <div className="text-xl font-semibold text-error font-data">-{formatCurrency(selectedStatement?.acCharges)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Net Payable Amount</div>
                    <div className="text-xl font-semibold text-success font-data">{formatCurrency(selectedStatement?.netPayable)}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors">
                  <Icon name="Download" size={16} />
                  Download PDF
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors">
                  <Icon name="FileSpreadsheet" size={16} />
                  Export Excel
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Icon name="Printer" size={16} />
                  Print Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosingStatements;