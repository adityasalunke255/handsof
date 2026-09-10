import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  Mic, 
  MicOff, 
  Camera, 
  Image as ImageIcon, 
  Check, 
  Plus, 
  Minus, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  MessageCircle,
  X
} from 'lucide-react';
import { translations } from '../../locales/translations';

const QUICK_TAGS = [
  { id: 'kurti', label_hi: '✨ सूती कुर्ती', label_mr: '✨ सुती कुर्ती', label_en: 'Cotton Kurti', price: 499, cat: 'handloom' },
  { id: 'diya', label_hi: '🪔 मिट्टी का दीया', label_mr: '🪔 मातीचा दिवा', label_en: 'Clay Diya', price: 249, cat: 'pottery' },
  { id: 'saree', label_hi: '🧵 पैठणी साड़ी', label_mr: '🧵 पैठणी साडी', label_en: 'Paithani Saree', price: 1499, cat: 'handloom' },
  { id: 'chappal', label_hi: '👞 कोल्हापुरी चप्पल', label_mr: '👞 कोल्हापुरी चप्पल', label_en: 'Kolhapuri Chappal', price: 699, cat: 'leather' },
  { id: 'incense', label_hi: '🔔 पीतल अगरबत्ती स्टैंड', label_mr: '🔔 पितळी धूपपात्र', label_en: 'Brass Incense Holder', price: 350, cat: 'metalcraft' }
];

