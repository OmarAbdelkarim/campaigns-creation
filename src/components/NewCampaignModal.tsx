import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, Clock, Phone, Globe, ChevronDown, ChevronUp, Info, Workflow, ChevronLeft, ChevronRight, AlertCircle, Settings } from 'lucide-react';
import { TimeInput } from './TimeInput';
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

interface PhoneNumber {
  id: string;
  number: string;
  formatted: string;
  countryCode: string;
  flag: string;
  status: 'active' | 'inactive' | 'unverified';
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
  groupName: string;
  concurrentCallsPerAgent: number;
}

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

const GROUP_NAMES = [
  'Sales Team',
  'Support Team',
  'Marketing Team',
  'Customer Success',
  'Lead Generation',
  'Follow-up Team',
  'Premium Support',
  'Regional Team A',
  'Regional Team B',
  'Night Shift'
];

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

const getTodayDate = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addOneYear = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString + 'T00:00:00');
    date.setFullYear(date.getFullYear() + 1);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

const getDaysInDateRange = (startDate: string, endDate: string): Set<number> => {
  if (!startDate || !endDate) return new Set();
  
  try {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const daysInRange = new Set<number>();
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      daysInRange.add(currentDate.getDay());
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return daysInRange;
  } catch {
    return new Set();
  }
};

const isDayInRange = (dayIndex: number, startDate: string, endDate: string): boolean => {
  const daysInRange = getDaysInDateRange(startDate, endDate);
  return daysInRange.has(dayIndex);
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
    phoneNumber: '',
    startDate: '',
    endDate: '',
    schedule: WEEKDAYS.reduce((acc, day) => ({
      ...acc,
      [day.key]: { enabled: false, startTime: '09:00', endTime: '17:00' }
    }), {}),
    timezone: getUserTimezone(),
    maxTries: 1,
    retryInterval: '00:00:00',
    concurrency: 1,
    groupName: '',
    concurrentCallsPerAgent: 1
  });

  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [submitErrors, setSubmitErrors] = useState<Record<string, string>>({});
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});
  const [selectedTimezone, setSelectedTimezone] = useState<string>(getUserTimezone());
  const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
  const [isPhoneNumberDropdownOpen, setIsPhoneNumberDropdownOpen] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isAdvancedConfigExpanded, setIsAdvancedConfigExpanded] = useState(false);
  const [isGroupNameDropdownOpen, setIsGroupNameDropdownOpen] = useState(false);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const daysInRange = getDaysInDateRange(formData.startDate, formData.endDate);
      
      setFormData(prev => ({
        ...prev,
        schedule: WEEKDAYS.reduce((acc, day) => {
          const shouldBeEnabled = daysInRange.has(day.dayIndex);
          return {
            ...acc,
            [day.key]: {
              ...prev.schedule[day.key],
              enabled: shouldBeEnabled
            }
          };
        }, {})
      }));
    }
  }, [formData.startDate, formData.endDate]);

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

  useEffect(() => {
    if (isOpen) {
      setHasAttemptedSubmit(false);
      setSubmitErrors({});
      setStepErrors({});
    }
  }, [isOpen]);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Campaign name is required';
      }

      if (!formData.phoneNumber) {
        newErrors.phoneNumber = 'Phone number selection is required';
      }

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

      if (isAdvancedConfigExpanded) {
        if (formData.concurrentCallsPerAgent < 1 || formData.concurrentCallsPerAgent > 50) {
          newErrors.concurrentCallsPerAgent = 'Concurrent calls per agent must be between 1 and 50';
        }
      }
    }

    if (step === 2) {
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      } else {
        const today = getTodayDate();
        if (formData.startDate < today) {
          newErrors.startDate = 'Start date cannot be in the past';
        }
      }

      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      } else if (formData.startDate) {
        if (formData.endDate <= formData.startDate) {
          newErrors.endDate = 'End date must be after start date';
        } else {
          const maxEndDate = addOneYear(formData.startDate);
          if (formData.endDate > maxEndDate) {
            newErrors.endDate = 'Campaign duration cannot exceed 1 year';
          }
        }
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

    setStepErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number selection is required';
    }

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

    if (isAdvancedConfigExpanded) {
      if (formData.concurrentCallsPerAgent < 1 || formData.concurrentCallsPerAgent > 50) {
        newErrors.concurrentCallsPerAgent = 'Concurrent calls per agent must be between 1 and 50';
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const today = getTodayDate();
      if (formData.startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate) {
      if (formData.endDate <= formData.startDate) {
        newErrors.endDate = 'End date must be after start date';
      } else {
        const maxEndDate = addOneYear(formData.startDate);
        if (formData.endDate > maxEndDate) {
          newErrors.endDate = 'Campaign duration cannot exceed 1 year';
        }
      }
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

    setSubmitErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    
    if (validateForm()) {
      onSubmit(formData);
      setHasAttemptedSubmit(false);
      setSubmitErrors({});
      setStepErrors({});
      onClose();
    }
  };

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
    
    if (stepErrors[`schedule-${dayKey}`]) {
      setStepErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`schedule-${dayKey}`];
        return newErrors;
      });
    }
    if (submitErrors[`schedule-${dayKey}`]) {
      setSubmitErrors(prev => {
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

  const handleGroupNameSelect = (groupName: string) => {
    setFormData(prev => ({ ...prev, groupName }));
    setIsGroupNameDropdownOpen(false);
  };

  const handleIvrChange = (value: string) => {
    setFormData(prev => ({ ...prev, ivr: value }));
    if (hasAttemptedSubmit && submitErrors.ivr && value) {
      setSubmitErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.ivr;
        return newErrors;
      });
    }
  };

  const selectedPhoneNumber = PHONE_NUMBERS.find(phone => phone.id === formData.phoneNumber);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.timezone-dropdown-container')) {
        setIsTimezoneDropdownOpen(false);
      }
      if (!target.closest('.phone-number-dropdown-container')) {
        setIsPhoneNumberDropdownOpen(false);
      }
      if (!target.closest('.group-name-dropdown-container')) {
        setIsGroupNameDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            ${stepErrors[`schedule-${dayKey}`] || submitErrors[`schedule-${dayKey}`] ? 'border-red-300' : ''}
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
                      ${formatTo12Hour(value) === time ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-heading-2">Create New Campaign</h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentStep === 1 ? 'Campaign Info & Configurations' : 'Schedule Configuration'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-button"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};