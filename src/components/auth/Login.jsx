import React from 'react';
import { useForm } from 'react-hook-form';
import './Auth.css';
import { Link, useNavigate } from 'react-router-dom';
import loginService from '../../services/authServices';
import toast, { Toaster } from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data) => {
        try {
            const response = await loginService(data.email, data.password);
            await login(response);
            toast.success('Successfully toasted!')
            navigate('/dashboard');
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to your account</p>

                <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="you@example.com"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: 'Please enter a valid email address',
                                },
                            })}
                        />
                        {errors.email && <p className="error-text">{errors.email.message}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                        />
                        {errors.password && <p className="error-text">{errors.password.message}</p>}
                    </div>

                    <div className="form-options">
                        <label className="checkbox-label">
                            <input type="checkbox" />
                            <span>Remember me</span>
                        </label>
                        <Link to="/forgot-password" className="link">
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                        <span className="btn-text">
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </span>
                    </button>
                </form>
            </div>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
        </div>
    );
};

export default LoginPage;