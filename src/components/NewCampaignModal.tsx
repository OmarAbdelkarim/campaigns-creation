Here's the fixed version with all missing closing brackets added:

```typescript
import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, Clock, Phone, Globe, ChevronDown, ChevronUp, Info, Workflow, ChevronLeft, ChevronRight, AlertCircle, Settings } from 'lucide-react';
import { TimeInput } from './TimeInput';
import { TimePicker } from './TimePicker';
import { DatePicker } from './DatePicker';

// [Previous code remains the same until TimeSlotInput component]

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

// [Rest of the code remains the same until the end]

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  // [Component implementation remains the same]
};
```