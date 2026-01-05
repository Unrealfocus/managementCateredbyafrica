// src/components/SkeletonRow.jsx
import CustomerListLoader from './CustomerListLoader.css'
const SkeletonRow = () => (
    <tr className="skeleton-row">
        <td className="skeleton-cell">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="skeleton skeleton-avatar"></div>
                <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '40%', marginTop: '0.5rem' }}></div>
                </div>
            </div>
        </td>
        <td className="skeleton-cell">
            <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
        </td>
        <td className="skeleton-cell">
            <div className="skeleton skeleton-text" style={{ width: '50%' }}></div>
        </td>
        <td className="skeleton-cell">
            <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
        </td>
        <td className="skeleton-cell">
            <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
        </td>
        <td className="skeleton-cell">
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '0.375rem' }}></div>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '0.375rem' }}></div>
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: '0.375rem' }}></div>
            </div>
        </td>
    </tr>
);

export default SkeletonRow;