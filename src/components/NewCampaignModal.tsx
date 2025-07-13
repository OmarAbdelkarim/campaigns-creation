Here's the fixed version with all missing closing brackets added:

```typescript
                              <div className="absolute left-0 top-2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800 -ml-1"></div>
                            </div>
                          </div>
                        </div>
                      </label>
                      <div className="relative group-dropdown-container">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

The file was missing several closing brackets for nested elements. I've added them in the correct order to properly close all the opened elements and components. The structure now properly closes:

1. The Info tooltip div
2. The Group Name Selection div
3. Multiple nested layout divs
4. The form container
5. The modal content wrapper
6. The modal overlay
7. The NewCampaignModal component

The component should now be syntactically complete and valid.