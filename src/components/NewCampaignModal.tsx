import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, Clock, Phone, Globe, ChevronDown, ChevronUp, Info, Workflow, ChevronLeft, ChevronRight, AlertCircle, Users, Settings } from 'lucide-react';
import { TimeInput } from './TimeInput';
import { TimePicker } from './TimePicker';
import { DatePicker } from './DatePicker';

interface NewCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    schedule: {
      monday: { enabled: false, timeSlots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { enabled: false, timeSlots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { enabled: false, timeSlots: [{ start: '09:00', end: '17:00' }] },
      thursday: { enabled: false, timeSlots: [{ start: '09:00', end: '17:00' }] },
      friday: { enabled: false, timeSlots: [{ start: '09:00', end: '17:00' }] },
      saturday: { enabled: false, timeSlots: [{ start: '09:00', end: '17:00' }] },
      sunday: { enabled: false, timeSlots: [{ start: '09:00', end: '17:00' }] }
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleScheduleChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day as keyof typeof prev.schedule],
          [field]: value
        }
      }
    }));
  };

  const handleTimeSlotChange = (day: string, index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day as keyof typeof prev.schedule],
          timeSlots: prev.schedule[day as keyof typeof prev.schedule].timeSlots.map((slot, i) =>
            i === index ? { ...slot, [field]: value } : slot
          )
        }
      }
    }));
  };

  const addTimeSlot = (day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day as keyof typeof prev.schedule],
          timeSlots: [
            ...prev.schedule[day as keyof typeof prev.schedule].timeSlots,
            { start: '09:00', end: '17:00' }
          ]
        }
      }
    }));
  };

  const removeTimeSlot = (day: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day as keyof typeof prev.schedule],
          timeSlots: prev.schedule[day as keyof typeof prev.schedule].timeSlots.filter((_, i) => i !== index)
        }
      }
    }));
  };

  const toggleDayExpanded = (day: string) => {
    setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Campaign name is required';
      }
      if (!formData.startDate) {
        newErrors.startDate = 'Start date is required';
      }
      if (!formData.endDate) {
        newErrors.endDate = 'End date is required';
      }
      if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (step === 2) {
      const hasEnabledDay = Object.values(formData.schedule).some(day => day.enabled);
      if (!hasEnabledDay) {
        newErrors.schedule = 'At least one day must be enabled';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const getError = (field: string) => errors[field];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Workflow className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Create New Campaign</h2>
                <p className="text-sm text-gray-500">Step {currentStep} of 2</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Campaign Details</span>
              </div>
              <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Schedule</span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Campaign Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        getError('name') ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter campaign name"
                    />
                    {getError('name') && <p className="text-red-500 text-sm mt-1">{getError('name')}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter campaign description (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <DatePicker
                        value={formData.startDate}
                        onChange={(date) => handleInputChange('startDate', date)}
                        error={getError('startDate')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <DatePicker
                        value={formData.endDate}
                        onChange={(date) => handleInputChange('endDate', date)}
                        error={getError('endDate')}
                        minDate={formData.startDate}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Schedule */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Schedule</h3>
                    <div className="space-y-4">
                      {days.map((day) => {
                        const dayData = formData.schedule[day.key as keyof typeof formData.schedule];
                        const isExpanded = expandedDays[day.key];
                        
                        return (
                          <div key={day.key} className="border border-gray-200 rounded-lg">
                            <div className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <input
                                    type="checkbox"
                                    checked={dayData.enabled}
                                    onChange={(e) => handleScheduleChange(day.key, 'enabled', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="font-medium text-gray-900">{day.label}</span>
                                </div>
                                
                                {dayData.enabled && (
                                  <button
                                    type="button"
                                    onClick={() => toggleDayExpanded(day.key)}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-gray-500" />
                                    )}
                                  </button>
                                )}
                              </div>

                              {dayData.enabled && isExpanded && (
                                <div className="mt-4 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700">Time Slots</span>
                                    <button
                                      type="button"
                                      onClick={() => addTimeSlot(day.key)}
                                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                      + Add Time Slot
                                    </button>
                                  </div>
                                  
                                  {dayData.timeSlots.map((slot, index) => (
                                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                                      <TimePicker
                                        value={slot.start}
                                        onChange={(time) => handleTimeSlotChange(day.key, index, 'start', time)}
                                        label="Start"
                                      />
                                      <span className="text-gray-400">to</span>
                                      <TimePicker
                                        value={slot.end}
                                        onChange={(time) => handleTimeSlotChange(day.key, index, 'end', time)}
                                        label="End"
                                      />
                                      {dayData.timeSlots.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeTimeSlot(day.key, index)}
                                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {getError('schedule') && <p className="text-red-500 text-sm">{getError('schedule')}</p>}
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-600">
                        {formData.startDate && formData.endDate ? (
                          'Days are automatically selected based on your campaign date range. Only days that occur within the selected dates are enabled.'
                        ) : (
                          'Select campaign start and end dates above to automatically enable relevant days. You can then customize the time slots for each enabled day.'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevious}
                      className="btn-secondary flex items-center"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  
                  {currentStep < 2 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary flex items-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Create Campaign
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};