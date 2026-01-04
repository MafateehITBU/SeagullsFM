import React, { useState } from "react";
import axiosInstance from "../axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";


const ResetPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        try {
            await axiosInstance.put("/admin/send-otp", { email });
            toast.success("OTP sent successfully", { position: "top-right" })
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending OTP", { position: "top-right" })
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const fullOtp = otp.join("");
            await axiosInstance.post("/admin/verify-otp", { email, otp: fullOtp });
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid OTP. Please try again.", { position: "top-right" })
        }
    };

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.", { position: "top-right" })
            return;
        }
        if (password.length < 8 || !/[A-Z0-9!@#$%^&*]/.test(password)) {
            toast.error("Password does not meet criteria.", { position: "top-right" })
            return;
        }
        try {
            console.log("Resetting Password: ", password, " Confirm Password: ", confirmPassword);
            await axiosInstance.post("/admin/reset-password", {
                email,
                newPassword: password,
                confirmNewPassword: confirmPassword
            });
            toast.success("Password successfully reset.", { position: "top-right" });
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.", { position: "top-right" });
        }
    };

    const renderStep1 = () => (
        <div className="inner-container d-flex flex-column align-items-center justify-content-center">
            <img
                src="/assets/images/forgot_password.png"
                alt="site logo"
                className="light-logo mx-auto"
            />
            <h3 className="text-center mb-3">Forgot your password?</h3>
            <p className="mb-5">
                Enter your email address and we’ll send you an OTP to reset your password.
            </p>

            {/* Input with icon wrapper */}
            <div className="position-relative w-100 mb-3" style={{ maxWidth: "500px" }}>
                <Icon
                    icon="mdi:email-outline"
                    className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                    style={{ fontSize: "20px", left: "10px" }}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field ps-5"
                    style={{ width: "100%", height: "45px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
            </div>

            <button onClick={handleSendOtp} className="forgot-btn mb-4">
                Next
            </button>

            {/* Back to login with arrow icon */}
            <p
                className="d-flex align-items-center gap-2 mt-5"
                style={{ cursor: "pointer" }}
                onClick={() => navigate("/login")}
            >
                <Icon icon="ic:baseline-arrow-back" />
                Back to login
            </p>
        </div>
    );

    const renderStep2 = () => (
        <div className="inner-container d-flex flex-column align-items-center justify-content-center">
            <h2 className="mb-3">Enter Your Code</h2>
            <p className="mb-5" >We've sent a 6-digit code to your email. Please enter it below to verify your identity</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "20px 0" }}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                            const newOtp = [...otp];
                            newOtp[index] = e.target.value;
                            setOtp(newOtp);
                        }}
                        className="otpInput"
                    />
                ))}
            </div>
            <div>Didn’t receive the code? <a href="#" onClick={handleSendOtp} style={{ color: "#59CB00" }}>Resend</a></div>
            <button className="forgot-btn" onClick={handleVerifyOtp}>Next</button>
        </div>
    );

    const renderStep3 = () => {
        const isPasswordValid = password.length >= 8 && /[A-Z0-9!@#$%^&*]/.test(password);

        return (
            <div className="inner-container d-flex flex-column ">
                <div className="d-flex flex-column align-items-center justify-content-center">
                    <h2 className="mb-3">Create a New Password</h2>
                    <p className="mb-5">Please enter a new password for your account.</p>

                    {/* New Password */}
                    <div className="form-group w-100 mb-3" style={{ maxWidth: "500px", position: "relative" }}>
                        <label className="mb-2 d-block"><strong>New Password</strong></label>
                        <Icon
                            icon="mdi:lock-outline"
                            className="position-absolute forgot-icon"
                            style={{ left: "10px", top: "50px", color: "#888", fontSize: "20px" }}
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            style={{
                                paddingLeft: "35px",
                                paddingRight: "35px",
                                width: "100%",
                                height: "45px",
                                borderRadius: "8px",
                                border: "1px solid #ccc"
                            }}
                        />
                        <Icon
                            icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                            onClick={() => setShowPassword(!showPassword)}
                            className="position-absolute"
                            style={{
                                right: "10px",
                                top: "50px",
                                cursor: "pointer",
                                color: "#888",
                                fontSize: "20px"
                            }}
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group w-100 mb-4" style={{ maxWidth: "500px", position: "relative" }}>
                        <label className="mb-2 d-block"><strong>Confirm New Password</strong></label>
                        <Icon
                            icon="mdi:lock-outline"
                            className="position-absolute forgot-icon"
                            style={{ left: "10px", top: "50px", color: "#888", fontSize: "20px" }}
                        />
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            style={{
                                paddingLeft: "35px",
                                paddingRight: "35px",
                                width: "100%",
                                height: "45px",
                                borderRadius: "8px",
                                border: "1px solid #ccc"
                            }}
                        />
                        <Icon
                            icon={showConfirmPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="position-absolute"
                            style={{
                                right: "10px",
                                top: "50px",
                                cursor: "pointer",
                                color: "#888",
                                fontSize: "20px"
                            }}
                        />
                    </div>
                </div>

                {/* Password validation hint */}
                {password && !isPasswordValid && (
                    <div
                        style={{
                            textAlign: "left",
                            fontSize: "14px",
                            color: "#555",
                            maxWidth: "500px",
                            marginLeft: "100px",
                            marginBottom: "20px",
                            marginTop: "20px"
                        }}
                    >
                        <p style={{ textAlign: "left" }}>The password must contain:</p>
                        <ul>
                            <li>At least 8 characters</li>
                            <li>A capital letter, number, or symbol</li>
                        </ul>
                    </div>
                )}

                <button className="forgot-btn mt-4 align-self-center" onClick={handleResetPassword}>
                    Next
                </button>
            </div>
        );
    };

    return (
        <div className="forgot-password-container d-flex justify-content-center align-items-center">
            <ToastContainer />
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
        </div>
    );
};

export default ResetPassword;