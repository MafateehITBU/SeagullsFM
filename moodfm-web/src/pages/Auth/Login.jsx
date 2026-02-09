import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'

import Input from '../../components/UI/Input'
import image from "../../assets/imgs/login.png"

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            toast.success('Login successful!');
            navigate("/");
        } catch (err) {
            console.error(
                "Login failed:",
                err.response?.data?.message || err.message
            );
            setError(
                err.response?.data?.message || "Something went wrong. Please try again."
            );
            toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    const handleForgotPassword = () => {
        navigate("/forgot-password");
    };

    return (
        <>
            <ToastContainer />
            <section className="login-section">
                <div className="login-container flex-between">
                    {/* Left Side - Image */}
                    <div className="login-left">
                        <img src={image} alt="Login" className="login-image" />
                    </div>

                    {/* Right Side - Form */}
                    <div className="login-right">
                        <div className="login-form-wrapper">
                            <h2 className="login-title">Sign In</h2>
                            
                            <form className="login-form" onSubmit={handleLogin}>
                                {/* Email Field */}
                                <Input
                                    variant="login"
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon="material-symbols-light:stacked-email-outline"
                                    focusColor="green"
                                    required
                                />

                                {/* Password Field */}
                                <Input
                                    variant="login"
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    icon="material-symbols:lock-outline"
                                    focusColor="green"
                                    showPasswordToggle={true}
                                    required
                                />

                                {/* Forgot Password */}
                                <div className="login-forgot-password">
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="login-forgot-link"
                                    >
                                        Forgot Password ?
                                    </button>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="login-error">
                                        {error}
                                    </div>
                                )}

                                {/* Login Button */}
                                <button type="submit" className="login-submit-btn">
                                    Login
                                </button>

                                {/* Sign Up Link */}
                                <div className="login-signup-link">
                                    <span>DON'T HAVE AN ACCOUNT? </span>
                                    <Link to="/signup" className="login-signup-bold">SIGN UP</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Login