import React from 'react';
import './TermsOfServiceScreen.css';

const TermsOfServiceScreen: React.FC = () => {
  return (
    <div className="terms-of-service-screen">
      <h2>Terms of Service</h2>
      <p>
        This is a placeholder for the Tonjam Terms of Service. By using Tonjam, you agree to these terms, which govern your use of our music streaming and NFT platform.
      </p>
      <p>
        <strong>Account Usage:</strong> You must provide accurate information when signing up via Google, Gmail, or Spotify authentication.
      </p>
      <p>
        <strong>Content Ownership:</strong> Users retain ownership of uploaded music and NFTs but grant Tonjam a license to display and distribute content.
      </p>
      <p>
        <strong>Prohibited Actions:</strong> Do not use Tonjam for illegal activities, unauthorized copying, or violating third-party rights.
      </p>
      <p>
        For the full Terms of Service, please contact our support team or update this section with your legal document.
      </p>
    </div>
  );
};

export default TermsOfServiceScreen;
