import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { setTourCompleted, selectTourCompleted } from '../../../store/exhibitorScheduleSlice';

const DashboardTour = ({ isActive, onTourComplete }) => {
  const dispatch = useDispatch();
  const tourCompleted = useSelector(selectTourCompleted);
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      target: '.tour-welcome',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Welcome to Your Exhibitor Dashboard!</h3>
          <p>This tour will guide you through the key features of your new dashboard. Let's get started!</p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-movie-sidebar',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Assigned Movies</h3>
          <p>Here you'll find all movies assigned to your cinema. You can drag these movies to schedule shows throughout the week.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-schedule-grid',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Weekly Schedule Grid</h3>
          <p>This is your main scheduling area. Drag movies from the sidebar and drop them into time slots to create your weekly schedule.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.tour-week-navigation',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Week Navigation</h3>
          <p>Use these controls to navigate between different weeks and manage your schedule across multiple time periods.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-quick-actions',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <p>Access frequently used features like saving your schedule, clearing the week, or copying from the previous week.</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '.tour-schedule-summary',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Schedule Summary</h3>
          <p>View important statistics about your current week's schedule, including total shows and estimated collections.</p>
        </div>
      ),
      placement: 'left',
    },
    {
      target: '.tour-navigation',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Main Navigation</h3>
          <p>Use the navigation bar to access different sections: Collections for submitting reports, Ledger for financial history, and Profile for account settings.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-drag-drop-hint',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">Drag & Drop Scheduling</h3>
          <p>
            <strong>Pro Tips:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Drag movies from the sidebar to empty time slots</li>
              <li>You can schedule the same movie multiple times</li>
              <li>Drag between time slots to reschedule</li>
              <li>Click on scheduled movies to edit show details</li>
            </ul>
          </p>
        </div>
      ),
      placement: 'center',
    },
    {
      target: '.tour-completion',
      content: (
        <div>
          <h3 className="text-lg font-semibold mb-2">You're All Set!</h3>
          <p>You've completed the dashboard tour. You can always restart this tour from the help menu. Start scheduling your movies and managing your cinema efficiently!</p>
        </div>
      ),
      placement: 'center',
    },
  ];

  useEffect(() => {
    if (isActive && !tourCompleted) {
      setRun(true);
    }
  }, [isActive, tourCompleted]);

  const handleJoyrideCallback = (data) => {
    const { action, index, status, type } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      dispatch(setTourCompleted(true));
      onTourComplete();
    }
  };

  const handleSkipTour = () => {
    setRun(false);
    dispatch(setTourCompleted(true));
    onTourComplete();
  };

  const handleRestartTour = () => {
    setStepIndex(0);
    setRun(true);
  };

  // Custom styles for the tour
  const joyrideStyles = {
    options: {
      primaryColor: '#0d9488', // teal-600
      backgroundColor: '#ffffff',
      textColor: '#374151',
      overlayColor: 'rgba(0, 0, 0, 0.6)',
      spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
      beaconSize: 36,
      zIndex: 10000,
    },
    tooltip: {
      fontSize: '14px',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    },
    tooltipContainer: {
      textAlign: 'left',
    },
    tooltipTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#111827',
    },
    tooltipContent: {
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#6b7280',
    },
    buttonNext: {
      backgroundColor: '#0d9488',
      borderRadius: '6px',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
      border: 'none',
      cursor: 'pointer',
    },
    buttonBack: {
      backgroundColor: 'transparent',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      color: '#6b7280',
      fontSize: '14px',
      fontWeight: '500',
      padding: '8px 16px',
      cursor: 'pointer',
      marginRight: '8px',
    },
    buttonSkip: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#9ca3af',
      fontSize: '14px',
      cursor: 'pointer',
      padding: '8px',
    },
    buttonClose: {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#9ca3af',
      fontSize: '16px',
      cursor: 'pointer',
      padding: '4px',
      position: 'absolute',
      right: '8px',
      top: '8px',
    },
    spotlight: {
      borderRadius: '4px',
    },
  };

  return (
    <>
      <Joyride
        callback={handleJoyrideCallback}
        continuous={true}
        run={run}
        scrollToFirstStep={true}
        showProgress={true}
        showSkipButton={true}
        steps={steps}
        stepIndex={stepIndex}
        styles={joyrideStyles}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish Tour',
          next: 'Next',
          skip: 'Skip Tour',
        }}
        floaterProps={{
          disableAnimation: false,
        }}
      />

      {/* Tour Control Buttons (for restarting tour) */}
      {tourCompleted && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleRestartTour}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-colors"
            title="Restart Dashboard Tour"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Help Tour
          </button>
        </div>
      )}
    </>
  );
};

export default DashboardTour;
