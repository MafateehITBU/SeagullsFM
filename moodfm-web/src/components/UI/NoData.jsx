import React from 'react';
import { Icon } from '@iconify/react';

const NoData = ({ message = "No data available", icon = "material-symbols:inbox-outline", className = "" }) => {
    return (
        <div className={`no-data-container ${className}`}>
            <Icon icon={icon} className="no-data-icon" />
            <p className="no-data-message">{message}</p>
        </div>
    );
};

export default NoData;

