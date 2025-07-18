import React, { useState } from "react";
import "./LanguageSettingsScreen.css";

const LanguageSettingsScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedRegion, setSelectedRegion] = useState("NG");

  const languages = [
    { code: "en", name: "English" },
    { code: "fr", name: "French" },
    { code: "es", name: "Spanish" },
    { code: "pt", name: "Portuguese" },
    { code: "sw", name: "Swahili" },
  ];

  const regions = [
    { code: "NG", name: "Nigeria" },
    { code: "GH", name: "Ghana" },
    { code: "ZA", name: "South Africa" },
    { code: "KE", name: "Kenya" },
    { code: "US", name: "United States" },
  ];

  return (
    <div className="language-settings-screen">
      <h2 className="settings-title">🌍 Language & Region</h2>

      <div className="settings-section">
        <label>App Language</label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-section">
        <label>Preferred Region</label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSettingsScreen;
