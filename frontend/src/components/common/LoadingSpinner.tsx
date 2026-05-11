import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner-brand">
        <div className="loading-spinner-ring" />
        <img src="/icon-32.svg" alt="" className="loading-spinner-icon" aria-hidden />
      </div>
      <p className="loading-spinner-text">Se încarcă...</p>
    </div>
  );
};
