Here's the fixed version with all missing closing brackets added:

```typescript
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