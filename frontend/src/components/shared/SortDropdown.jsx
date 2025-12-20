import { useState } from 'react';
import Icon from '../AppIcon';

const SortDropdown = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Sort by...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-muted-foreground" 
        />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-md shadow-lg z-20">
            <div className="py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 ${
                    value === option.value 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground'
                  }`}
                >
                  {option.icon && (
                    <Icon name={option.icon} size={14} />
                  )}
                  <span>{option.label}</span>
                  {value === option.value && (
                    <Icon name="Check" size={14} className="ml-auto text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SortDropdown;
