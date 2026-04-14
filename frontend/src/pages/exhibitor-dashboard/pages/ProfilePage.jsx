import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setTourCompleted } from '../../../store/exhibitorScheduleSlice';
import RoleBasedNavigation from '../../../components/ui/RoleBasedNavigation';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import LoadingSpinner from '../../../components/shared/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { getMe, updateMe } from '../../../utils/api';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm();

  // Load profile from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const user = await getMe();
        const prefs = user.preferences || {};
        const merged = {
          ownerName: user.name || '',
          email: user.email || '',
          phone: prefs.phone || '',
          address: prefs.address || '',
          cinemaName: prefs.cinemaName || '',
          licenseNumber: prefs.licenseNumber || '',
          totalScreens: prefs.totalScreens || '',
          totalSeats: prefs.totalSeats || '',
          establishedYear: prefs.establishedYear || '',
          gstNumber: prefs.gstNumber || '',
          panNumber: prefs.panNumber || '',
          bankAccount: prefs.bankAccount || '',
          bankName: prefs.bankName || '',
          ifscCode: prefs.ifscCode || '',
        };
        setProfileData(merged);
        reset(merged);
      } catch {
        // fallback — show empty form
        setProfileData({});
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateMe({
        name: data.ownerName,
        email: data.email,
        preferences: {
          phone: data.phone,
          address: data.address,
          cinemaName: data.cinemaName,
          licenseNumber: data.licenseNumber,
          totalScreens: data.totalScreens,
          totalSeats: data.totalSeats,
          establishedYear: data.establishedYear,
          gstNumber: data.gstNumber,
          panNumber: data.panNumber,
          bankAccount: data.bankAccount,
          bankName: data.bankName,
          ifscCode: data.ifscCode,
        },
      });
      setProfileData(data);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    reset(profileData || {});
    setIsEditing(false);
    setSaveError(null);
  };

  if (profileData === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner label="Loading profile…" />
      </div>
    );
  }

  const handleResetTour = () => {
    dispatch(setTourCompleted(false));
    localStorage.removeItem('exhibitorTourCompleted');
    alert('Dashboard tour has been reset. You will see the tour again on your next visit to the dashboard.');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: 'User' },
    { id: 'cinema', label: 'Cinema Details', icon: 'Building2' },
    { id: 'financial', label: 'Financial Information', icon: 'CreditCard' },
    { id: 'preferences', label: 'Preferences', icon: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedNavigation userRole="exhibitor" />
      
      <div className="container mx-auto px-6 py-8 pt-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary rounded-lg flex items-center justify-center">
              <Icon name="Settings" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Profile & Settings</h1>
              <p className="text-muted-foreground">Manage your account information and preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${activeTab === tab.id 
                        ? 'bg-primary/10 text-primary border border-primary/20' 
                        : 'text-muted-foreground hover:bg-muted/20 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon name={tab.icon} size={16} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-card border border-border rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleResetTour}
                >
                  <Icon name="RotateCcw" size={16} className="mr-2" />
                  Reset Dashboard Tour
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => navigate('/exhibitor/dashboard')}
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg">
              {/* Tab Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon name={tabs.find(t => t.id === activeTab)?.icon} size={20} className="text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">
                      {tabs.find(t => t.id === activeTab)?.label}
                    </h2>
                  </div>
                  
                  {activeTab !== 'preferences' && (
                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <>
                          {saveError && (
                            <p className="text-sm text-destructive">{saveError}</p>
                          )}
                          <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={!isDirty || saving}
                            loading={saving}
                          >
                            <Icon name="Save" size={16} className="mr-2" />
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>
                          <Icon name="Edit" size={16} className="mr-2" />
                          Edit Information
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <ProfileTab 
                    profileData={profileData}
                    isEditing={isEditing}
                    register={register}
                    errors={errors}
                  />
                )}
                
                {activeTab === 'cinema' && (
                  <CinemaTab 
                    profileData={profileData}
                    isEditing={isEditing}
                    register={register}
                    errors={errors}
                  />
                )}
                
                {activeTab === 'financial' && (
                  <FinancialTab 
                    profileData={profileData}
                    isEditing={isEditing}
                    register={register}
                    errors={errors}
                  />
                )}
                
                {activeTab === 'preferences' && (
                  <PreferencesTab />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileTab = ({ profileData, isEditing, register, errors }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Owner Name</label>
        {isEditing ? (
          <Input
            {...register('ownerName', { required: 'Owner name is required' })}
            error={errors.ownerName?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.ownerName}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
        {isEditing ? (
          <Input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            error={errors.email?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.email}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
        {isEditing ? (
          <Input
            {...register('phone', { required: 'Phone number is required' })}
            error={errors.phone?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.phone}
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">Address</label>
        {isEditing ? (
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            {...register('address', { required: 'Address is required' })}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.address}
          </div>
        )}
        {errors.address && (
          <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
        )}
      </div>
    </div>
  </div>
);

const CinemaTab = ({ profileData, isEditing, register, errors }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Cinema Name</label>
        {isEditing ? (
          <Input
            {...register('cinemaName', { required: 'Cinema name is required' })}
            error={errors.cinemaName?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.cinemaName}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">License Number</label>
        {isEditing ? (
          <Input
            {...register('licenseNumber', { required: 'License number is required' })}
            error={errors.licenseNumber?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.licenseNumber}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Total Screens</label>
        {isEditing ? (
          <Input
            type="number"
            min="1"
            {...register('totalScreens', { required: 'Total screens is required' })}
            error={errors.totalScreens?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.totalScreens}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Total Seats</label>
        {isEditing ? (
          <Input
            type="number"
            min="1"
            {...register('totalSeats', { required: 'Total seats is required' })}
            error={errors.totalSeats?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.totalSeats}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Established Year</label>
        {isEditing ? (
          <Input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            {...register('establishedYear', { required: 'Established year is required' })}
            error={errors.establishedYear?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.establishedYear}
          </div>
        )}
      </div>
    </div>
  </div>
);

const FinancialTab = ({ profileData, isEditing, register, errors }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">GST Number</label>
        {isEditing ? (
          <Input
            {...register('gstNumber', { required: 'GST number is required' })}
            error={errors.gstNumber?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground font-mono">
            {profileData.gstNumber}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">PAN Number</label>
        {isEditing ? (
          <Input
            {...register('panNumber', { required: 'PAN number is required' })}
            error={errors.panNumber?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground font-mono">
            {profileData.panNumber}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Bank Account Number</label>
        {isEditing ? (
          <Input
            {...register('bankAccount', { required: 'Bank account number is required' })}
            error={errors.bankAccount?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground font-mono">
            {profileData.bankAccount}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
        {isEditing ? (
          <Input
            {...register('bankName', { required: 'Bank name is required' })}
            error={errors.bankName?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground">
            {profileData.bankName}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">IFSC Code</label>
        {isEditing ? (
          <Input
            {...register('ifscCode', { required: 'IFSC code is required' })}
            error={errors.ifscCode?.message}
          />
        ) : (
          <div className="px-3 py-2 bg-muted/20 rounded-lg text-foreground font-mono">
            {profileData.ifscCode}
          </div>
        )}
      </div>
    </div>
  </div>
);

const PreferencesTab = () => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    autoSaveSchedule: true,
    showTutorials: true
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // In real app, this would save to backend
    localStorage.setItem('exhibitorPreferences', JSON.stringify({ ...preferences, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-foreground">Email Notifications</label>
              <p className="text-sm text-muted-foreground">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-foreground">SMS Notifications</label>
              <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => handlePreferenceChange('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Report Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-foreground">Weekly Reports</label>
              <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.weeklyReports}
                onChange={(e) => handlePreferenceChange('weeklyReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-foreground">Monthly Reports</label>
              <p className="text-sm text-muted-foreground">Receive monthly financial summaries</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.monthlyReports}
                onChange={(e) => handlePreferenceChange('monthlyReports', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">Dashboard Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-foreground">Auto-save Schedule</label>
              <p className="text-sm text-muted-foreground">Automatically save schedule changes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.autoSaveSchedule}
                onChange={(e) => handlePreferenceChange('autoSaveSchedule', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-foreground">Show Tutorials</label>
              <p className="text-sm text-muted-foreground">Display helpful tutorials and tips</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.showTutorials}
                onChange={(e) => handlePreferenceChange('showTutorials', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
