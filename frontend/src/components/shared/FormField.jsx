import Icon from '../AppIcon';

const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  icon,
  iconPosition = 'left',
  rows = 3,
  options = [],
  multiple = false,
  className = '',
  inputClassName = ''
}) => {
  const baseInputClasses = `w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
    error ? 'border-destructive' : 'border-border'
  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${readOnly ? 'bg-muted' : ''}`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            className={`${baseInputClasses} ${inputClassName}`}
          />
        );

      case 'select':
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
            multiple={multiple}
            className={`${baseInputClasses} ${inputClassName}`}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={typeof option === 'string' ? option : option.value} 
                value={typeof option === 'string' ? option : option.value}
              >
                {typeof option === 'string' ? option : option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name={name}
              checked={value}
              onChange={onChange}
              onBlur={onBlur}
              required={required}
              disabled={disabled}
              readOnly={readOnly}
              className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
            />
            {label && (
              <label htmlFor={name} className="text-sm text-foreground cursor-pointer">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </label>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <div key={typeof option === 'string' ? option : option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={name}
                  value={typeof option === 'string' ? option : option.value}
                  checked={value === (typeof option === 'string' ? option : option.value)}
                  onChange={onChange}
                  onBlur={onBlur}
                  required={required}
                  disabled={disabled}
                  readOnly={readOnly}
                  className="w-4 h-4 text-primary border-border focus:ring-primary focus:ring-2"
                />
                <label className="text-sm text-foreground cursor-pointer">
                  {typeof option === 'string' ? option : option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        const inputElement = (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            className={`${baseInputClasses} ${icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''} ${inputClassName}`}
          />
        );

        if (icon) {
          return (
            <div className="relative">
              {inputElement}
              <div className={`absolute top-1/2 transform -translate-y-1/2 ${
                iconPosition === 'left' ? 'left-3' : 'right-3'
              }`}>
                <Icon name={icon} size={16} className="text-muted-foreground" />
              </div>
            </div>
          );
        }

        return inputElement;
    }
  };

  if (type === 'checkbox') {
    return (
      <div className={`space-y-1 ${className}`}>
        {renderInput()}
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <Icon name="AlertCircle" size={14} />
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && type !== 'checkbox' && (
        <label htmlFor={name} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <Icon name="AlertCircle" size={14} />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
};

export default FormField;
