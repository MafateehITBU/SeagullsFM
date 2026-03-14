import React from 'react';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import { formatTextWithSpecialChars } from '../utils/formatTextWithSpecialChars';

const DEVELOPER_NAME = 'Abdullah Al-sbateen';

const PrivacyPolicy = () => {
  return (
    <>
      <Header />
      <section className="about-hero-section privacy-hero-section">
        <div className="about-hero-container privacy-hero-container">
          <h1 className="about-hero-title mb-3">Privacy Policy</h1>
        </div>
      </section>

      <section className="who-we-are-section flex-column-start privacy-content-section" style={{ height: 'auto', minHeight: 'auto', paddingBottom: '3rem' }}>
        <p className="who-we-are-description" style={{ marginBottom: '2rem' }}>
          {formatTextWithSpecialChars('This Privacy Policy applies to ')}
          <strong>Mood FM</strong>
          {formatTextWithSpecialChars(' (\u201Cthe App\u201D), the website at mood.fm, and related services operated by ')}
          <strong>{DEVELOPER_NAME}</strong>
          {formatTextWithSpecialChars('. By using Mood FM, you agree to the collection and use of information as described in this policy.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Information We Collect</h2>
        <p className="who-we-are-description" style={{ marginBottom: '1rem' }}>
          {formatTextWithSpecialChars('We may collect information you provide when you create an account (such as name, email address, and optionally phone number), information about how you use the App and website (including listening preferences and usage data), and technical information (such as device type and IP address) necessary to provide the service.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>How We Use Your Information</h2>
        <p className="who-we-are-description" style={{ marginBottom: '1rem' }}>
          {formatTextWithSpecialChars('We use the information to provide, maintain, and improve Mood FM; to communicate with you about the service; to personalise your experience where applicable; and to comply with legal obligations. We do not sell your personal information to third parties.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Cookies and Similar Technologies</h2>
        <p className="who-we-are-description" style={{ marginBottom: '1rem' }}>
          {formatTextWithSpecialChars('Our website may use cookies and similar technologies to remember your preferences and to understand how the site is used. You can control cookie settings through your browser.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Data Storage and Security</h2>
        <p className="who-we-are-description" style={{ marginBottom: '1rem' }}>
          {formatTextWithSpecialChars('We store your data securely and retain it only for as long as necessary to provide the service and fulfil the purposes described in this policy. We take reasonable measures to protect your information from unauthorised access or disclosure.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Third Parties</h2>
        <p className="who-we-are-description" style={{ marginBottom: '1rem' }}>
          {formatTextWithSpecialChars('We may use third-party services (such as hosting, analytics, or authentication) that process data on our behalf. These providers are bound by agreements to protect your data and use it only for the purposes we specify.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Your Rights</h2>
        <p className="who-we-are-description" style={{ marginBottom: '1rem' }}>
          {formatTextWithSpecialChars('Depending on your location, you may have the right to access, correct, or delete your personal data, or to object to or restrict certain processing. You can manage your account and request deletion of your data through the App or by contacting us. Account deletion is available from your profile settings in the Mood FM app.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Children</h2>
        <p className="who-we-are-description" style={{ marginBottom: '1rem' }}>
          {formatTextWithSpecialChars('Mood FM is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us so we can delete it.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Changes to This Policy</h2>
        <p className="who-we-are-description" style={{ marginBottom: '1rem' }}>
          {formatTextWithSpecialChars('We may update this Privacy Policy from time to time. We will post the updated policy on this page and, where appropriate, notify you through the App or by email. The \u201CLast updated\u201D date below indicates when the policy was last revised.')}
        </p>

        <h2 className="who-we-are-title" style={{ fontSize: '1.5rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>Contact Us</h2>
        <p className="who-we-are-description" style={{ marginBottom: '0.5rem' }}>
          {formatTextWithSpecialChars('If you have questions about this Privacy Policy or your personal data, please contact us at the contact details provided on the Mood FM website (mood.fm) or within the Mood FM app.')}
        </p>
        <p className="who-we-are-description" style={{ marginTop: '1.5rem', opacity: 0.8 }}>
          {formatTextWithSpecialChars('Last updated: February 2025')}
        </p>
      </section>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
