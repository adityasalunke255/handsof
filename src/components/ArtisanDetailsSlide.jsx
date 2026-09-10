import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Volume2, 
  Mic, 
  MicOff, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { 
  translations, 
  CRAFT_OPTIONS, 
  STATES_AND_CLUSTERS, 
  SOCIAL_CATEGORIES 
} from '../locales/translations';

export default function ArtisanDetailsSlide({
  lang,
  formData,
  setFormData,
  onSpeakText,
  onStartVoiceDictation,
  onStopVoiceDictation,
  dictatingField,
  onSubmit,
  onBack,
  isSubmitting
}) {
  const t = translations[lang] || translations.hi;
  const [errorMsg, setErrorMsg] = useState('');
  const [hasNoEmail, setHasNoEmail] = useState(false);

  // Calculate age from Date of Birth
  const calculateAge = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return isNaN(age) ? null : age;
  };

  const handleDobChange = (e) => {
    const val = e.target.value;
    const age = calculateAge(val);
    setFormData((prev) => ({
      ...prev,
      date_of_birth: val,
      age: age || prev.age
    }));
  };

  const handleCraftSelect = (craftId) => {
    const selectedCraft = CRAFT_OPTIONS.find(c => c.id === craftId);
    setFormData((prev) => ({
      ...prev,
      craft_category: t.crafts[craftId] || craftId,
      craft_specialty: selectedCraft?.defaultSpecialty || ''
    }));
  };

  const handleStateChange = (e) => {
    const newState = e.target.value;
    const foundCluster = STATES_AND_CLUSTERS.find(s => s.state === newState);
    setFormData((prev) => ({
      ...prev,
      state: newState,
      district: foundCluster ? foundCluster.districts[0] : ''
    }));
  };

  const currentDistricts = 
    STATES_AND_CLUSTERS.find(s => s.state === formData.state)?.districts || [];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.full_name || formData.full_name.trim().length < 2) {
      setErrorMsg(t.nameSpokenPrompt);
      onSpeakText(t.nameSpokenPrompt);
      return;
    }

    const cleanPhone = formData.phone ? formData.phone.replace(/\D/g, '') : '';
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg(t.phoneError);
      onSpeakText(t.phoneError);
      return;
    }

    if (!formData.craft_category) {
      setErrorMsg(t.selectCraftHint);
      onSpeakText(t.craftSpokenPrompt);
      return;
    }

    onSubmit();
  };

  return (
    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="slide-hero">
        <h2 className="slide-title devanagari">
          {t.detailsTitle}
        </h2>
        <p className="slide-subtitle devanagari">
          {t.detailsSubtitle}
        </p>
      </div>

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #EF4444',
          color: '#FCA5A5',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }} className="devanagari">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2-COLUMN RESPONSIVE GRID FOR DESKTOP / SINGLE COLUMN FOR MOBILE */}
      <div className="form-desktop-grid">
        {/* COLUMN 1: PERSONAL & CONTACT INFO */}
        <div className="form-column">
          {/* 1. Full Name with Mic Dictation */}
          <div className="field-block">
            <div className="field-label-row">
              <label className="field-label devanagari">
                <User size={15} color="var(--marigold)" />
                <span>{t.nameLabel} *</span>
              </label>
              <button
                type="button"
                className="field-audio-prompt-btn devanagari"
                onClick={() => onSpeakText(t.nameSpokenPrompt)}
                title="Hear label aloud"
              >
                <Volume2 size={13} />
                <span>{t.listenVoice}</span>
              </button>
            </div>

            <div className="input-with-voice">
              <input
                type="text"
                className="text-input devanagari"
                placeholder={t.namePlaceholder}
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
              <button
                type="button"
                className={`mic-dictate-btn ${dictatingField === 'full_name' ? 'listening' : ''}`}
                onClick={() => {
                  if (dictatingField === 'full_name') {
                    onStopVoiceDictation();
                  } else {
                    onStartVoiceDictation('full_name');
                  }
                }}
                title={dictatingField === 'full_name' ? 'Stop listening' : 'Tap to speak name'}
              >
                {dictatingField === 'full_name' ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            </div>
          </div>

          {/* 2. Phone Number */}
          <div className="field-block">
            <div className="field-label-row">
              <label className="field-label devanagari">
                <Phone size={15} color="var(--marigold)" />
                <span>{t.phoneLabel} *</span>
              </label>
              <button
                type="button"
                className="field-audio-prompt-btn devanagari"
                onClick={() => onSpeakText(t.phoneSpokenPrompt)}
              >
                <Volume2 size={13} />
                <span>{t.listenVoice}</span>
              </button>
            </div>

            <div className="phone-input-wrapper">
              <div className="country-flag-box">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                className="text-input"
                placeholder={t.phonePlaceholder}
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, phone: val });
                }}
                required
              />
            </div>
          </div>

          {/* 3. Email Address (Optional with skip toggle) */}
          <div className="field-block">
            <div className="field-label-row">
              <label className="field-label devanagari">
                <Mail size={15} color="var(--silk-muted)" />
                <span>{t.emailLabel}</span>
              </label>
              <button
                type="button"
                className="field-audio-prompt-btn devanagari"
                style={{ color: 'var(--silk-muted)' }}
                onClick={() => {
                  setHasNoEmail(!hasNoEmail);
                  if (!hasNoEmail) {
                    setFormData({ ...formData, email: '' });
                  }
                }}
              >
                <span style={{ textDecoration: 'underline' }}>{t.noEmailText}</span>
              </button>
            </div>

            {!hasNoEmail && (
              <input
                type="email"
                className="text-input"
                placeholder={t.emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            )}
          </div>

          {/* 4. Date of Birth & Auto Age */}
          <div className="field-block">
            <div className="field-label-row">
              <label className="field-label devanagari">
                <Calendar size={15} color="var(--marigold)" />
                <span>{t.dobLabel}</span>
              </label>
              <button
                type="button"
                className="field-audio-prompt-btn devanagari"
                onClick={() => onSpeakText(t.dobSpokenPrompt)}
              >
                <Volume2 size={13} />
                <span>{t.listenVoice}</span>
              </button>
            </div>

            <div className="dob-row">
              <input
                type="date"
                className="date-input"
                value={formData.date_of_birth}
                onChange={handleDobChange}
                max={new Date().toISOString().split('T')[0]}
              />
              {formData.age ? (
                <div className="age-badge">
                  <span className="age-badge-val">{formData.age}</span>
                  <span className="devanagari">{t.yearsOld}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* 5. State & Artisan Cluster */}
          <div className="field-block">
            <div className="field-label-row">
              <label className="field-label devanagari">
                <MapPin size={15} color="var(--marigold)" />
                <span>{t.locationLabel}</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
              <select 
                className="select-input"
                value={formData.state}
                onChange={handleStateChange}
              >
                {STATES_AND_CLUSTERS.map((s) => (
                  <option key={s.state} value={s.state}>
                    {s.state}
                  </option>
                ))}
              </select>

              <select
                className="select-input"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              >
                {currentDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* COLUMN 2: CRAFT & GOVERNMENT SCHEME ELIGIBILITY */}
        <div className="form-column">
          {/* Craft / Trade Visual Grid */}
          <div className="field-block">
            <div className="field-label-row">
              <label className="field-label devanagari">
                <Sparkles size={15} color="var(--marigold)" />
                <span>{t.craftLabel} *</span>
              </label>
              <button
                type="button"
                className="field-audio-prompt-btn devanagari"
                onClick={() => onSpeakText(t.craftSpokenPrompt)}
              >
                <Volume2 size={13} />
                <span>{t.listenVoice}</span>
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--silk-muted)', marginBottom: '8px' }} className="devanagari">
              {t.selectCraftHint}
            </p>

            <div className="craft-grid">
              {CRAFT_OPTIONS.map((c) => {
                const craftName = t.crafts[c.id] || c.id;
                const isSelected = formData.craft_category === craftName;

                return (
                  <div
                    key={c.id}
                    className={`craft-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCraftSelect(c.id)}
                  >
                    <div className="craft-icon">{c.icon}</div>
                    <div className="craft-title devanagari">{craftName}</div>
                    {isSelected && (
                      <div className="craft-badge-check">
                        ✓ Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Category (VISVAS Scheme Eligibility) */}
          <div className="field-block">
            <div className="field-label-row">
              <label className="field-label devanagari">
                <ShieldCheck size={15} color="#4ADE80" />
                <span>{t.socialCatLabel}</span>
              </label>
              <button
                type="button"
                className="field-audio-prompt-btn devanagari"
                onClick={() => onSpeakText(t.socialCatSpokenPrompt)}
              >
                <Volume2 size={13} />
                <span>{t.listenVoice}</span>
              </button>
            </div>

            <div className="social-category-chips">
              {SOCIAL_CATEGORIES.map((cat) => {
                const isSelected = formData.social_category === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => setFormData({ ...formData, social_category: cat.id })}
                  >
                    <span>{cat.id}</span>
                    {cat.visvas && (
                      <span className="visvas-pill-tag">VISVAS 5%</span>
                    )}
                  </div>
                );
              })}
            </div>

            <p style={{ fontSize: '12px', color: '#4ADE80', marginTop: '6px' }} className="devanagari">
              ℹ️ {t.visvasNote}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bottom-bar">
        <button
          type="button"
          className="secondary-btn devanagari"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          <span>{t.backBtn}</span>
        </button>

        <button
          type="submit"
          className="primary-btn devanagari"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>{t.submitting}</span>
          ) : (
            <>
              <span>{t.submitProfile}</span>
              <CheckCircle2 size={18} />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
