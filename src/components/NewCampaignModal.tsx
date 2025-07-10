import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Phone, 
  Globe, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Workflow,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  User,
  Target
} from 'lucide-react';
import { TimePicker } from './TimePicker';
import { DatePicker } from './DatePicker';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface ScheduleDay {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface FormData {
  name: string;
  ivr: string;
  phoneNumber: string;
  startDate: string;
  endDate: string;
  schedule: Record<string, ScheduleDay>;
  timezone: string;
  maxTries: number;
  retryInterval: string;
  concurrency: number;
}

interface PhoneNumber {
  id: string;
  number: string;
  formatted: string;
  countryCode: string;
  flag: string;
  status: 'active' | 'inactive' | 'unverified';
}

const STEPS = [
  {
    id: 1,
    title: 'Basic Information',
    description: 'Campaign name and contact details',
    icon: <User className="w-5 h-5" />
  },
  {
    id: 2,
    title: 'Configuration',
    description: 'Schedule and calling settings',
    icon: <Settings className="w-5 h-5" />
  },
  {
    id: 3,
    title: 'Review & Create',
    description: 'Confirm your campaign settings',
    icon: <CheckCircle className="w-5 h-5" />
  }
];

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon', dayIndex: 1 },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue', dayIndex: 2 },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed', dayIndex: 3 },
  { key: 'thursday', label: 'Thursday', short: 'Thu', dayIndex: 4 },
  { key: 'friday', label: 'Friday', short: 'Fri', dayIndex: 5 },
  { key: 'saturday', label: 'Saturday', short: 'Sat', dayIndex: 6 },
  { key: 'sunday', label: 'Sunday', short: 'Sun', dayIndex: 0 }
];

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: -5 },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: -6 },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: -8 },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: 0 },
  { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: 1 },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 9 },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)', offset: 11 }
];

const IVR_OPTIONS = [
  'DefaultIVR1658315753',
  'PhonebotElevenlabs5',
  'PhonebotElevenlabs3',
  'AccountWorkingHours',
  'DefaultClient'
];

const PHONE_NUMBERS: PhoneNumber[] = [
  {
    id: '1',
    number: '12029514012',
    formatted: '12029514012',
    countryCode: 'US',
    flag: '🇺🇸',
    status: 'active'
  },
  {
    id: '2',
    number: '12134234050',
    formatted: '12134234050',
    countryCode: 'US',
    flag: '🇺🇸',
    status: 'active'
  },
  {
    id: '3',
    number: '20221604225',
    formatted: '20221604225',
    countryCode: 'EG',
    flag: '🇪🇬',
    status: 'active'
  },
  {
    id: '4',
    number: '441617681737',
    formatted: '441617681737',
    countryCode: 'GB',
    flag: '🇬🇧',
    status: 'active'
  },
  {
    id: '5',
    number: '447418319716',
    formatted: '447418319716',
    countryCode: 'GB',
    flag: '🇬🇧',
    status: 'active'
  }
];

// Helper functions
const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'America/New_York';
  }
};

