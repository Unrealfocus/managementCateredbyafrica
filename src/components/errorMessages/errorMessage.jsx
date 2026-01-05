import React from 'react'
import Unauthorized from './unauthorize';
function ErrorMessage({ error }) {

    console.log(error)
    const status = error?.status || error?.response?.status || 500;

    const errorMap = {
        401: { component: <Unauthorized />, style: { color: 'red', backgroundColor: '#ffe6e6' } },
        403: { component: <div>Access Denied</div>, style: { color: 'orange', backgroundColor: '#fff3e0' } },
        404: { component: <div>Data Not Found</div>, style: { color: 'gray', backgroundColor: '#f0f0f0' } },
        500: { component: <div>Server Error. Please try again later.</div>, style: { color: 'red', backgroundColor: '#ffe6e6' } },
    };

    // Fallback if status is not in map
    const errorDisplay = errorMap[status] || {
        component: <div>Something went wrong</div>,
        style: { color: 'gray', backgroundColor: '#f0f0f0' },
    };

    return (
        <div className="error-container" style={errorDisplay.style}>
            {errorDisplay.component}
        </div>
    );
}

export default ErrorMessage;
