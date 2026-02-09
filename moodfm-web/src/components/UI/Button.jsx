import React from 'react';
import { Icon } from '@iconify/react';

const Button = ({
    children,
    type = 'button',
    variant = 'green', // 'green', 'cyan', 'orange', 'blue', 'yellow', 'red'
    size = 'md', // 'sm', 'md', 'lg'
    className = '',
    disabled = false,
    onClick,
    fullWidth = false,
    uppercase = true,
    icon = null,
    ...rest
}) => {
    // Build Bootstrap classes
    const baseClasses = 'btn';
    // Use custom color variant class
    const variantClass = `btn-custom-${variant}`;
    const sizeClass = size !== 'md' ? `btn-${size}` : '';
    const widthClass = fullWidth ? 'w-100' : '';
    const textTransformClass = uppercase ? 'text-uppercase' : '';
    
    // Custom class for font-family and hover effects
    const customClass = 'custom-btn';
    
    const allClasses = [
        baseClasses,
        variantClass,
        sizeClass,
        widthClass,
        textTransformClass,
        customClass,
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={allClasses}
            disabled={disabled}
            onClick={onClick}
            {...rest}
        >
            {icon && <Icon icon={icon} />}
            {children}
        </button>
    );
};

export default Button;

