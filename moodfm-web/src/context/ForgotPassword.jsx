import { useState, useRef } from "react"
import axiosInstance from "../axiosConfig"
import { toast, ToastContainer } from "react-toastify"
import { useNavigate, Link } from "react-router-dom"
import Input from "../components/UI/Input"
import Button from "../components/UI/Button"
import { Icon } from "@iconify/react"

import forgot1 from "../assets/imgs/ForgotPassword/forgot-1.png"
import forgot2 from "../assets/imgs/ForgotPassword/forgot-2.png"
import forgot3 from "../assets/imgs/ForgotPassword/forgot-3.png"
import forgot4 from "../assets/imgs/ForgotPassword/forgot-4.png"

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            await axiosInstance.put("/user/send-otp", { email });
            toast.success("OTP sent successfully", { position: "top-right" });
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || "Error sending OTP", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (e, index) => {
        const val = e.target.value;
        if (/^[0-9]?$/.test(val)) {
            // Only allow single digit or empty
            const newOtp = [...otp];
            newOtp[index] = val;
            setOtp(newOtp);
            if (val !== "" && index < otp.length - 1) {
                // Focus next input if exists and current input is filled
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        try {
            const fullOtp = otp.join("");
            await axiosInstance.post("/user/verify-otp", { email, otp: fullOtp });
            setStep(3);
        } catch (error) {
            toast.error(
                error.response?.data?.message || "Invalid OTP. Please try again.",
                { position: "top-right" }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (password !== confirmPassword) {
            toast.error("Passwords do not match", { position: "top-right" });
            return;
        }

        if (password.length < 8 || !/[A-Z0-9!@#$%^&*]/.test(password)) {
            toast.error("Password does not meet criteria", { position: "top-right" });
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post("/user/reset-password", {
                email,
                newPassword: password,
                confirmNewPassword: confirmPassword,
            });

            setStep(4);
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong", { position: "top-right" });
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="forgot-password-step1 d-flex flex-column align-items-center justify-content-center">
            <img src={forgot1} alt="forgot-password" className="forgot-password-image" />
            <h2 className="forgot-password-title pt-4 pb-4">Forgot Your Password?</h2>
            <p className="forgot-password-description pb-4 text-center">A Code Will Be Sent To Your Email To Help Reset Your <br /> Password</p>
            <form className="forgot-password-form w-100 d-flex flex-column align-items-center justify-content-center" onSubmit={handleSendOtp}>
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
                    className="mb-4"
                />
                <Button type="submit" variant="green" className="w-100 mb-4" disabled={loading}>
                    {loading ? 'Sending...' : 'Send OTP'}
                </Button>
                <Link to="/login" className="forgot-password-back-button"><Icon icon="ic:baseline-arrow-back" /> Back To Login</Link>
            </form>
        </div>
    )

    const renderStep2 = () => (
        <div className="forgot-password-step2 d-flex flex-column align-items-center justify-content-center">
            <img src={forgot2} alt="forgot-password" className="forgot-password-image" />
            <h2 className="forgot-password-title pt-4 pb-4">Enter Your Code</h2>
            <p className="forgot-password-description pb-4 text-center">We've sent a 6-digit code to your email. Please enter it below to verify your identity</p>
            <form className="forgot-password-form w-100 d-flex flex-column align-items-center justify-content-center" onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }}>
                <div className="d-flex gap-2 mb-4" style={{ maxWidth: '400px', width: '100%', justifyContent: 'center' }}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => handleOtpChange(e, index)}
                            onKeyDown={(e) => {
                                if (e.key === 'Backspace' && !digit && index > 0) {
                                    inputRefs.current[index - 1].focus();
                                }
                            }}
                            className="form-control text-center"
                            style={{
                                width: '80px',
                                height: '80px',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                border: '1px solid var(--lines-color)',
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                color: 'var(--text-primary)'
                            }}
                        />
                    ))}
                </div>
                <Button type="submit" variant="green" className="w-100 mb-4" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Link to="/login" className="forgot-password-back-button">
                    <Icon icon="ic:baseline-arrow-back" /> Back To Login
                </Link>
            </form>
        </div>
    )

    const renderStep3 = () => (
        <div className="forgot-password-step3 d-flex flex-column align-items-center justify-content-center">
            <img src={forgot3} alt="forgot-password" className="forgot-password-image" />
            <h2 className="forgot-password-title pt-4 pb-4">Set A New Password</h2>
            <p className="forgot-password-description pb-4 text-center">Your New Password Must Be Different From <br/> Previously Used Passwords</p>
            <form className="forgot-password-form w-100 d-flex flex-column align-items-center justify-content-center" onSubmit={(e) => { e.preventDefault(); handleResetPassword(); }}>
                <Input
                    variant="signup"
                    type="password"
                    name="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon="material-symbols-light:lock-outline"
                    focusColor="green"
                    showPasswordToggle={true}
                    required
                    className="mb-4"
                />
                <Input
                    variant="signup"
                    type="password"
                    name="confirmNewPassword"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    icon="material-symbols-light:lock-outline"
                    focusColor="green"
                    showPasswordToggle={true}
                    required
                    className="mb-4"
                />
                <div className="w-100 mb-4">
                    <div className="d-flex align-items-start mb-2">
                        <Icon icon="material-symbols:check-circle-outline-rounded" className="me-2" style={{ fontSize: '24px' }} />
                        <span className="forgot-password-password-hint">Must be at least 8 character</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <Icon icon="material-symbols:check-circle-outline-rounded" className="me-2" style={{ fontSize: '24px' }} />
                        <span className="forgot-password-password-hint">Must contain one special character</span>
                    </div>
                </div>
                <Button type="submit" variant="green" className="w-100 mb-4" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
            </form>
            <Link to="/login" className="forgot-password-back-button">
                <Icon icon="ic:baseline-arrow-back" /> Back To Login
            </Link>
        </div>
    )

    const renderStep4 = () => (
        <div className="forgot-password-step4 d-flex flex-column align-items-center justify-content-center">
            <img src={forgot4} alt="forgot-password" className="forgot-password-image" />
            <h2 className="forgot-password-title pt-4 pb-4">Password reset</h2>
            <p className="forgot-password-description pb-4 text-center">You’ve Successfully Created a New <br /> Password, Below To Login</p>
            <Button type="button" variant="green" className="w-100 mb-4" onClick={() => navigate("/login")}>
                Login
            </Button>
        </div>
    )

    return (
        <div className=" vh-100 d-flex justify-content-center align-items-center min-h-screen bg-gray-50 px-4">
            <ToastContainer />
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </div>
    );
}

export default ForgotPassword