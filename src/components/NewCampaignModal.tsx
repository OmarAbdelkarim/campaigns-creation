Here's the fixed version with the missing closing brackets and required whitespace added:

```typescript
// ... [previous code remains the same until the GROUP_OPTIONS mapping error]

                              {GROUP_OPTIONS.map((group, index) => (
                                <button
                                  key={group}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, groupName: group }));
                                    setIsGroupNameDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors duration-200 ${
                                    index !== GROUP_OPTIONS.length - 1 ? 'border-b border-gray-100' : ''
                                  } ${
                                    formData.groupName === group ? 'bg-blue-50 text-blue-700' : ''
                                  }`}
                                >
                                  <span>{group}</span>
                                  {formData.groupName === group && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                </button>
                              ))}

                              {GROUP_NAMES.map((group, index) => (
                                <button
                                  key={group}
                                  type="button"
                                  onClick={() => {
                                    setFormData(prev => ({ ...prev, groupName: group }));
                                    setIsGroupNameDropdownOpen(false);
                                  }}
                                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between transition-colors duration-200 ${
                                    index !== GROUP_NAMES.length - 1 ? 'border-b border-gray-100' : ''
                                  } ${
                                    formData.groupName === group ? 'bg-blue-50 text-blue-700' : ''
                                  }`}
                                >
                                  <span>{group}</span>
                                  {formData.groupName === group && (
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Assign this campaign to a specific agent group
                        </p>
                      </div>

                      {/* Rest of the component remains the same */}
                    </div>
                  </div>
                )}
              </div>

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
```