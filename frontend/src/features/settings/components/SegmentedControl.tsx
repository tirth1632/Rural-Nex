

interface SegmentedControlProps<T extends string> {
  options: T[];
  value: T;
  onChange: (val: T) => void;
  label?: string;
  description?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  description,
}: SegmentedControlProps<T>) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-900">{label}</label>}
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <div className="inline-flex p-1 rounded-lg border w-full sm:w-auto segmented-container">
        {options.map(option => {
          const isActive = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                isActive
                  ? 'segmented-active shadow-xs font-bold'
                  : 'segmented-inactive font-medium'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
