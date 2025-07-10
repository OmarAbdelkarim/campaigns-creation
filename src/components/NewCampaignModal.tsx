import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Calendar, Clock, Phone, Globe, ChevronDown, ChevronUp, Info, Workflow, ChevronLeft, ChevronRight, AlertCircle, Settings, Users } from 'lucide-react';
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
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" ref={containerRef}>
        <button
          type="button"
          onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-medium text-gray-900">Advanced Configurations</h4>
              <p className="text-xs text-gray-500">Optional settings for advanced campaign management</p>
            </div>
          </div>
          {isAdvancedExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        
        <div className="p-4">
          {formData.startDate && formData.endDate ? (
            <p className="text-sm text-gray-600">
              Days are automatically selected based on your campaign date range. Only days that occur within the selected dates are enabled.
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Select your campaign date range to automatically enable available days.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};