import React, { useState } from "react";
import "./AudioQualitySettingsScreen.css";

const AudioQualitySettingsScreen = () => {
  const [streamQuality, setStreamQuality] = useState("high");
  const [downloadQuality, setDownloadQuality] = useState("standard");
  const [adaptiveStreaming, setAdaptiveStreaming] = useState(true);
  const [equalizer, setEqualizer] = useState("Flat");
  const [dolbyEnabled, setDolbyEnabled] = useState(false);

  return (
    <div className="audio-quality-screen">
      <h2 className="title">Audio & Playback Settings</h2>

      <section className="section">
        <h3>Streaming Quality</h3>
        <div className="options">
          {["low", "standard", "high"].map((level) => (
            <label key={level} className={streamQuality === level ? "selected" : ""}>
              <input
                type="radio"
                name="stream-quality"
                value={level}
                checked={streamQuality === level}
                onChange={() => setStreamQuality(level)}
              />
              {level === "low" ? "Low (96 kbps)" :
               level === "standard" ? "Standard (160 kbps)" :
               "High (320 kbps)"}
            </label>
          ))}
        </div>
      </section>

      <section className="section">
        <h3>Download Quality</h3>
        <div className="options">
          {["low", "standard", "high"].map((level) => (
            <label key={level} className={downloadQuality === level ? "selected" : ""}>
              <input
                type="radio"
                name="download-quality"
                value={level}
                checked={downloadQuality === level}
                onChange={() => setDownloadQuality(level)}
              />
              {level === "low" ? "Low (96 kbps)" :
               level === "standard" ? "Standard (160 kbps)" :
               "High (320 kbps)"}
            </label>
          ))}
        </div>
      </section>

      <section className="section toggle-row">
        <label>
          <input
            type="checkbox"
            checked={adaptiveStreaming}
            onChange={() => setAdaptiveStreaming(!adaptiveStreaming)}
          />
          Enable Adaptive Streaming
        </label>
      </section>

      <section className="section">
        <h3>Equalizer Preset</h3>
        <select value={equalizer} onChange={(e) => setEqualizer(e.target.value)}>
          <option value="Flat">Flat</option>
          <option value="Bass Boost">Bass Boost</option>
          <option value="Treble Boost">Treble Boost</option>
          <option value="Vocal">Vocal</option>
          <option value="Dance">Dance</option>
        </select>
      </section>

      <section className="section toggle-row">
        <label>
          <input
            type="checkbox"
            checked={dolbyEnabled}
            onChange={() => setDolbyEnabled(!dolbyEnabled)}
          />
          Enable Dolby Atmos / Spatial Audio
        </label>
      </section>

      <div className="visualizer-preview">
        <span className="bar bar1"></span>
        <span className="bar bar2"></span>
        <span className="bar bar3"></span>
        <span className="bar bar4"></span>
      </div>

      <button className="save-btn">Save Preferences</button>
    </div>
  );
};

export default AudioQualitySettingsScreen;
