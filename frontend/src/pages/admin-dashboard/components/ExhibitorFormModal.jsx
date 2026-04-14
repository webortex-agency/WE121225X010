import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createExhibitorThunk, updateExhibitorThunk } from '../../../store/exhibitorsSlice';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import Modal from '../../../components/shared/Modal';

const ExhibitorFormModal = ({ exhibitor, onClose }) => {
  const dispatch = useDispatch();
  const isEditing = !!exhibitor;

  const [formData, setFormData] = useState({
    exhibitorName: '',
    cinemaName: '',
    location: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    status: 'active',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolder: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const indianCities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
    'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
    'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
    'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur', 'Amritsar', 'Raipur', 'Allahabad',
    'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Madurai', 'Guwahati', 'Chandigarh',
    'Hubli-Dharwad', 'Mysore', 'Tiruchirappalli', 'Bareilly', 'Aligarh', 'Tiruppur', 'Moradabad'
  ];

  useEffect(() => {
    if (exhibitor) {
      setFormData({
        exhibitorName: exhibitor.exhibitorName || '',
        cinemaName: exhibitor.cinemaName || '',
        location: exhibitor.location || '',
        address: exhibitor.address || '',
        contactPerson: exhibitor.contactPerson || '',
        email: exhibitor.email || '',
        phone: exhibitor.phone || '',
        username: exhibitor.username || '',
        password: exhibitor.password || '',
        status: exhibitor.status || 'active',
        bankDetails: {
          bankName: exhibitor.bankDetails?.bankName || '',
          accountNumber: exhibitor.bankDetails?.accountNumber || '',
          ifscCode: exhibitor.bankDetails?.ifscCode || '',
          accountHolder: exhibitor.bankDetails?.accountHolder || ''
        }
      });
      setShowBankDetails(!!exhibitor.bankDetails?.bankName);
    } else {
      // Generate credentials for new exhibitor
      generateCredentials();
    }
  }, [exhibitor]);

  const generateCredentials = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const namePrefix = formData.exhibitorName 
      ? formData.exhibitorName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 5)
      : 'exhib';
    
    const username = `exhibitor_${namePrefix}_${randomNum}`;
    const password = generatePassword();

    setFormData(prev => ({
      ...prev,
      username,
      password
    }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.exhibitorName.trim()) {
      newErrors.exhibitorName = 'Exhibitor name is required';
    } else if (formData.exhibitorName.length > 100) {
      newErrors.exhibitorName = 'Name must be less than 100 characters';
    }

    if (!formData.cinemaName.trim()) {
      newErrors.cinemaName = 'Cinema name is required';
    } else if (formData.cinemaName.length > 100) {
      newErrors.cinemaName = 'Cinema name must be less than 100 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+91\s\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid Indian phone number (+91 XXXXXXXXXX)';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto-generate credentials when exhibitor name changes (for new exhibitors only)
    if (name === 'exhibitorName' && !isEditing && value.trim()) {
      setTimeout(() => {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const namePrefix = value.toLowerCase().replace(/[^a-z]/g, '').substring(0, 5);
        const username = `exhibitor_${namePrefix}_${randomNum}`;
        
        setFormData(prev => ({
          ...prev,
          username
        }));
      }, 500);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Auto-format phone number
    if (!value.startsWith('+91 ') && value.length > 0) {
      value = '+91 ' + value.replace(/^\+91\s?/, '');
    }
    
    // Remove non-digits except +91 prefix
    const digits = value.replace(/^\+91\s/, '').replace(/\D/g, '');
    if (digits.length <= 10) {
      value = '+91 ' + digits;
    }
    
    setFormData(prev => ({ ...prev, phone: value }));
    
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleStatusChange = (status) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const exhibitorData = {
        name: formData.exhibitorName,
        theater_location: `${formData.cinemaName}, ${formData.location}`,
        contact: formData.phone,
        email: formData.email,
        status: formData.status,
        bank_details: formData.bankDetails,
        login_credentials: {
          email: formData.email,
          password_hash: formData.password,
        },
      };

      if (isEditing) {
        await dispatch(updateExhibitorThunk({ id: exhibitor._id || exhibitor.id, data: exhibitorData })).unwrap();
      } else {
        await dispatch(createExhibitorThunk(exhibitorData)).unwrap();
      }

      onClose();
    } catch (error) {
      console.error('Error saving exhibitor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEditing ? 'Edit Exhibitor' : 'Add New Exhibitor'} size="lg">
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Exhibitor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Exhibitor Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Exhibitor Name *"
                name="exhibitorName"
                value={formData.exhibitorName}
                onChange={handleInputChange}
                error={errors.exhibitorName}
                placeholder="Enter exhibitor name"
                disabled={isSubmitting}
              />
              
              <Input
                label="Cinema Name *"
                name="cinemaName"
                value={formData.cinemaName}
                onChange={handleInputChange}
                error={errors.cinemaName}
                placeholder="Enter cinema name"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City/Location *
                </label>
                <select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="">Select a city</option>
                  {indianCities.map((city) => (
                    <option key={city} value={`${city}, India`}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <p className="mt-1 text-sm text-destructive">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter full address (optional)"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Contact Person Name *"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleInputChange}
                error={errors.contactPerson}
                placeholder="Enter contact person name"
                disabled={isSubmitting}
              />
              
              <Input
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="Enter email address"
                disabled={isSubmitting}
              />

              <Input
                label="Phone Number *"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                error={errors.phone}
                placeholder="+91 XXXXXXXXXX"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Login Credentials {!isEditing && '(Auto-Generated)'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  error={errors.username}
                  disabled={isSubmitting}
                  readOnly={!isEditing}
                />
                {!isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateCredentials}
                    className="mt-2"
                    disabled={isSubmitting}
                  >
                    Regenerate
                  </Button>
                )}
              </div>
              
              <div>
                <Input
                  label="Initial Password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  disabled={isSubmitting}
                  readOnly={!isEditing}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData(prev => ({ ...prev, password: generatePassword() }))}
                  className="mt-2"
                  disabled={isSubmitting}
                >
                  Generate New
                </Button>
              </div>
            </div>

            {!isEditing && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Password Note:</p>
                    <p>Share these credentials with the exhibitor. They can change the password on first login.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bank Details (Optional) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-foreground">Bank Account Details</h3>
              <button
                type="button"
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="text-sm text-primary hover:text-primary/80"
              >
                {showBankDetails ? 'Hide' : 'Show'} Details
              </button>
            </div>
            
            {showBankDetails && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Bank Name"
                  name="bankDetails.bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleInputChange}
                  placeholder="Enter bank name"
                  disabled={isSubmitting}
                />
                
                <Input
                  label="Account Number"
                  name="bankDetails.accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                  disabled={isSubmitting}
                />

                <Input
                  label="IFSC Code"
                  name="bankDetails.ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code"
                  disabled={isSubmitting}
                />

                <Input
                  label="Account Holder Name"
                  name="bankDetails.accountHolder"
                  value={formData.bankDetails.accountHolder}
                  onChange={handleInputChange}
                  placeholder="Enter account holder name"
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Status</h3>
            <div className="flex gap-4">
              {['active', 'inactive'].map((status) => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={formData.status === status}
                    onChange={() => handleStatusChange(status)}
                    disabled={isSubmitting}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="text-sm text-foreground capitalize">{status}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName={isEditing ? "Save" : "Plus"}
              iconPosition="left"
              className="flex-1"
            >
              {isSubmitting
                ? (isEditing ? 'Updating...' : 'Creating...')
                : (isEditing ? 'Update Exhibitor' : 'Create Exhibitor')
              }
            </Button>
          </div>
        </form>
    </Modal>
  );
};

export default ExhibitorFormModal;
