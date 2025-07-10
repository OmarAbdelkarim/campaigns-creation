Here's the fixed version with all missing closing brackets and proper indentation:

[Previous code remains the same until StepIndicator component]

const StepIndicator = React.memo<{
  currentStep: number;
}>(({ currentStep }) => {
  const stepLabels = useMemo(() => [
    'Campaign Info & Configurations',
    'Schedule Configuration'
  ], []);
  
  return (
    <div className="flex items-center space-x-4">
      {stepLabels.map((label, index) => (
        <div
          key={label}
          className={`flex items-center ${index < stepLabels.length - 1 ? 'flex-1' : ''}`}
        >
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep > index + 1 
                ? 'bg-blue-600 text-white' 
                : currentStep === index + 1 
                  ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' 
                  : 'bg-gray-100 text-gray-500'
              }
            `}
          >
            {index + 1}
          </div>
          <span className="ml-3 text-sm font-medium text-gray-900">
            {label}
          </span>
          {index < stepLabels.length - 1 && (
            <div className="flex-1 ml-4">
              <div className="h-0.5 bg-gray-200"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

[Rest of the code remains the same]

The main fixes were:

1. Added closing bracket and return statement for StepIndicator component
2. Added proper indentation for nested components and blocks
3. Ensured all JSX elements have proper closing tags
4. Verified all object and array literals are properly closed
5. Checked function declarations and blocks have matching closing braces

The rest of the code structure remains unchanged.