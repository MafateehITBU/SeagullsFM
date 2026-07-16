const DEVELOPER_NAME = 'Abdullah Al-sbateen'

const sectionTitleClass =
  'mb-3 mt-8 font-sans text-xl font-black tracking-[-0.02em] text-white md:text-2xl first:mt-0'

const bodyClass = 'm-0 font-sans text-base leading-relaxed text-white/85 md:text-lg'

export default function PrivacyPolicy() {
  return (
    <main className="w-full overflow-x-hidden bg-[#0c0c0c]">
      <section className="beat-section-x pb-6 pt-10 md:pb-8 md:pt-5">
        <div className="beat-section-inset">
          <h1 className="beat-gradient-text mb-2 text-[clamp(2rem,11vw,4rem)] font-black leading-[0.92] tracking-[-0.04em]">
            Privacy Policy
          </h1>
        </div>
      </section>

      <section className="beat-section-x pb-16 md:pb-24">
        <div className="beat-section-inset max-w-4xl">
          <p className={`${bodyClass} mb-8`}>
            This Privacy Policy applies to <strong className="text-white">Beat FM</strong>
            {` (“the App”), the website at mybeat.fm, and related services operated by `}
            <strong className="text-white">{DEVELOPER_NAME}</strong>. By using Beat FM, you
            agree to the collection and use of information as described in this policy.
          </p>

          <h2 className={sectionTitleClass}>Information We Collect</h2>
          <p className={`${bodyClass} mb-4`}>
            We may collect information you provide when you create an account (such as name,
            email address, and optionally phone number), information about how you use the App
            and website (including listening preferences and usage data), and technical
            information (such as device type and IP address) necessary to provide the service.
          </p>

          <h2 className={sectionTitleClass}>How We Use Your Information</h2>
          <p className={`${bodyClass} mb-4`}>
            We use the information to provide, maintain, and improve Beat FM; to communicate
            with you about the service; to personalise your experience where applicable; and to
            comply with legal obligations. We do not sell your personal information to third
            parties.
          </p>

          <h2 className={sectionTitleClass}>Cookies and Similar Technologies</h2>
          <p className={`${bodyClass} mb-4`}>
            Our website may use cookies and similar technologies to remember your preferences
            and to understand how the site is used. You can control cookie settings through your
            browser.
          </p>

          <h2 className={sectionTitleClass}>Data Storage and Security</h2>
          <p className={`${bodyClass} mb-4`}>
            We store your data securely and retain it only for as long as necessary to provide
            the service and fulfil the purposes described in this policy. We take reasonable
            measures to protect your information from unauthorised access or disclosure.
          </p>

          <h2 className={sectionTitleClass}>Third Parties</h2>
          <p className={`${bodyClass} mb-4`}>
            We may use third-party services (such as hosting, analytics, or authentication) that
            process data on our behalf. These providers are bound by agreements to protect your
            data and use it only for the purposes we specify.
          </p>

          <h2 className={sectionTitleClass}>Your Rights</h2>
          <p className={`${bodyClass} mb-4`}>
            Depending on your location, you may have the right to access, correct, or delete
            your personal data, or to object to or restrict certain processing. You can manage
            your account and request deletion of your data through the App or by contacting us.
            Account deletion is available from your profile settings in the Beat FM app.
          </p>

          <h2 className={sectionTitleClass}>Children</h2>
          <p className={`${bodyClass} mb-4`}>
            Beat FM is not directed at children under 13. We do not knowingly collect personal
            information from children under 13. If you believe we have collected such
            information, please contact us so we can delete it.
          </p>

          <h2 className={sectionTitleClass}>Changes to This Policy</h2>
          <p className={`${bodyClass} mb-4`}>
            We may update this Privacy Policy from time to time. We will post the updated policy
            on this page and, where appropriate, notify you through the App or by email. The
            “Last updated” date below indicates when the policy was last revised.
          </p>

          <h2 className={sectionTitleClass}>Contact Us</h2>
          <p className={`${bodyClass} mb-2`}>
            If you have questions about this Privacy Policy or your personal data, please
            contact us at the contact details provided on the Beat FM website (mybeat.fm) or
            within the Beat FM app.
          </p>
          <p className={`${bodyClass} mt-6 text-white/60`}>Last updated: February 2025</p>
        </div>
      </section>
    </main>
  )
}
