import React, { useState } from 'react';
import { 
  Play, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  Truck, 
  QrCode, 
  Printer, 
  TrendingUp, 
  Package, 
  Camera, 
  BookOpen, 
  PhoneCall, 
  ShieldCheck, 
  CheckCircle2,
  CheckCircle,
  X,
  Edit3
} from 'lucide-react';
import { translations } from '../../locales/translations';

export default function VendorHome({
  lang,
  artisanData,
  products,
  onToggleProductStatus,
  onNavigateTab,
  onPlayTodaySummary,
  isPlayingSummary,
  onOpenVoiceQuery,
  onEditProfile,
  onOpenStudio
}) {
  const t = translations[lang] || translations.hi;
  const vp = t.vendorPortal;

  const [showQrModal, setShowQrModal] = useState(false);
  const [showPassbookModal, setShowPassbookModal] = useState(false);

  const artisanFullName = artisanData?.full_name || 'रमेश पाटील (Ramesh Patil)';
  const artisanCraft = artisanData?.craft_category || 'हथकरघा व पैठणी बुनाई';
  const artisanCode = artisanData?.artisan_code || 'ART-MH-2026-0891';
  const artisanState = artisanData?.state || 'Maharashtra';
  const artisanDistrict = artisanData?.district || 'Chhatrapati Sambhajinagar (Paithan)';
  const artisanPhone = artisanData?.phone || '9823012345';
  const isVisvasEligible = artisanData?.visvas_eligible !== false;

  return (
    <div className="vendor-home-scroll">
      {/* 1. ARTISAN PROFILE IDENTITY & VISVAS SCHEME BANNER (Desktop: Side-by-side / Mobile: Stacked) */}
      <div className="artisan-profile-identity-grid">
        {/* Digital Artisan Identity Card */}
        <div className="artisan-id-card">
          <div className="id-card-top-row">
            <div className="emblem-group">
              <span style={{ fontSize: '20px' }}>🇮🇳</span>
              <div>
                <div className="card-authority">Government of India • MoSJE</div>
                <div style={{ fontSize: '11px', color: 'var(--marigold)', fontWeight: 700 }}>
                  HandsOf Certified Artisan Profile • See the Hands Behind the Craft
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="verified-stamp">
                <CheckCircle size={12} />
                <span className="devanagari">{t.verifiedBadge || 'सत्यापित'}</span>
              </div>
              {onEditProfile && (
                <button 
                  className="edit-price-btn devanagari" 
                  onClick={onEditProfile}
                  title="Edit Artisan Details"
                >
                  <Edit3 size={12} />
                  <span>संपादित करें</span>
                </button>
              )}
            </div>
          </div>

          <div className="id-card-body">
            <div className="artisan-avatar-box">
              🧵
            </div>
            <div className="artisan-meta-group">
              <div className="artisan-name-display devanagari">
                {artisanFullName}
              </div>
              <div className="artisan-craft-display devanagari">
                {artisanCraft}
              </div>
              <div className="artisan-location-display">
                📍 {artisanDistrict}, {artisanState}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--silk-subtle)', marginTop: '2px' }}>
                📞 +91 {artisanPhone}
              </div>
            </div>
          </div>

          <div className="id-card-footer">
            <div>
              <div className="artisan-code-label devanagari">कारीगर आईडी (Artisan ID)</div>
              <div className="artisan-code-value">{artisanCode}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="artisan-code-label">Social Category</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#4ADE80' }}>
                {artisanData?.social_category || 'OBC'}
              </div>
            </div>
          </div>
        </div>

        {/* MoSJE VISVAS Scheme Card */}
        <div className="visvas-scheme-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(74, 222, 128, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={26} color="#4ADE80" />
            </div>
            <div>
              <div className="visvas-title devanagari">
                {t.visvasEligibleTitle || 'MoSJE विश्वास योजना (VISVAS)'}
              </div>
              <div className="visvas-desc devanagari">
                {isVisvasEligible 
                  ? 'आप 10 लाख रुपये तक के ऋण पर 5% वार्षिक ब्याज छूट के पात्र हैं!' 
                  : 'सामान्य श्रेणी। अन्य वित्तीय प्रोत्साहन व बाजार सहायता उपलब्ध हैं।'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
            <span style={{ fontSize: '11px', color: '#A7F3D0' }}>ब्याज सवलत: 5% Subvention</span>
            <button 
              className="alert-refill-btn devanagari" 
              style={{ background: '#10B981', color: 'white', borderColor: '#10B981', padding: '4px 10px', fontSize: '11px' }}
              onClick={() => setShowPassbookModal(true)}
            >
              पासबुक देखें
            </button>
          </div>
        </div>
      </div>

      {/* 2. AUDIO SUMMARY BAR */}
      <div 
        className="audio-summary-bar"
        onClick={onPlayTodaySummary}
        title="Tap to listen to today's summary in your native language"
      >
        <div className="audio-summary-left">
          <div className={`audio-pill-icon ${isPlayingSummary ? 'pulsing' : ''}`}>
            {isPlayingSummary ? <Volume2 size={18} /> : <Play size={18} fill="white" />}
          </div>
          <div>
            <div className="audio-summary-title devanagari">
              {isPlayingSummary ? vp.playingSummary : vp.listenSummary}
            </div>
            <div className="audio-summary-sub devanagari">
              {vp.listenSummarySub}
            </div>
          </div>
        </div>

        <button className="audio-play-pill-btn devanagari">
          <Play size={12} fill="currentColor" />
          <span>{isPlayingSummary ? 'चल रहा है' : 'Play'}</span>
        </button>
      </div>

      {/* 3. MULTI-COLUMN DESKTOP GRID: Daily Overview Left + Urgent Action Right */}
      <div className="dashboard-main-columns">
        {/* Left Column: Daily Overview */}
        <div className="daily-overview-section">
          <div className="section-title-row">
            <h2 className="section-title-text devanagari">
              {vp.dailyOverviewTitle}
            </h2>
            <span className="updated-time-tag devanagari">
              {vp.updatedJustNow}
            </span>
          </div>

          {/* Today's Earnings Card */}
          <div className="today-earnings-card">
            <div className="earnings-top">
              <div>
                <div className="earnings-label devanagari">
                  {vp.todayEarnings}
                </div>
                <div className="earnings-value-big">
                  {vp.todayEarningsVal}
                </div>
              </div>
              <div className="trend-growth-box">
                <TrendingUp size={24} color="#10B981" />
              </div>
            </div>

            <div className="bank-payout-pill devanagari">
              <CheckCircle2 size={13} color="#10B981" />
              <span>{vp.bankPayoutBadge}</span>
            </div>
          </div>

          {/* Orders & In-Transit 2-col */}
          <div className="overview-two-col">
            <div className="metric-box-card orders-card">
              <div className="metric-card-header">
                <Package size={18} color="#D97706" />
                <span className="metric-card-title devanagari">{vp.newOrders}</span>
              </div>
              <div className="metric-big-number">
                {vp.newOrdersVal}
              </div>
              <button 
                className="metric-action-btn orders-btn devanagari"
                onClick={() => alert(lang === 'mr' ? '📦 ४ नवीन ऑर्डर्स पॅक करण्यासाठी तयार आहेत!' : '📦 4 नए ऑर्डर्स पैक करने के लिए तैयार हैं!')}
              >
                <span>{vp.packNowBtn}</span>
              </button>
            </div>

            <div className="metric-box-card transit-card">
              <div className="metric-card-header">
                <Truck size={18} color="#3B82F6" />
                <span className="metric-card-title devanagari">{vp.inTransit}</span>
              </div>
              <div className="metric-big-number">
                {vp.inTransitVal}
              </div>
              <button 
                className="metric-action-btn transit-btn devanagari"
                onClick={() => alert(lang === 'mr' ? '🚚 १२ पार्सल ONDC लॉजिस्टिक्स मार्गावर आहेत!' : '🚚 12 पार्सल ONDC लॉजिस्टिक्स द्वारा रास्ते में हैं!')}
              >
                <span>{vp.trackBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Urgent Action & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Urgent Action Card */}
          <div className="urgent-action-card">
            <div className="urgent-badge-row">
              <div className="urgent-truck-icon">
                <Truck size={18} />
              </div>
              <div className="urgent-tag-label devanagari">
                {vp.urgentActionTag}
              </div>
            </div>

            <h3 className="urgent-card-title devanagari">
              {vp.urgentActionTitle}
            </h3>
            <p className="urgent-card-desc devanagari">
              {vp.urgentActionSub}
            </p>

            <div className="urgent-actions-row">
              <button 
                className="show-qr-btn devanagari"
                onClick={() => setShowQrModal(true)}
              >
                <QrCode size={16} />
                <span>{vp.showQrBtn}</span>
              </button>

              <button 
                className="print-slip-btn"
                onClick={() => alert(lang === 'mr' ? '🖨️ पॅकिंग स्लिप डाऊनलोड होत आहे...' : '🖨️ पैकिंग पर्ची डाउनलोड हो रही है...')}
                title="Print packing slip"
              >
                <Printer size={16} />
              </button>
            </div>
          </div>

          {/* Quick Voice Bar */}
          <div 
            className="voice-prompt-bar"
            onClick={onOpenVoiceQuery}
          >
            <div className="voice-prompt-left">
              <div className="voice-mic-circle">
                <Sparkles size={16} />
              </div>
              <div className="voice-prompt-text devanagari">
                {vp.askVoicePill}
              </div>
            </div>
            <ArrowRight size={16} color="var(--marigold)" />
          </div>

          {/* Quick AI Product Studio Button */}
          <div 
            className="quick-action-card"
            style={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(30, 41, 59, 0.85) 100%)', 
              border: '1.5px solid var(--marigold)',
              cursor: 'pointer'
            }}
            onClick={onOpenStudio}
          >
            <div className="action-icon-box" style={{ background: 'var(--marigold)' }}>
              <Sparkles size={20} color="#1E293B" />
            </div>
            <div className="action-text-box">
              <div className="action-title devanagari" style={{ color: 'var(--marigold)', fontWeight: 800 }}>
                ✨ {lang === 'mr' ? 'AI प्रॉडक्ट स्टुडिओ' : 'AI प्रोडक्ट स्टूडियो (कैमरा / गैलरी)'}
              </div>
              <div className="action-sub devanagari">
                {lang === 'mr' ? 'कॅमेऱ्याने फोटो काढा किंवा गॅलरीतून निवडा (ऑटो स्टुडिओ)' : 'कैमरे से फोटो लें या गैलरी से चुनें (ऑटो बैकग्राउंड रिमूवल)'}
              </div>
            </div>
            <div className="action-arrow-circle" style={{ background: 'var(--marigold)', color: '#1E293B' }}>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Quick Add Product Button */}
          <div 
            className="quick-action-card action-camera"
            onClick={() => onNavigateTab('add_product')}
          >
            <div className="action-icon-box bg-terracotta">
              <Camera size={20} color="white" />
            </div>
            <div className="action-text-box">
              <div className="action-title devanagari">{vp.addNewProduct}</div>
              <div className="action-sub devanagari">{vp.addNewProductSub}</div>
            </div>
            <div className="action-arrow-circle">
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. MY SHOP PRODUCTS LIST WITH INSTANT TOGGLE */}
      <div className="my-shop-products-section">
        <div className="section-title-row" style={{ marginBottom: '14px' }}>
          <div>
            <h2 className="section-title-text devanagari">{vp.myShopProducts}</h2>
            <div className="section-sub-text devanagari">{vp.myShopSubtitle}</div>
          </div>
          <button 
            className="view-all-stock-btn devanagari"
            onClick={() => onNavigateTab('stock')}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', borderRadius: '20px', padding: '6px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <span>{vp.viewAll} ({products.length})</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="shop-product-cards-list">
          {products.slice(0, 4).map((prod) => {
            const title = lang === 'mr' ? prod.title_mr || prod.title : lang === 'en' ? prod.title_en || prod.title : prod.title;

            return (
              <div key={prod.id} className="shop-item-card">
                <div className="stock-card-top-row">
                  <div className="shop-item-img-wrap">
                    <img src={prod.image} alt={title} className="shop-item-photo" />
                    <span className={`product-status-tag ${prod.is_selling ? 'tag-live' : 'tag-out'}`}>
                      {prod.is_selling ? vp.liveTag : vp.outOfStockTag}
                    </span>
                  </div>

                  <div className="shop-item-info">
                    <div className="shop-item-name devanagari">
                      {title}
                    </div>
                    <div className="shop-item-price-row">
                      <span className="shop-item-price">₹{prod.price}</span>
                      <span className="shop-item-zerofee devanagari">
                        {vp.zeroFeeTag} ₹{prod.price}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <div className="stock-velocity-chip devanagari">
                        {prod.velocity_text || vp.fastSellingBadge}
                      </div>
                      {prod.is_supabase && (
                        <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', borderRadius: '10px', padding: '2px 7px', fontWeight: 600 }}>
                          ⚡ Supabase DB
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selling Toggle */}
                  <label className="switch-toggle" title="Toggle Live/Off">
                    <input 
                      type="checkbox" 
                      checked={prod.is_selling} 
                      onChange={() => onToggleProductStatus(prod.id, !prod.is_selling)}
                    />
                    <span className="slider-round" />
                  </label>
                </div>

                <div className="selling-toggle-row" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                  <span className={`toggle-status-label devanagari ${prod.is_selling ? 'text-green' : 'text-grey'}`}>
                    {prod.is_selling ? vp.sellingStatusOn : vp.sellingStatusOff} • {prod.stock} पीस स्टॉक
                  </span>

                  <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 'bold' }}>
                    कमाई: ₹{prod.revenue?.toLocaleString('en-IN') || '0'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SELLER PROTECTION BANNER */}
      <div className="seller-protection-box">
        <div className="protection-shield-icon">
          <ShieldCheck size={26} color="#F59E0B" />
        </div>
        <div>
          <div className="protection-title devanagari">
            HandsOf • 100% Direct-to-Artisan Bank Payout Guarantee
          </div>
          <div className="protection-desc devanagari">
            MoSJE व ONDC द्वारा प्रमाणित। आपका पैसा सीधे बुधवार को आपके बैंक खाते में सुरक्षित जमा होगा।
          </div>
        </div>
      </div>

      {/* QR Code Modal for Pickup */}
      {showQrModal && (
        <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="devanagari" style={{ fontSize: '17px', color: 'var(--marigold)' }}>
                {vp.showQrBtn}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowQrModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div className="qr-box-graphic">
                <QrCode size={180} color="#1E2B4D" />
              </div>
              <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--silk-white)' }}>
                Order ID: ONDC-2026-MH-8910
              </div>
              <p style={{ fontSize: '12px', color: 'var(--silk-muted)', marginTop: '4px' }} className="devanagari">
                डिलीवरी पार्टनर को स्कैन कराएं। 2 पार्सल तैयार रखें।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Passbook & VISVAS Modal */}
      {showPassbookModal && (
        <div className="modal-overlay" onClick={() => setShowPassbookModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="devanagari" style={{ fontSize: '17px', color: '#10B981' }}>
                {vp.bankPassbook}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowPassbookModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10B981', padding: '12px', borderRadius: '12px' }}>
                <div style={{ fontSize: '12px', color: '#10B981', fontWeight: 700 }}>MoSJE VISVAS Scheme Active</div>
                <div style={{ fontSize: '13px', color: 'white', marginTop: '2px' }} className="devanagari">
                  5% वार्षिक ब्याज छूट स्वीकृत • ऋण सीमा ₹10,00,000
                </div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '12px', fontSize: '13px' }}>
                <div style={{ color: 'var(--silk-muted)' }}>खाता धारक (Account Holder):</div>
                <div style={{ fontWeight: 'bold', color: 'white' }}>{artisanFullName}</div>
                <div style={{ color: 'var(--silk-muted)', marginTop: '6px' }}>पंजीकृत फोन: +91 {artisanPhone}</div>
                <div style={{ color: 'var(--marigold)', marginTop: '6px', fontWeight: 'bold' }}>
                  अगला बैंक भुगतान: कल सुबह 8:00 AM (₹3,850.00)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
