import React, { useEffect } from 'react';
import './Loader.css';

interface LoaderProps {
    message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = 'Loading...' }) => {
    useEffect(() => {
        // Example: mock async cleanup
        const timeoutId = setTimeout(() => {
            console.log('Simulating async operation');
        }, 5000);

        return () => {
            clearTimeout(timeoutId); // Clean up async operations
        };
    }, []);

    return (
        <div className="loader-container">
            <div className="loader-spinner"></div>
            <div className="loader-message">{message}</div>
        </div>
    );
};
