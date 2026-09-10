import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { translations } from '../locales/translations';

export default function Header({ 
  currentStep, 
  lang, 
  voiceEnabled, 
  onToggleVoice 
}) {
  const t = translations[lang] || translations.hi;

  return (
    <div>
      <header className="app-header">
        <div className="brand-badge">
          <div className="brand-logo-icon">
            🖐️
          </div>
          <div>
            <div className="brand-title devanagari">
              {lang === 'mr' ? 'हँड्सऑफ (HandsOf)' : lang === 'hi' ? 'हैंड्सऑफ (HandsOf)' : 'HandsOf'}
            </div>
            <div className="brand-tagline">
              <span>See the Hands Behind the Craft</span>
              <span>• SIH26090</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className={`voice-toggle-btn ${voiceEnabled ? 'active' : ''}`}
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Voice guide is ON' : 'Voice guide is MUTED'}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span style={{ fontSize: '11px' }}>
              {voiceEnabled ? 'आवाज़ ON' : 'Mute'}
            </span>
          </button>
        </div>
      </header>

      {/* 3-Step Progress Indicator */}
      <div className="progress-bar-container">
        <span className="step-info devanagari">
          {t.stepIndicator} {currentStep} {t.of} 3
        </span>

        <div className="step-dots">
          <div 
            className={`step-dot ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`} 
          />
          <div 
            className={`step-dot ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`} 
          />
          <div 
            className={`step-dot ${currentStep === 3 ? 'active' : ''}`} 
          />
        </div>
      </div>
    </div>
  );
}