export default function AddProductModal({
  lang,
  onClose,
  onPublish,
  onSpeakText,
  onOpenStudio,
  isListening,
  onStartVoiceFill,
  onStopVoiceFill
}) {
  const t = translations[lang] || translations.hi;
  const vp = t.vendorPortal;

  const [title, setTitle] = useState('हाथ से बनी नीली कॉटन कुर्ती (Handmade Blue Cotton Kurti)');
  const [price, setPrice] = useState(499);
  const [stock, setStock] = useState(10);
  const [selectedCategory, setSelectedCategory] = useState('handloom');
  const [selectedImage, setSelectedImage] = useState(
    'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400&auto=format&fit=crop&q=80'
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const handleQuickTagClick = (tag) => {
    const tagName = lang === 'mr' ? tag.label_mr : lang === 'en' ? tag.label_en : tag.label_hi;
    setTitle(tagName.replace(/^[^\w\s\u0900-\u097F]+/, '').trim());
    setPrice(tag.price);
    setSelectedCategory(tag.cat);
    onSpeakText(tagName);
  };

  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    setIsPublishing(true);
    await onPublish({
      title,
      price: Number(price) || 499,
      stock: Number(stock) || 10,
      category: selectedCategory,
      image: selectedImage
    });
    setIsPublishing(false);
  };

  return (
    <div className="add-product-screen">
      {/* Top Header */}
      <div className="add-product-header">
        <button className="back-circle-btn" onClick={onClose} title="Go Back">
          <ArrowLeft size={18} />
        </button>

        <div className="add-product-title-group">
          <span className="brand-dot-orange">🪡</span>
          <h2 className="add-product-head-title devanagari">{vp.addProductTitle}</h2>
        </div>

        <button 
          className="audio-guide-pill-btn devanagari"
          onClick={() => onSpeakText(vp.voiceAiSubheading)}
          title="Listen to voice guide"
        >
          <Volume2 size={16} />
        </button>
      </div>

      <div className="add-product-scroll-area">
        {/* 1. VOICE AI BANNER (बोलकर जानकारी भरें) */}
        <div className="voice-ai-card">
          <div className="voice-ai-top">
            <div className="voice-ai-tag">
              <Mic size={14} color="#3B82F6" />
              <span className="devanagari">{vp.voiceAiHeading}</span>
            </div>
            <span className="voice-ai-badge">VOICE AI</span>
          </div>

          <div className="voice-ai-body">
            <button 
              className={`big-voice-mic-circle ${isListening ? 'listening-wave' : ''}`}
              onClick={isListening ? onStopVoiceFill : onStartVoiceFill}
              title="Tap to speak"
            >
              {isListening ? <MicOff size={28} color="white" /> : <Mic size={28} color="white" />}
            </button>

            <div className="voice-ai-prompt-text">
              <div className="voice-ai-say-label devanagari">{vp.voiceAiSubheading}</div>
              <div className="voice-ai-action-text devanagari">
                {isListening ? '🔴 ' + t.listening : '••• ' + vp.tapToSpeak}
              </div>
            </div>
          </div>
        </div>

        {/* 2. 3 STEPS PROGRESS BAR */}
        <div className="steps-pill-bar">
          <div className="steps-count-label devanagari">
            कदम / 3 Steps to Sell
          </div>
          <div className="steps-status-badge devanagari">
            Step 1 & 2 Active
          </div>
        </div>

        <div className="steps-track-line">
          <div className="step-item step-completed devanagari">
            <span>✓</span>
            <span>{vp.step1Photo}</span>
          </div>
          <div className="step-item step-active devanagari">
            <span>2.</span>
            <span>{vp.step2Price}</span>
          </div>
          <div className="step-item step-pending devanagari">
            <span>3.</span>
            <span>{vp.step3Live}</span>
          </div>
        </div>

        <form onSubmit={handlePublishSubmit}>
          {/* SECTION 1: PHOTOS */}
          <div className="form-card-panel">
            <div className="panel-title-row">
              <h3 className="panel-heading devanagari">{vp.photosHeading}</h3>
              <span className="photo-ready-pill devanagari">
                ✓ {vp.photoReadyBadge}
              </span>
            </div>
            <div className="panel-subheading devanagari">{vp.photosSubheading}</div>

            {/* AI Product Studio Quick Launch Banner */}
            <div style={{ marginBottom: '14px' }}>
              <button 
                type="button" 
                className="primary-btn devanagari"
                style={{ 
                  background: 'linear-gradient(135deg, #C85A32 0%, #D97706 100%)', 
                  width: '100%', 
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(200, 90, 50, 0.35)'
                }}
                onClick={onOpenStudio}
              >
                <Sparkles size={18} />
                <span>📸 {lang === 'mr' ? 'AI Product Studio उघडा' : 'AI Product Studio खोलें'} (Background Remove & Relighting)</span>
              </button>
            </div>

            {/* Photo Action Buttons: Camera & Gallery */}
            <div className="photo-actions-grid">
              <button 
                type="button" 
                className="photo-source-btn"
                onClick={onOpenStudio}
                title="Open AI Studio Camera"
              >
                <Camera size={24} color="var(--terracotta)" />
                <span className="btn-main-label devanagari">{vp.openCamera}</span>
                <span className="btn-sub-label">AI Studio कैमरा</span>
              </button>

              <button 
                type="button" 
                className="photo-source-btn"
                onClick={onOpenStudio}
                title="Open AI Studio Gallery"
              >
                <ImageIcon size={24} color="#3B82F6" />
                <span className="btn-main-label devanagari">{vp.pickGallery}</span>
                <span className="btn-sub-label">AI Studio गैलरी</span>
              </button>
            </div>

            {/* Photo Thumbnails */}
            <div className="photo-thumbnails-row">
              <div className="photo-thumb-box active-main">
                <img src={selectedImage} alt="Main photo" className="thumb-preview-img" />
                <div className="thumb-check-badge">
                  <Check size={12} color="white" />
                </div>
                <div className="thumb-label-tag devanagari">{vp.mainPhotoTag}</div>
              </div>

              <div 
                className="photo-thumb-box add-placeholder"
                onClick={() => alert('Add additional angle photos')}
              >
                <Plus size={20} color="var(--silk-muted)" />
                <span className="devanagari" style={{ fontSize: '11px', color: 'var(--silk-muted)' }}>
                  {vp.addMorePhotos}
                </span>
              </div>

              <div 
                className="photo-thumb-box add-placeholder"
                onClick={() => alert('Add back side photo')}
              >
                <span style={{ fontSize: '18px' }}>🔄</span>
                <span className="devanagari" style={{ fontSize: '11px', color: 'var(--silk-muted)' }}>
                  {vp.backSidePhoto}
                </span>
              </div>
            </div>

            {/* Daylight Tip Banner */}
            <div className="photo-tip-callout devanagari">
              <span>{vp.photoTip}</span>
            </div>
          </div>

          {/* SECTION 2: DETAILS & ZERO-COMMISSION PRICING */}
          <div className="form-card-panel" style={{ marginTop: '16px' }}>
            <div className="panel-title-row">
              <h3 className="panel-heading devanagari">{vp.detailsHeading}</h3>
            </div>
            <div className="panel-subheading devanagari">{vp.detailsSubheading}</div>

            {/* Product Name Field */}
            <div className="field-group" style={{ marginTop: '14px' }}>
              <div className="field-header-line">
                <label className="field-title-label devanagari">{vp.productNameLabel}</label>
                <button 
                  type="button" 
                  className="inline-voice-btn devanagari"
                  onClick={() => onSpeakText('कृपया सामान का नाम बताएं')}
                >
                  <Mic size={13} />
                  <span>बोलें</span>
                </button>
              </div>

              <input
                type="text"
                className="text-input devanagari"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={vp.productNamePlaceholder}
                required
              />

              {/* Quick Tap Suggestions */}
              <div className="quick-tags-section">
                <div className="quick-tags-label devanagari">{vp.quickTapLabel}</div>
                <div className="quick-tags-wrap">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className="quick-tag-chip devanagari"
                      onClick={() => handleQuickTagClick(tag)}
                    >
                      {lang === 'mr' ? tag.label_mr : lang === 'en' ? tag.label_en : tag.label_hi}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selling Price & Zero-Commission Breakdown */}
            <div className="field-group" style={{ marginTop: '20px' }}>
              <label className="field-title-label devanagari">{vp.sellingPriceLabel}</label>

              <div className="price-input-big-box">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  className="price-number-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min={10}
                  required
                />
              </div>

              {/* Zero-Commission GovTech Breakdown Card */}
              <div className="zero-fee-breakdown-card">
                <div className="breakdown-row">
                  <span className="breakdown-label devanagari">{vp.buyerPays}</span>
                  <span className="breakdown-val">₹{price}</span>
                </div>

                <div className="breakdown-row highlight-green">
                  <span className="breakdown-label devanagari">{vp.appFeeZero}</span>
                  <span className="breakdown-val green-text">{vp.zeroCommissionNote}</span>
                </div>

                <div className="breakdown-divider" />

                <div className="breakdown-row total-bank-row">
                  <span className="breakdown-label devanagari" style={{ fontWeight: 700, color: 'white' }}>
                    🏛️ {vp.bankDepositNote}
                  </span>
                  <span className="breakdown-val green-bold">₹{price}</span>
                </div>
                <div className="bank-subtext devanagari">
                  सीधे हर बुधवार को आपके बैंक में जमा (Direct Bank Transfer)
                </div>
              </div>
            </div>

            {/* Available Quantity / Stock Stepper */}
            <div className="field-group" style={{ marginTop: '20px' }}>
              <label className="field-title-label devanagari">{vp.availableQuantityLabel}</label>
              <div className="field-hint-text devanagari">{vp.availableQuantitySub}</div>

              <div className="quantity-stepper-big">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setStock(Math.max(1, stock - 1))}
                  disabled={stock <= 1}
                >
                  <Minus size={20} />
                </button>

                <div className="qty-val-display">
                  <span className="qty-number">{stock}</span>
                  <span className="qty-unit devanagari">{vp.piecesUnit}</span>
                </div>

                <button
                  type="button"
                  className="qty-btn"
                  onClick={() => setStock(stock + 1)}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Seller WhatsApp Help Box */}
          <div className="seller-help-card">
            <div className="help-icon-circle">
              <MessageCircle size={22} color="#10B981" />
            </div>
            <div>
              <div className="help-card-title devanagari">सैलर मित्र सहायता</div>
              <div className="help-card-desc devanagari">मदद चाहिए? WhatsApp पर अपने कोऑर्डिनेटर से पूछें।</div>
            </div>
            <button 
              type="button"
              className="whatsapp-ask-btn devanagari"
              onClick={() => alert('Connecting to WhatsApp Coordinator...')}
            >
              बात करें
            </button>
          </div>

          {/* Bottom Sticky Publish Button */}
          <div className="publish-action-bar">
            <div className="publish-guarantee-note devanagari">
              {vp.publishNotice}
            </div>

            <button
              type="submit"
              className="publish-submit-btn devanagari"
              disabled={isPublishing}
            >
              <CheckCircle2 size={20} />
              <span>{isPublishing ? 'लाइव हो रहा है...' : vp.publishNowBtn}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
