import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useStaticInfo } from '../../context/StaticInfoContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import { parsePhoneNumberFromString } from 'libphonenumber-js'

import Input from '../../components/UI/Input'
import image from "../../assets/imgs/signup.png"

const Signup = () => {
    const { staticInfo } = useStaticInfo();
    const navigate = useNavigate();
    const { register } = useAuth();
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");

        // --- FRONTEND VALIDATIONS ---
        if (!name || !email || !password || !phone) {
            setError(
                "Please provide all required fields: name, email, password, phoneNumber"
            );
            return;
        }

        if (name.length < 2 || name.length > 50) {
            setError("Name must be between 2 and 50 characters");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email");
            return;
        }

        // validate phone
        const phoneNumberObj = parsePhoneNumberFromString(phone);
        if (!phoneNumberObj || !phoneNumberObj.isValid()) {
            setError(
                "Please enter a valid international phone number (include country code, e.g. +962...)"
            );
            return;
        }

        // --- API CALL ---
        try {
            const formattedPhone = phoneNumberObj.number;
            await register(name, email, password, formattedPhone, staticInfo.channelId);
            toast.success('Registration successful!');
            navigate("/");
        } catch (err) {
            console.error(
                "Registration failed:",
                err.response?.data?.message || err.message
            );
            setError(
                err.response?.data?.message || "Something went wrong. Please try again."
            );
            toast.error(err.response?.data?.message || "Something went wrong. Please try again.");
        }
    };


    return (
        <>
            <ToastContainer />
            <section className="signup-section">
                <div className="signup-container flex-between">
                    {/* Left Side - Form */}
                    <div className="signup-left">
                        <div className="signup-form-wrapper">
                            <h2 className="signup-title">Sign Up</h2>
                            
                            <form className="signup-form" onSubmit={handleSignUp}>
                                {/* Name Field */}
                                <Input
                                    variant="signup"
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    icon="material-symbols:person-outline"
                                    focusColor="green"
                                    required
                                />

                                {/* Email Field */}
                                <Input
                                    variant="signup"
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    icon="material-symbols-light:stacked-email-outline"
                                    focusColor="green"
                                    required
                                />

                                {/* Phone Field */}
                                <Input
                                    variant="signup"
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    icon="material-symbols:phone-in-talk-outline-rounded"
                                    focusColor="green"
                                    required
                                />

                                {/* Password Field */}
                                <Input
                                    variant="signup"
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

                                {/* Confirm Password Field */}
                                <Input
                                    variant="signup"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    icon="material-symbols:lock-outline"
                                    focusColor="green"
                                    showPasswordToggle={true}
                                    required
                                />

                                {/* Error Message */}
                                {error && (
                                    <div className="signup-error">
                                        {error}
                                    </div>
                                )}

                                {/* Sign Up Button */}
                                <button type="submit" className="signup-submit-btn">
                                    Sign Up
                                </button>

                                {/* Sign In Link */}
                                <div className="signup-signin-link">
                                    <span>ALREADY HAVE AN ACCOUNT? </span>
                                    <Link to="/login" className="signup-signin-bold">SIGN IN</Link>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Side - Image */}
                    <div className="signup-right">
                        <img src={image} alt="Sign Up" className="signup-image" />
                    </div>
                </div>
            </section>
        </>
    )
}

export default Signup