const getCurrentTimeInTimezone = (timezone: string): string => {
  try {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const formatTo12Hour = (time24: string): string => {
  if (!time24 || !time24.includes(':')) return time24;
  
  const [hours, minutes] = time24.split(':');
  const hour24 = parseInt(hours, 10);
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  
  return `${hour12}:${minutes} ${period}`;
};

const convertTo24Hour = (time12: string): string => {
  if (!time12 || !time12.includes(':')) return time12;
  
  const [time, period] = time12.split(' ');
  const [hours, minutes] = time.split(':');
  let hour24 = parseInt(hours, 10);
  
  if (period === 'PM' && hour24 !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hour24 === 12) {
    hour24 = 0;
  }
  
  return `${hour24.toString().padStart(2, '0')}:${minutes}`;
};

const formatDateForDisplay = (dateString: string): string => {
  if (!dateString) return '—';
  
  try {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    ivr: '',
    phoneNumber: '1',
    startDate: '',
    endDate: '',
    schedule: WEEKDAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { enabled: true, startTime: '09:00', endTime: '17:00' }
    }), {}),
    timezone: getUserTimezone(),
    maxTries: 1,
    retryInterval: '00:00:00',
    concurrency: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});
  const [selectedTimezone, setSelectedTimezone] = useState<string>(getUserTimezone());
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  const [isPhoneNumberDropdownOpen, setIsPhoneNumberDropdownOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Update current times for timezones
  useEffect(() => {
    const updateTimes = () => {
      const times: Record<string, string> = {};
      TIMEZONES.forEach(tz => {
        times[tz.value] = getCurrentTimeInTimezone(tz.value);
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 60000);
    return () => clearInterval(interval);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setErrors({});
      setIsAdvancedOpen(false);
      setFormData({
        name: '',
        ivr: '',
        phoneNumber: '1',
        startDate: '',
        endDate: '',
        schedule: WEEKDAYS.reduce((acc, day) => ({
          ...acc,
          [day.key]: { enabled: true, startTime: '09:00', endTime: '17:00' }
        }), {}),
        timezone: getUserTimezone(),
        maxTries: 1,
        retryInterval: '00:00:00',
        concurrency: 1
      });
      setSelectedTimezone(getUserTimezone());
    }
  }, [isOpen]);

  // Validation functions
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Campaign name is required';
      }
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number selection is required';
      }
    }

    if (step === 2) {
      if (!formData.ivr) {
        newErrors.ivr = 'IVR selection is required';
      }

      if (formData.maxTries < 1 || formData.maxTries > 10) {
        newErrors.maxTries = 'Maximum tries must be between 1 and 10';
      }

      if (formData.concurrency < 1 || formData.concurrency > 100) {
        newErrors.concurrency = 'Concurrency must be between 1 and 100';
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
      if (!timeRegex.test(formData.retryInterval)) {
        newErrors.retryInterval = 'Invalid time format. Use HH:MM:SS (00:00:00 to 23:59:59)';
      }

      const hasEnabledDays = Object.values(formData.schedule).some(day => day.enabled);
      if (!hasEnabledDays) {
        newErrors.schedule = 'At least one day must be selected';
      }

      Object.entries(formData.schedule).forEach(([dayKey, day]) => {
        if (day.enabled) {
          const startTime = new Date(`2000-01-01T${day.startTime}:00`);
          const endTime = new Date(`2000-01-01T${day.endTime}:00`);
          
          if (startTime >= endTime) {
            newErrors[`schedule-${dayKey}`] = 'End time must be after start time';
          }
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation functions
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(2)) {
      onSubmit(formData);
      onClose();
    }
  };

  // Event handlers
  const handleScheduleChange = (dayKey: string, field: keyof ScheduleDay, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [dayKey]: {
          ...prev.schedule[dayKey],
          [field]: value
        }
      }
    }));
    
    if (errors[`schedule-${dayKey}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`schedule-${dayKey}`];
        return newErrors;
      });
    }
  };

  const handleTimezoneSelect = (timezone: string) => {
    setSelectedTimezone(timezone);
    setFormData(prev => ({ ...prev, timezone }));
    setIsTimezoneDropdownOpen(false);
  };

  const handlePhoneNumberSelect = (phoneNumberId: string) => {
    setFormData(prev => ({ ...prev, phoneNumber: phoneNumberId }));
    setIsPhoneNumberDropdownOpen(false);
  };

  // Get selected phone number
  const selectedPhoneNumber = PHONE_NUMBERS.find(phone => phone.id === formData.phoneNumber);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.timezone-dropdown-container')) {
        setIsTimezoneDropdownOpen(false);
      }
      if (!target.closest('.phone-number-dropdown-container')) {
        setIsPhoneNumberDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Time Slot Input Component
  const TimeSlotInput: React.FC<{
    dayKey: string;
    type: 'start' | 'end';
    value: string;
    enabled: boolean;
    onChange: (value: string) => void;
  }> = ({ dayKey, type, value, enabled, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleTimeChange = (newTime: string) => {
      const time24 = convertTo24Hour(newTime);
      onChange(time24);
      setIsOpen(false);
    };

    const commonTimes = [
      '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
      '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
      '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
    ];

    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => enabled && setIsOpen(!isOpen)}
          disabled={!enabled}
          className={`
            w-36 px-4 py-3 text-sm border rounded-lg transition-all duration-200 text-left
            ${enabled 
              ? 'border-gray-300 bg-white text-gray-900 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 cursor-pointer' 
              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
            }
            ${errors[`schedule-${dayKey}`] ? 'border-red-300' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {formatTo12Hour(value)}
            </span>
            {enabled && (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>

        {isOpen && enabled && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 px-2">
                {type === 'start' ? 'Start Time' : 'End Time'}
              </div>
              <div className="space-y-1">
                {commonTimes.map(time => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeChange(time)}
                    className={`
                      w-full px-3 py-2 text-left text-sm rounded hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200
                      ${formatTo12Hour(value) === time ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Step Progress Component
  const StepProgress: React.FC = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200
              ${currentStep >= step.id 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white border-gray-300 text-gray-400'
              }
            `}>
              {currentStep > step.id ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">
                {step.description}
              </div>
            </div>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`
              flex-1 h-0.5 mx-6 transition-all duration-200
              ${currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  );

  // Step Content Components
  const Step1Content: React.FC = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-heading-2 mb-2">Basic Information</h3>
        <p className="text-body-small">Let's start with the essential details for your campaign</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="campaign-name" className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Name *
          </label>
          <input
            id="campaign-name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="form-input"
            placeholder="Enter a descriptive name for your campaign"
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Choose a name that helps you identify this campaign easily
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-1" />
              Outbound Caller ID *
              <div className="relative ml-2 group">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  This number will appear as the caller ID to recipients
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </label>
          <div className="relative phone-number-dropdown-container">
            <button
              type="button"
              onClick={() => setIsPhoneNumberDropdownOpen(!isPhoneNumberDropdownOpen)}
              className={`w-full form-input text-left flex items-center justify-between ${
                errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
              }`}
              aria-describedby={errors.phoneNumber ? "phone-number-error" : undefined}
            >
              <div className="flex items-center">
                <span className={selectedPhoneNumber ? 'text-gray-900' : 'text-gray-400'}>
                  {selectedPhoneNumber ? (
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{selectedPhoneNumber.flag}</span>
                      <span className="font-medium">{selectedPhoneNumber.formatted}</span>
                    </div>
                  ) : (
                    'Select phone number'
                  )}
                </span>
              </div>
              {isPhoneNumberDropdownOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {isPhoneNumberDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {PHONE_NUMBERS.map((phone, index) => (
                  <button
                    key={phone.id}
                    type="button"
                    onClick={() => handlePhoneNumberSelect(phone.id)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors duration-200 ${
                      index !== PHONE_NUMBERS.length - 1 ? 'border-b border-gray-100' : ''
                    } ${
                      formData.phoneNumber === phone.id ? 'bg-blue-50 text-blue-700' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{phone.flag}</span>
                      <span className="font-medium">{phone.formatted}</span>
                    </div>
                    {formData.phoneNumber === phone.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.phoneNumber && <p id="phone-number-error" className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
          <p className="text-xs text-gray-500 mt-1">
            This number will be displayed to call recipients as the caller ID
          </p>
        </div>
      </div>
    </div>
  );

  const Step2Content: React.FC = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-heading-2 mb-2">Configuration</h3>
        <p className="text-body-small">Set up your campaign schedule and calling preferences</p>
      </div>

      {/* Campaign Settings */}
      <div className="space-y-6">
        <h4 className="text-heading-3 flex items-center">
          <Workflow className="w-5 h-5 mr-2 text-blue-600" />
          Campaign Settings
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ivr-select" className="block text-sm font-medium text-gray-700 mb-2">
              IVR *
            </label>
            <select
              id="ivr-select"
              value={formData.ivr}
              onChange={(e) => setFormData(prev => ({ ...prev, ivr: e.target.value }))}
              className="form-select"
              aria-describedby={errors.ivr ? "ivr-error" : undefined}
            >
              <option value="">Select IVR</option>
              {IVR_OPTIONS.map(ivr => (
                <option key={ivr} value={ivr}>{ivr}</option>
              ))}
            </select>
            {errors.ivr && <p id="ivr-error" className="text-red-500 text-sm mt-1">{errors.ivr}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Interactive Voice Response system for call handling
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Timezone
            </label>
            <div className="relative timezone-dropdown-container">
              <button
                type="button"
                onClick={() => setIsTimezoneDropdownOpen(!isTimezoneDropdownOpen)}
                className="w-full form-input text-left flex items-center justify-between"
              >
                <span>
                  {TIMEZONES.find(tz => tz.value === selectedTimezone)?.label || selectedTimezone}
                  {currentTimes[selectedTimezone] && (
                    <span className="ml-2 text-gray-500 font-mono">
                      ({currentTimes[selectedTimezone]})
                    </span>
                  )}
                </span>
                {isTimezoneDropdownOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isTimezoneDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {TIMEZONES.map(timezone => (
                    <button
                      key={timezone.value}
                      type="button"
                      onClick={() => handleTimezoneSelect(timezone.value)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                        selectedTimezone === timezone.value ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      <span>{timezone.label}</span>
                      <span className="text-gray-500 font-mono text-sm">
                        {currentTimes[timezone.value]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Configuration */}
      <div className="space-y-6">
        <h4 className="text-heading-3 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Schedule Configuration
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <DatePicker
              value={formData.startDate}
              onChange={(value) => setFormData(prev => ({ ...prev, startDate: value }))}
              label="Start Date"
              helperText="When should the campaign begin?"
              minDate={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <DatePicker
              value={formData.endDate}
              onChange={(value) => setFormData(prev => ({ ...prev, endDate: value }))}
              label="End Date"
              helperText="When should the campaign end?"
              minDate={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 inline mr-1" />
            Weekly Schedule
          </label>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {WEEKDAYS.map(day => (
                <div key={day.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-[120px]">
                      <input
                        type="checkbox"
                        id={`schedule-${day.key}`}
                        checked={formData.schedule[day.key].enabled}
                        onChange={(e) => handleScheduleChange(day.key, 'enabled', e.target.checked)}
                        className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 text-blue-600 cursor-pointer"
                      />
                      <label 
                        htmlFor={`schedule-${day.key}`} 
                        className={`ml-3 text-sm font-medium select-none cursor-pointer ${
                          formData.schedule[day.key].enabled
                            ? 'text-gray-900'
                            : 'text-gray-600'
                        }`}
                      >
                        {day.label}
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <TimeSlotInput
                        dayKey={day.key}
                        type="start"
                        value={formData.schedule[day.key].startTime}
                        enabled={formData.schedule[day.key].enabled}
                        onChange={(value) => handleScheduleChange(day.key, 'startTime', value)}
                      />
                      
                      <span className="text-gray-400 text-sm font-medium px-2">to</span>
                      
                      <TimeSlotInput
                        dayKey={day.key}
                        type="end"
                        value={formData.schedule[day.key].endTime}
                        enabled={formData.schedule[day.key].enabled}
                        onChange={(value) => handleScheduleChange(day.key, 'endTime', value)}
                      />
                    </div>
                  </div>
                  
                  {errors[`schedule-${day.key}`] && (
                    <p className="text-red-500 text-xs ml-7">{errors[`schedule-${day.key}`]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {errors.schedule && <p className="text-red-500 text-sm">{errors.schedule}</p>}
        </div>
      </div>

      {/* Advanced Configuration */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
        >
          <div className="flex items-center">
            <Settings className="w-5 h-5 mr-3 text-gray-600" />
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-900">Advanced Configuration</h4>
              <p className="text-xs text-gray-500">Retry settings and concurrency options</p>
            </div>
          </div>
          {isAdvancedOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isAdvancedOpen && (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="max-tries" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Tries
                </label>
                <input
                  id="max-tries"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxTries}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxTries: parseInt(e.target.value) || 1 }))}
                  className="form-input"
                  aria-describedby={errors.maxTries ? "max-tries-error" : undefined}
                />
                {errors.maxTries && <p id="max-tries-error" className="text-red-500 text-sm mt-1">{errors.maxTries}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Number of call attempts per contact
                </p>
              </div>

              <div>
                <TimePicker
                  value={formData.retryInterval}
                  onChange={(value) => setFormData(prev => ({ ...prev, retryInterval: value }))}
                  label="Retry Interval"
                  error={errors.retryInterval}
                  helperText="Time to wait between retry attempts"
                />
              </div>
            </div>

            <div>
              <label htmlFor="concurrency" className="block text-sm font-medium text-gray-700 mb-2">
                Concurrency
              </label>
              <input
                id="concurrency"
                type="number"
                min="1"
                max="100"
                value={formData.concurrency}
                onChange={(e) => setFormData(prev => ({ ...prev, concurrency: parseInt(e.target.value) || 1 }))}
                className="form-input"
                aria-describedby={errors.concurrency ? "concurrency-error" : undefined}
              />
              {errors.concurrency && <p id="concurrency-error" className="text-red-500 text-sm mt-1">{errors.concurrency}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Maximum simultaneous calls (1-100)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const Step3Content: React.FC = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-heading-2 mb-2">Review & Create</h3>
        <p className="text-body-small">Please review your campaign settings before creating</p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-heading-3 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Campaign Name</label>
              <p className="text-base text-gray-900 mt-1">{formData.name || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Caller ID</label>
              <p className="text-base text-gray-900 mt-1">
                {selectedPhoneNumber ? (
                  <span className="flex items-center">
                    <span className="mr-2">{selectedPhoneNumber.flag}</span>
                    {selectedPhoneNumber.formatted}
                  </span>
                ) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Campaign Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-heading-3 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Campaign Configuration
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">IVR</label>
              <p className="text-base text-gray-900 mt-1">{formData.ivr || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timezone</label>
              <p className="text-base text-gray-900 mt-1">
                {TIMEZONES.find(tz => tz.value === formData.timezone)?.label || formData.timezone}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Start Date</label>
              <p className="text-base text-gray-900 mt-1">
                {formData.startDate ? formatDateForDisplay(formData.startDate) : '—'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">End Date</label>
              <p className="text-base text-gray-900 mt-1">
                {formData.endDate ? formatDateForDisplay(formData.endDate) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-heading-3 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Weekly Schedule
          </h4>
          <div className="space-y-2">
            {WEEKDAYS.map(day => {
              const daySchedule = formData.schedule[day.key];
              return (
                <div key={day.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <span className={`text-sm font-medium ${
                    daySchedule.enabled ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.label}
                  </span>
                  <span className={`text-sm ${
                    daySchedule.enabled ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {daySchedule.enabled 
                      ? `${formatTo12Hour(daySchedule.startTime)} - ${formatTo12Hour(daySchedule.endTime)}`
                      : 'Disabled'
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Advanced Settings (if configured) */}
        {(formData.maxTries > 1 || formData.retryInterval !== '00:00:00' || formData.concurrency > 1) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-heading-3 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              Advanced Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Maximum Tries</label>
                <p className="text-base text-gray-900 mt-1">{formData.maxTries}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Retry Interval</label>
                <p className="text-base text-gray-900 mt-1">{formData.retryInterval}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Concurrency</label>
                <p className="text-base text-gray-900 mt-1">{formData.concurrency}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-heading-2">Create New Campaign</h2>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            <StepProgress />
            
            {currentStep === 1 && <Step1Content />}
            {currentStep === 2 && <Step2Content />}
            {currentStep === 3 && <Step3Content />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>
          
          <div className="flex items-center space-x-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  currentStep > index + 1 
                    ? 'bg-blue-600' 
                    : currentStep === index + 1 
                      ? 'bg-blue-400' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex items-center"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary flex items-center"
            >
              <Target className="w-4 h-4 mr-2" />
              Create Campaign
            </button>
          )}
        </div>
      </div>
    </div>
  );
};