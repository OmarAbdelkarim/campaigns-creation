Here's the fixed version with the missing closing brackets and proper structure:

```javascript
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
    </div>
  );
};
```