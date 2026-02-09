import React, { useState } from 'react'
import axiosInstance from '../axiosConfig'
import { useStaticInfo } from '../context/StaticInfoContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import Input from '../components/UI/Input'
import showYourTalentBg from '../assets/imgs/show-your-talent.png'

const ShowYourTalent = () => {
    const { staticInfo } = useStaticInfo();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        topic: '',
        ig: '',
        fb: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhoneNumber = (phone) => {
        const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        if (!cleanedPhone.startsWith('+')) {
            return false;
        }
        const digitsOnly = cleanedPhone.replace(/^\+/, '').replace(/\D/g, '');
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    };

    const validateURL = (url) => {
        if (!url.trim()) return true; // Optional field
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
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

        // Phone Number validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone Number is required';
        } else if (!validatePhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid international phone number starting with + (e.g., +1234567890)';
        }

        // Topic validation
        if (!formData.topic.trim()) {
            newErrors.topic = 'Topic is required';
        } else if (formData.topic.trim().length < 5) {
            newErrors.topic = 'Topic must be at least 5 characters';
        }

        // ig validation (optional)
        if (formData.ig.trim() && !validateURL(formData.ig)) {
            newErrors.ig = 'Please enter a valid URL';
        }

        // Facebook validation (optional)
        if (formData.fb.trim() && !validateURL(formData.fb)) {
            newErrors.fb = 'Please enter a valid URL';
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
            const submitData = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phoneNumber: formData.phoneNumber.trim(),
                topic: formData.topic.trim(),
                channelId: staticInfo?.channelId
            };

            // Only add socialLinks if at least one has a value
            const socialLinks = {};
            if (formData.ig.trim()) {
                socialLinks.ig = formData.ig.trim();
            }
            if (formData.fb.trim()) {
                socialLinks.fb = formData.fb.trim();
            }
            
            // Only include socialLinks if it has at least one property
            if (Object.keys(socialLinks).length > 0) {
                submitData.socialLinks = socialLinks;
            }

            console.log(submitData);

            await axiosInstance.post('/interview-applicant', submitData);
            toast.success('Thank you for your application! We will get back to you soon.');
            
            // Reset form
            setFormData({
                name: '',
                email: '',
                phoneNumber: '',
                topic: '',
                ig: '',
                fb: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.response?.data?.message || 'There was an error submitting your form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Header />
            <ToastContainer />

            <section className="show-your-talent-section">
                {/* Background Image - Under the whole section */}
                <div className="show-your-talent-image-wrapper">
                    <img src={showYourTalentBg} alt="Show Your Talent Background" className="show-your-talent-image" />
                    <div className="show-your-talent-overlay"></div>
                </div>

                {/* Content */}
                <div className="show-your-talent-container">
                    <div className="show-your-talent-content flex-column-center">
                        <h2 className="show-your-talent-title">Are You Talented</h2>
                        <p className="show-your-talent-description">
                            Do you have something interesting to talk about
                        </p>

                        <form className="show-your-talent-form" onSubmit={handleSubmit}>
                            <Input
                                variant="talent"
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={handleChange}
                                label="Name"
                                icon="material-symbols:person-outline"
                                focusColor="cyan"
                                error={errors.name}
                            />

                            <Input
                                variant="talent"
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                label="Email"
                                icon="material-symbols:mail-outline"
                                focusColor="cyan"
                                error={errors.email}
                            />

                            <Input
                                variant="talent"
                                type="tel"
                                name="phoneNumber"
                                placeholder="Enter your phone number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                label="Phone Number"
                                icon="material-symbols:phone-in-talk-outline-rounded"
                                focusColor="cyan"
                                error={errors.phoneNumber}
                            />

                            <Input
                                variant="talent"
                                type="text"
                                name="topic"
                                placeholder="Enter interview topic"
                                value={formData.topic}
                                onChange={handleChange}
                                label="Topic"
                                icon="material-symbols:topic-outline"
                                focusColor="cyan"
                                error={errors.topic}
                            />

                            <div className="talent-form-group talent-form-group-row">
                                <div className="talent-form-group-half">
                                    <Input
                                        variant="talent"
                                        type="url"
                                        name="ig"
                                        placeholder="https://instagram.com/username"
                                        value={formData.ig}
                                        onChange={handleChange}
                                        label="Instagram"
                                        icon="mdi:instagram"
                                        focusColor="cyan"
                                        error={errors.ig}
                                    />
                                </div>

                                <div className="talent-form-group-half">
                                    <Input
                                        variant="talent"
                                        type="url"
                                        name="fb"
                                        placeholder="https://facebook.com/username"
                                        value={formData.fb}
                                        onChange={handleChange}
                                        label="Facebook"
                                        icon="mdi:facebook"
                                        focusColor="cyan"
                                        error={errors.fb}
                                    />
                                </div>
                            </div>

                            <div className="talent-form-submit-wrapper">
                                <button
                                    type="submit"
                                    className="talent-form-submit-btn"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}

export default ShowYourTalent;