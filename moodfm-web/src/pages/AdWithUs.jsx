import React, { useState } from 'react'
import axiosInstance from '../axiosConfig'
import { useStaticInfo } from '../context/StaticInfoContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import Input from '../components/UI/Input'
import adBg from "../assets/imgs/ad-bg.png"

const AdWithUs = () => {
    const { staticInfo } = useStaticInfo();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        phoneNumber: '',
        message: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone) => {
        // International phone number validation
        const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, ''); // Remove spaces, dashes, parentheses, dots
        
        if (!cleanedPhone.startsWith('+')) {
            return false;
        }
        
        // Remove + prefix for digit counting
        const digitsOnly = cleanedPhone.replace(/^\+/, '').replace(/\D/g, '');
        
        // International numbers should have 7-15 digits (after country code)
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Company Name validation
        if (!formData.companyName.trim()) {
            newErrors.companyName = 'Company Name is required';
        } else if (formData.companyName.trim().length < 2) {
            newErrors.companyName = 'Company Name must be at least 2 characters';
        }

        // Phone Number validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone Number is required';
        } else if (!validatePhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid international phone number starting with + (e.g., +1234567890)';
        }

        // Message validation
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submitting
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            formData.channelId = staticInfo.channelId;

            await axiosInstance.post('/ad', formData);
            // Success toast for advertisement inquiry
            toast.success('Thank you for your inquiry! We will get back to you soon.');
            

            // Reset form
            setFormData({
                name: '',
                email: '',
                companyName: '',
                phoneNumber: '',
                message: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('There was an error submitting your form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <ToastContainer />

            <section className="ad-with-us-section">
                <div className="ad-with-us-container flex-between">
                    {/* Left Side */}
                    <div className="ad-with-us-left flex-column-start">
                        <div className="ad-with-us-image-wrapper">
                            <img src={adBg} alt="Ad Background" className="ad-with-us-image" />
                            <div className="ad-with-us-overlay"></div>
                        </div>
                        <div className="ad-with-us-content-wrapper">
                            <h3 className="ad-with-us-label">Ad With Us</h3>
                            <h2 className="ad-with-us-title">Put Your Brand On Air</h2>
                            <p className="ad-with-us-description">
                                PROMOTE YOUR BRAND ON MOOD FM AND CONNECT WITH AN ENGAGED <br/> AUDIENCE THROUGH ON-AIR SPOTS, SPONSORED PROGRAMS, AND DIGITAL <br/> CAMPAIGNS
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="ad-with-us-right">
                        <form className="ad-with-us-form" onSubmit={handleSubmit}>
                            <Input
                                variant="ad"
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                icon="material-symbols:person-outline"
                                focusColor="green"
                                error={errors.name}
                            />

                            <Input
                                variant="ad"
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                icon="material-symbols:mail-outline"
                                focusColor="green"
                                error={errors.email}
                            />

                            <Input
                                variant="ad"
                                type="text"
                                name="companyName"
                                placeholder="Company Name"
                                value={formData.companyName}
                                onChange={handleChange}
                                icon="material-symbols:garage-home-outline-rounded"
                                focusColor="green"
                                error={errors.companyName}
                            />

                            <Input
                                variant="ad"
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number (e.g., +1234567890)"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                icon="material-symbols:phone-in-talk-outline-rounded"
                                focusColor="green"
                                error={errors.phoneNumber}
                            />

                            <div className="ad-form-group">
                                <div className="ad-form-input-wrapper">
                                    <textarea
                                        name="message"
                                        placeholder="Message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className={`ad-form-input ad-form-textarea ${errors.message ? 'ad-form-input-error' : ''}`}
                                        rows="5"
                                    />
                                </div>
                                {errors.message && <span className="ad-form-error">{errors.message}</span>}
                            </div>

                            <button
                                type="submit"
                                className="ad-form-submit-btn"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}

export default AdWithUs;