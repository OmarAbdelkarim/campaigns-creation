import React, { useState } from 'react';

interface TimeSlot {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

interface Schedule {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday: TimeSlot;
  sunday: TimeSlot;
}

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  schedule: Schedule;
}

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

const WEEKDAYS = [
  { key: 'monday' as keyof Schedule, label: 'Monday', dayIndex: 1 },
  { key: 'tuesday' as keyof Schedule, label: 'Tuesday', dayIndex: 2 },
  { key: 'wednesday' as keyof Schedule, label: 'Wednesday', dayIndex: 3 },
  { key: 'thursday' as keyof Schedule, label: 'Thursday', dayIndex: 4 },
  { key: 'friday' as keyof Schedule, label: 'Friday', dayIndex: 5 },
  { key: 'saturday' as keyof Schedule, label: 'Saturday', dayIndex: 6 },
  { key: 'sunday' as keyof Schedule, label: 'Sunday', dayIndex: 0 },
];

const TimeSlotInput: React.FC<{
  dayKey: keyof Schedule;
  type: 'start' | 'end';
  value: string;
  enabled: boolean;
  onChange: (value: string) => void;
}> = ({ type, value, enabled, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {type === 'start' ? 'Start Time' : 'End Time'}
    </label>
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!enabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
    />
  </div>
);

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: '',
    endDate: '',
    schedule: {
      monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    },
  });

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    const hasEnabledDay = Object.values(formData.schedule).some(day => day.enabled);
    if (!hasEnabledDay) {
      newErrors.schedule = 'At least one day must be enabled';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      onSubmit(formData);
      onClose();
      setCurrentStep(1);
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        schedule: {
          monday: { enabled: false, startTime: '09:00', endTime: '17:00' },
          tuesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
          wednesday: { enabled: false, startTime: '09:00', endTime: '17:00' },
          thursday: { enabled: false, startTime: '09:00', endTime: '17:00' },
          friday: { enabled: false, startTime: '09:00', endTime: '17:00' },
          saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
          sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
        },
      });
      setErrors({});
    }
  };

  const handleScheduleChange = (day: keyof Schedule, field: keyof TimeSlot, value: boolean | string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value,
        },
      },
    }));
  };

  const isDayInRange = (dayIndex: number, startDate: string, endDate: string) => {
    if (!startDate || !endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === dayIndex) {
        return true;
      }
    }
    return false;
  };

  const getError = (field: string) => errors[field];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Campaign</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 mx-4 ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Basic Info</span>
              <span className="text-sm text-gray-600">Schedule</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter campaign name"
                  />
                  {getError('name') && (
                    <p className="text-red-500 text-sm mt-1">{getError('name')}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {getError('startDate') && (
                      <p className="text-red-500 text-sm mt-1">{getError('startDate')}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {getError('endDate') && (
                      <p className="text-red-500 text-sm mt-1">{getError('endDate')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Schedule Configuration */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Configuration</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Configure when your campaign should be active during the week.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {WEEKDAYS.map(day => {
                        const isInRange = isDayInRange(day.dayIndex, formData.startDate, formData.endDate);
                        return (
                          <div key={day.key} className="flex items-center space-x-4">
                            <div className="w-32">
                              <label className="inline-flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.schedule[day.key].enabled}
                                  onChange={(e) => handleScheduleChange(day.key, 'enabled', e.target.checked)}
                                  disabled={!isInRange}
                                  className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                />
                                <span className={`ml-2 font-medium ${isInRange ? 'text-gray-900' : 'text-gray-400'}`}>
                                  {day.label}
                                </span>
                              </label>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                              <TimeSlotInput
                                dayKey={day.key}
                                type="start"
                                value={formData.schedule[day.key].startTime}
                                enabled={formData.schedule[day.key].enabled && isInRange}
                                onChange={(value) => handleScheduleChange(day.key, 'startTime', value)}
                              />
                              <TimeSlotInput
                                dayKey={day.key}
                                type="end"
                                value={formData.schedule[day.key].endTime}
                                enabled={formData.schedule[day.key].enabled && isInRange}
                                onChange={(value) => handleScheduleChange(day.key, 'endTime', value)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {getError('schedule') && (
                    <p className="text-red-500 text-sm mt-1">{getError('schedule')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={currentStep === 1 ? onClose : handlePrevious}
                className="btn btn-secondary"
              >
                {currentStep === 1 ? 'Cancel' : 'Previous'}
              </button>
              <button
                type={currentStep === 2 ? 'submit' : 'button'}
                onClick={currentStep === 1 ? handleNext : undefined}
                className="btn btn-primary"
              >
                {currentStep === 2 ? 'Create Campaign' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};