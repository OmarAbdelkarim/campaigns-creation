Here's the fixed version with all missing closing brackets and required whitespace added:

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
          className={`flex items-center ${index < stepLabels.length - 1 ? 'mr-4' : ''}`}
        >
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${currentStep > index + 1 
                ? 'bg-green-100 text-green-700' 
                : currentStep === index + 1
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
              }
            `}
          >
            {index + 1}
          </div>
          <span 
            className={`
              ml-2 text-sm font-medium
              ${currentStep > index + 1 
                ? 'text-green-700' 
                : currentStep === index + 1
                  ? 'text-blue-700'
                  : 'text-gray-500'
              }
            `}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
});

[Rest of the code remains the same]

The main fixes were:

1. Added closing bracket and parenthesis for the StepIndicator component
2. Added return statement and JSX for the StepIndicator component
3. Added proper spacing and indentation

The rest of the code appears to be properly structured and has all necessary closing brackets.