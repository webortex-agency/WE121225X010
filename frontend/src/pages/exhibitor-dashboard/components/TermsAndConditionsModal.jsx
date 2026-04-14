import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setTermsAndConditionsAccepted } from '../../../store/exhibitorScheduleSlice';
import { logout } from '../../../store/authSlice';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const TermsAndConditionsModal = ({ isOpen, onAccept, onDecline }) => {
  const dispatch = useDispatch();
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const scrollContainerRef = useRef(null);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
      setIsScrolledToBottom(isAtBottom);
    }
  };

  const handleAccept = () => {
    dispatch(setTermsAndConditionsAccepted(true));
    onAccept();
  };

  const handleDecline = () => {
    dispatch(logout());
    onDecline();
  };

  const canAccept = isScrolledToBottom && isChecked;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Terms and Conditions Agreement</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Please read and accept the terms to continue using the exhibitor portal
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center">
            <Icon name="FileText" size={24} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-6 space-y-8"
        >
          {/* Section 1: Movie Distribution Agreement */}
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Film" size={20} className="text-primary" />
              Movie Distribution Agreement
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                By using this exhibitor portal, you agree to the terms and conditions of movie distribution 
                as outlined in your signed agreement with our distribution company. This includes but is not 
                limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Accurate reporting of show timings and audience attendance</li>
                <li>Timely submission of collection reports for all screenings</li>
                <li>Compliance with minimum show requirements as per your agreement</li>
                <li>Proper maintenance of screening equipment and facilities</li>
                <li>Adherence to content guidelines and certification requirements</li>
              </ul>
              <p>
                You acknowledge that any breach of these terms may result in termination of your 
                distribution agreement and legal action for damages incurred.
              </p>
            </div>
          </section>

          {/* Section 2: Collection Submission Policy */}
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="IndianRupee" size={20} className="text-primary" />
              Collection Submission Policy
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                All collection submissions must be accurate and submitted within the specified timeframes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Daily collections must be submitted within 24 hours of show completion</li>
                <li>All financial data must be verifiable with supporting documentation</li>
                <li>AC charges are fixed at ₹5 per person as per industry standards</li>
                <li>Any discrepancies in reported vs. actual collections will be investigated</li>
                <li>False reporting may result in immediate contract termination</li>
              </ul>
              <p>
                You agree to maintain detailed records of all transactions and provide access to 
                authorized personnel for audit purposes when requested.
              </p>
            </div>
          </section>

          {/* Section 3: Show Scheduling Requirements */}
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Calendar" size={20} className="text-primary" />
              Show Scheduling Requirements
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Proper scheduling and management of movie shows is essential for successful distribution:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Minimum 4 shows per day must be maintained for active movies</li>
                <li>Show timings must be clearly communicated and adhered to</li>
                <li>Any changes to scheduled shows must be reported immediately</li>
                <li>Cancellations require prior approval from the distribution team</li>
                <li>Holiday and special screening schedules must be coordinated in advance</li>
              </ul>
              <p>
                You understand that consistent scheduling helps maintain audience engagement and 
                maximizes revenue potential for all parties involved.
              </p>
            </div>
          </section>

          {/* Section 4: Payment Terms */}
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="CreditCard" size={20} className="text-primary" />
              Payment Terms and Settlement
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Payment processing and settlement terms are as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Revenue sharing will be calculated based on your signed agreement percentage</li>
                <li>Payments will be processed within 15 business days of collection approval</li>
                <li>All taxes and statutory deductions will be handled as per applicable laws</li>
                <li>Bank account details must be kept updated for smooth transactions</li>
                <li>Any payment disputes must be raised within 30 days of settlement</li>
              </ul>
              <p>
                You agree to the automated calculation of revenue shares and acknowledge that 
                all financial transactions will be recorded and made available for your review.
              </p>
            </div>
          </section>

          {/* Section 5: Data Privacy and Security */}
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Shield" size={20} className="text-primary" />
              Data Privacy and Security
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                Your privacy and data security are important to us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All data entered in this portal is encrypted and securely stored</li>
                <li>Financial information is protected with industry-standard security measures</li>
                <li>Access logs are maintained for audit and security purposes</li>
                <li>You are responsible for maintaining the confidentiality of your login credentials</li>
                <li>Any suspected security breaches must be reported immediately</li>
              </ul>
              <p>
                By using this portal, you consent to the collection and processing of necessary 
                business data for the purpose of movie distribution and financial settlement.
              </p>
            </div>
          </section>

          {/* Section 6: System Usage Guidelines */}
          <section>
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="Monitor" size={20} className="text-primary" />
              System Usage Guidelines
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                To ensure optimal system performance and data integrity:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use only authorized devices and networks to access the portal</li>
                <li>Do not share your login credentials with unauthorized personnel</li>
                <li>Report any technical issues or bugs to our support team</li>
                <li>Keep your browser updated for the best user experience</li>
                <li>Log out properly after each session to maintain security</li>
              </ul>
              <p>
                Misuse of the system or attempts to compromise its security will result in 
                immediate account suspension and potential legal action.
              </p>
            </div>
          </section>

          {/* Final Notice */}
          <div className="bg-muted/30 border border-border rounded-lg p-6 mt-8">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} className="text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Important Notice</h4>
                <p className="text-sm text-muted-foreground">
                  These terms and conditions constitute a legally binding agreement. By clicking "Accept", 
                  you acknowledge that you have read, understood, and agree to be bound by all the terms 
                  outlined above. If you do not agree with any part of these terms, please click "Decline" 
                  to exit the system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="w-5 h-5 text-primary border-2 border-border rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-foreground">
                I have read and agree to all the terms and conditions stated above
              </span>
            </label>
          </div>

          {!isScrolledToBottom && (
            <div className="flex items-center gap-2 mb-4 text-amber-600">
              <Icon name="ArrowDown" size={16} />
              <span className="text-sm">Please scroll to the bottom to enable the Accept button</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1"
            >
              <Icon name="X" size={16} className="mr-2" />
              Decline & Exit
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!canAccept}
              className="flex-1 bg-primary hover:bg-primary/80 disabled:bg-gray-400"
            >
              <Icon name="Check" size={16} className="mr-2" />
              Accept & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
