import React, { useState } from 'react';
import { Icon } from '@iconify/react';

const Input = ({
    type = 'text',
    name,
    placeholder,
    value,
    onChange,
    label,
    icon,
    error,
    required = false,
    focusColor = 'green', // 'green' or 'cyan' or 'yellow' - determines focus border and icon color
    showPasswordToggle = false,
    variant = 'default', // 'login', 'signup', 'ad', 'talent', 'get-discovered', 'default'
    className = '',
    ...rest
}) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine the base class prefix based on variant
    const getBaseClass = () => {
        switch (variant) {
            case 'login':
                return 'login-form';
            case 'signup':
                return 'signup-form';
            case 'ad':
                return 'ad-form';
            case 'talent':
                return 'talent-form';
            case 'get-discovered':
                return 'get-discovered-form';
            default:
                return 'form';
        }
    };

    const baseClass = getBaseClass();
    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasIcon = !!icon;
    const hasLabel = !!label;
    const hasError = !!error;

    // Handle password toggle
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className={`${baseClass}-group ${className}`}>
            {/* Label */}
            {hasLabel && (
                <label className={`${baseClass}-label`}>
                    {label}
                </label>
            )}

            {/* Input Wrapper */}
            <div 
                className={`${baseClass}-input-wrapper input-focus-${focusColor}`}
            >
                {/* Icon */}
                {hasIcon && (
                    <Icon 
                        icon={icon} 
                        className={`${baseClass}-icon`}
                    />
                )}

                {/* Input Field */}
                <input
                    type={inputType}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={`${baseClass}-input ${hasError ? `${baseClass}-input-error` : ''}`}
                    style={{
                        paddingLeft: hasIcon ? '3.5rem' : '1rem',
                        paddingRight: (showPasswordToggle && type === 'password') ? '3.5rem' : '1rem'
                    }}
                    required={required}
                    {...rest}
                />

                {/* Password Toggle Button */}
                {showPasswordToggle && type === 'password' && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className={`${baseClass}-password-toggle`}
                    >
                        <Icon 
                            icon={showPassword ? "material-symbols:visibility-off-outline" : "material-symbols:visibility-outline"} 
                            className={`${baseClass}-icon`}
                        />
                    </button>
                )}
            </div>

            {/* Error Message */}
            {hasError && (
                <span className={`${baseClass}-error`}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Input;
