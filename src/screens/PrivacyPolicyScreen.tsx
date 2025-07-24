import React from 'react';
import './PrivacyPolicyScreen.css';

const PrivacyPolicyScreen: React.FC = () => {
  return (
    <div className="privacy-policy-screen">
      <h2>Privacy Policy</h2>
      <p>
        This is a placeholder for the Tonjam Privacy Policy. Your privacy is important to us. This policy will outline how we collect, use, and protect your personal information.
      </p>
      <p>
        <strong>Data Collection:</strong> We collect information such as email addresses and Spotify/Google account details when you sign in or link accounts via Supabase authentication.
      </p>
      <p>
        <strong>Data Usage:</strong> Your data is used to personalize your experience, manage your account, and provide access to features like song uploads and NFT minting.
      </p>
      <p>
        <strong>Data Protection:</strong> We use industry-standard security measures to protect your data, stored securely with Supabase.
      </p>
      <p>
        For the full Privacy Policy, please contact our support team or update this section with your legal document.
      </p>
    </div>
  );
};

export default PrivacyPolicyScreen;
