import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateShowDetails } from '../../../store/exhibitorScheduleSlice';
import { useForm } from 'react-hook-form';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ShowDetailsPanel = ({ isOpen, onClose, showDetails }) => {
  const dispatch = useDispatch();
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      totalSeats: '',
      occupiedSeats: '',
      ticketPrice: '',
      notes: ''
    }
  });

  // Watch form values for auto-calculation
  const totalSeats = watch('totalSeats');
  const occupiedSeats = watch('occupiedSeats');
  const ticketPrice = watch('ticketPrice');

  // Auto-calculate collections
  const calculations = {
    grossCollection: 0,
    acCharge: 0,
    netCollection: 0,
    occupancyPercentage: 0
  };

  if (totalSeats && occupiedSeats && ticketPrice) {
    const seats = parseInt(occupiedSeats);
    const price = parseFloat(ticketPrice);
    
    calculations.grossCollection = seats * price;
    calculations.acCharge = seats * 5; // Fixed ₹5 AC charge per person
    calculations.netCollection = calculations.grossCollection - calculations.acCharge;
    calculations.occupancyPercentage = Math.round((parseInt(occupiedSeats) / parseInt(totalSeats)) * 100);
  }

  // Reset form when showDetails changes
  useEffect(() => {
    if (showDetails) {
      reset({
        totalSeats: showDetails.totalSeats || '',
        occupiedSeats: showDetails.occupiedSeats || '',
        ticketPrice: showDetails.ticketPrice || '',
        notes: showDetails.notes || ''
      });
    }
  }, [showDetails, reset]);

  const onSubmit = async (data) => {
    if (!showDetails) return;

    setIsCalculating(true);
    
    // Simulate a brief calculation delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedDetails = {
      totalSeats: parseInt(data.totalSeats),
      occupiedSeats: parseInt(data.occupiedSeats),
      ticketPrice: parseFloat(data.ticketPrice),
      notes: data.notes,
      grossCollection: calculations.grossCollection,
      acCharge: calculations.acCharge,
      netCollection: calculations.netCollection
    };

    dispatch(updateShowDetails({
      date: showDetails.date,
      showNumber: showDetails.showNumber,
      showDetails: updatedDetails
    }));

    setIsCalculating(false);
    onClose();
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen || !showDetails) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className={`
        fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out mt-16
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Show Details</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {showDetails.showData?.movieTitle} • Show {showDetails.showNumber}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="X" size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Movie Info */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-16 bg-muted rounded flex items-center justify-center">
                    <Icon name="Film" size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{showDetails.showData?.movieTitle}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>{showDetails.showData?.movieLanguage} • {showDetails.showData?.movieGenre}</div>
                      <div>{showDetails.showData?.showTime} • {formatDate(showDetails.date)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seating Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Icon name="Users" size={16} className="text-teal-600" />
                  Seating Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Total Seats *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="200"
                      {...register('totalSeats', {
                        required: 'Total seats is required',
                        min: { value: 1, message: 'Must be at least 1' },
                        max: { value: 1000, message: 'Cannot exceed 1000' }
                      })}
                      error={errors.totalSeats?.message}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Occupied Seats *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={totalSeats || 1000}
                      placeholder="150"
                      {...register('occupiedSeats', {
                        required: 'Occupied seats is required',
                        min: { value: 0, message: 'Cannot be negative' },
                        max: { 
                          value: parseInt(totalSeats) || 1000, 
                          message: 'Cannot exceed total seats' 
                        }
                      })}
                      error={errors.occupiedSeats?.message}
                    />
                  </div>
                </div>

                {/* Occupancy Indicator */}
                {totalSeats && occupiedSeats && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Occupancy</span>
                      <span className="text-sm font-semibold text-foreground">
                        {calculations.occupancyPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          calculations.occupancyPercentage >= 90 ? 'bg-green-500' :
                          calculations.occupancyPercentage >= 70 ? 'bg-yellow-500' :
                          calculations.occupancyPercentage >= 50 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(calculations.occupancyPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Information */}
              <div className="space-y-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Icon name="IndianRupee" size={16} className="text-teal-600" />
                  Pricing Information
                </h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Ticket Price (₹) *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    step="0.01"
                    placeholder="150.00"
                    {...register('ticketPrice', {
                      required: 'Ticket price is required',
                      min: { value: 1, message: 'Must be at least ₹1' },
                      max: { value: 1000, message: 'Cannot exceed ₹1000' }
                    })}
                    error={errors.ticketPrice?.message}
                  />
                </div>
              </div>

              {/* Collection Summary */}
              {calculations.grossCollection > 0 && (
                <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <Icon name="Calculator" size={16} className="text-teal-600" />
                    Collection Summary
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Collection:</span>
                      <span className="font-medium text-foreground">
                        ₹{calculations.grossCollection.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AC Charges (₹5/person):</span>
                      <span className="font-medium text-foreground">
                        -₹{calculations.acCharge.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-teal-200 pt-2 flex justify-between">
                      <span className="font-medium text-foreground">Net Collection:</span>
                      <span className="font-semibold text-teal-600 text-base">
                        ₹{calculations.netCollection.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {/* <div className="space-y-4">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Icon name="FileText" size={16} className="text-teal-600" />
                  Additional Notes
                </h3>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Add any additional notes about this show..."
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    {...register('notes')}
                  />
                </div>
              </div> */}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCalculating || !totalSeats || !occupiedSeats || !ticketPrice}
                  className="flex-1 bg-teal-600 hover:bg-teal-700"
                >
                  {isCalculating ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" size={16} className="mr-2" />
                      Save Details
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default ShowDetailsPanel;
