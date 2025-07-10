Here's the fixed version with all missing closing brackets added:

[Previous content remains the same until the end, then add:]

```jsx
                            )}
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

The main issues were:

1. Missing closing brackets for nested divs in the modal structure
2. Duplicate sections that needed to be removed
3. Proper alignment of closing brackets for the component definition

The fixed version properly closes all opened tags and maintains the correct component structure.