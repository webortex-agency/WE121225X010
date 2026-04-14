import Icon from '../AppIcon';

const FilterChips = ({ 
  options = [], 
  selectedValues = [], 
  onSelectionChange, 
  multiSelect = false,
  className = ''
}) => {
  const handleChipClick = (value) => {
    if (multiSelect) {
      const newSelection = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      onSelectionChange(newSelection);
    } else {
      onSelectionChange(value);
    }
  };

  const isSelected = (value) => {
    return multiSelect 
      ? selectedValues.includes(value)
      : selectedValues === value;
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const value = typeof option === 'string' ? option : option.value;
        const label = typeof option === 'string' ? option : option.label;
        const count = typeof option === 'object' ? option.count : null;
        
        return (
          <button
            key={value}
            onClick={() => handleChipClick(value)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              isSelected(value)
                ? 'bg-primary text-white border border-primary'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 border border-border'
            }`}
          >
            <span>{label}</span>
            {count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isSelected(value)
                  ? 'bg-white/20 text-white'
                  : 'bg-background text-muted-foreground'
              }`}>
                {count}
              </span>
            )}
            {multiSelect && isSelected(value) && (
              <Icon name="X" size={12} className="ml-1" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterChips;
