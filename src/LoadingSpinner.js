import React from 'react';
import './LoadingSpinner.css'; // Pastikan Anda membuat file CSS ini

const LoadingSpinner = () => {
return (
<div className="loading-spinner-overlay">
<div className="loading-spinner-container">
{/* Anda bisa menggunakan spinner dari library seperti react-spinners atau membuat spinner custom */}
<div className="loading-spinner"></div>
</div>
</div>
);
};

export default LoadingSpinner;