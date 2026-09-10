import React from 'react';
import { Volume2, ArrowRight } from 'lucide-react';
import { translations } from '../locales/translations';

const LANGUAGES = [
  {
    id: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    icon: '🇮🇳',
    sampleVoiceText: 'नमस्ते! हैंड्सऑफ में आपका स्वागत है। कारीगरी के पीछे का हुनर।'
  },
  {
    id: 'mr',
    nativeName: 'मराठी',
    englishName: 'Marathi',
    icon: '🚩',
    sampleVoiceText: 'नमस्कार! हँड्सऑफ मध्ये आपले स्वागत आहे. कलेमागील खरा हात.'
  },
  {
    id: 'en',
    nativeName: 'English',
    englishName: 'English',
    icon: '🌐',
    sampleVoiceText: 'Welcome to HandsOf. See the Hands Behind the Craft.'
  }
];

export default function LanguageSelectionSlide({ 
  selectedLang, 
  onSelectLang, 
  onPlaySample, 
  onNext 
}) {
  const t = translations[selectedLang] || translations.hi;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="slide-hero">
        <h1 className="slide-title devanagari">
          {t.welcomeTitle}
        </h1>
        <p className="slide-subtitle devanagari">
          {t.welcomeSubtitle}
        </p>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '15px', color: 'var(--marigold)', fontWeight: 700, letterSpacing: '0.3px' }} className="devanagari">
          {t.selectLangPrompt}
        </h2>
      </div>

      <div className="language-cards-grid">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.id;
          return (
            <div
              key={lang.id}
              className={`language-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectLang(lang.id)}
            >
              <div className="language-card-left">
                <div className="lang-icon-badge">
                  {lang.icon}
                </div>
                <div className="lang-text-group">
                  <span className="lang-native-name devanagari">
                    {lang.nativeName}
                  </span>
                  <span className="lang-english-name">
                    {lang.englishName}
                  </span>
                </div>
              </div>

              <div className="lang-action-group">
                <button
                  type="button"
                  className="listen-sample-btn devanagari"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySample(lang.sampleVoiceText, lang.id);
                  }}
                  title="Listen to pronunciation sample"
                >
                  <Volume2 size={13} />
                  <span>{t.listenVoice}</span>
                </button>

                <div className="radio-indicator">
                  {isSelected && <div className="radio-check" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <button 
          className="primary-btn devanagari"
          onClick={onNext}
        >
          <span>{t.continueBtn}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
