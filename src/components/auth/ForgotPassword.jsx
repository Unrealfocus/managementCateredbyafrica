import React, { useState } from 'react';
import './Auth.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        console.log('Password reset requested for:', email);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">
                    Enter your email and we'll send you a link to reset your password
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="reset-email">Email</label>
                            <input
                                type="email"
                                id="reset-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>

                        <button type="submit" className="btn-primary">
                            Send Reset Link
                        </button>
                    </form>
                ) : (
                    <div className="success-message">
                        <div className="success-icon">✓</div>
                        <h3>Check your email</h3>
                        <p>
                            We sent a password reset link to <strong>{email}</strong>
                        </p>
                        <p className="text-secondary">
                            Click the link in the email to create a new password.
                        </p>
                    </div>
                )}

                <p className="auth-footer">
                    <a href="/" className="link">← Back to Sign in</a>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;