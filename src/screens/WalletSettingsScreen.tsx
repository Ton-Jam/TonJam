import React, { useState } from "react";
import "./WalletSettingsScreen.css";

const WalletSettingsScreen = () => {
  const [walletAddress, setWalletAddress] = useState("EQC9...bXaM");
  const [tjBalance, setTjBalance] = useState(124.50); // mock balance
  const [connected, setConnected] = useState(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    alert("Wallet address copied!");
  };

  const handleDisconnect = () => {
    setConnected(false);
    setWalletAddress("");
  };

  const handleConnect = () => {
    // mock connect logic
    setConnected(true);
    setWalletAddress("EQC9...bXaM");
  };

  return (
    <div className="wallet-settings-screen">
      <h2 className="wallet-header">🔗 Wallet</h2>

      {connected ? (
        <>
          <div className="wallet-box">
            <div className="wallet-row">
              <span className="wallet-label">Address:</span>
              <span className="wallet-value">{walletAddress}</span>
              <button className="wallet-btn" onClick={handleCopy}>Copy</button>
            </div>

            <div className="wallet-row">
              <span className="wallet-label">TJ Balance:</span>
              <span className="wallet-value">{tjBalance} $TJ</span>
            </div>

            <button className="disconnect-btn" onClick={handleDisconnect}>
              Disconnect Wallet
            </button>
          </div>
        </>
      ) : (
        <button className="connect-btn" onClick={handleConnect}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletSettingsScreen;
