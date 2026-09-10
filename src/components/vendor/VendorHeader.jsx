import React from 'react';
import { Globe, Mic, User, Edit3, HelpCircle } from 'lucide-react';
import { translations } from '../../locales/translations';

export default function VendorHeader({ 
  lang, 
  onSelectLang, 
  artisanData, 
  onOpenVoiceQuery,
  onOpenOnboarding,
  onOpenHelpline
}) {
  const t = translations[lang] || translations.hi;
  const vp = t.vendorPortal;

  const artisanName = artisanData?.full_name || 'रमेश पाटील';
  const shopName = artisanData?.craft_category || 'हस्तकला साथी';

  return (
    <header className="vendor-header">
      <div className="vendor-header-left">
        <div className="vendor-avatar-circle" title="Artisan Profile">
          <span style={{ fontSize: '20px' }}>🖐️</span>
        </div>
        <div className="vendor-shop-meta">
          <div className="vendor-brand-badge">
            <span className="brand-dot-pulse" />
            <span className="vendor-brand-tag">HandsOf • Code Pragya (SIH26090)</span>
            <span className="supabase-live-badge" title="Live Supabase Cloud DB Connected">
              <span className="live-db-dot" />
              <span>Supabase DB</span>
            </span>
          </div>
          <div className="vendor-shop-name devanagari">
            {artisanName} • {shopName}
          </div>
        </div>
      </div>

      <div className="vendor-header-right">
        {/* Edit Profile / Details Button */}
        <button 
          className="edit-profile-btn devanagari"
          onClick={onOpenOnboarding}
          title="Edit Profile Details / भाषा व जानकारी बदलें"
        >
          <Edit3 size={13} />
          <span>प्रोफाइल व भाषा बदलें</span>
        </button>

        {/* Language selector pill */}
        <div className="lang-switcher-pill">
          <Globe size={14} color="var(--marigold)" />
          <select 
            value={lang} 
            onChange={(e) => onSelectLang(e.target.value)}
            className="lang-select-dropdown"
          >
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Voice query mic button */}
        <button 
          className="voice-quick-mic-btn"
          onClick={onOpenVoiceQuery}
          title="बोलकर पूछें / Voice Assistant"
        >
          <Mic size={17} />
        </button>

        {/* Helpline quick button */}
        {onOpenHelpline && (
          <button
            className="voice-quick-mic-btn"
            style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: 'var(--marigold)' }}
            onClick={onOpenHelpline}
            title="Helpline"
          >
            <HelpCircle size={17} />
          </button>
        )}
      </div>
    </header>
  );
}
