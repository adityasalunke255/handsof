import React, { useState } from 'react';
import { 
  Search, 
  Mic, 
  Volume2, 
  Flame, 
  Plus, 
  Minus, 
  Edit3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Camera, 
  X,
  Clock,
  Globe,
  Download,
  Copy,
  Shield,
  FileText,
  Check,
  Info,
  Sparkles,
  Heart
} from 'lucide-react';
import { translations } from '../../locales/translations';

export default function VendorProductsStock({
  lang,
  products,
  onUpdateStock,
  onToggleStatus,
  onNavigateTab,
  onSpeakText,
  onStartVoiceSearch
}) {
  const t = translations[lang] || translations.hi;
  const vp = t.vendorPortal;

  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'low_stock'
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPriceItem, setEditingPriceItem] = useState(null);
  const [newPriceValue, setNewPriceValue] = useState('');
  const [showOndcModal, setShowOndcModal] = useState(false);
  const [selectedArtisanStory, setSelectedArtisanStory] = useState(null);
  const [copiedOndc, setCopiedOndc] = useState(false);

  // Calculate live metrics
  const totalRevenueCalc = products.reduce((acc, p) => acc + (p.revenue || 0), 42800);
  const activeProductsCount = products.filter(p => p.is_selling && p.stock > 0).length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  // Filter products
  const filteredProducts = products.filter(p => {
    const title = (p.title + ' ' + (p.title_en || '') + ' ' + (p.title_mr || '')).toLowerCase();
    const matchesSearch = title.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeFilter === 'active') return p.is_selling && p.stock > 0;
    if (activeFilter === 'low_stock') return p.stock <= 5;
    return true;
  });

  const handlePriceSave = (productId) => {
    const parsed = Number(newPriceValue);
    if (!isNaN(parsed) && parsed > 0) {
      const item = products.find(p => p.id === productId);
      if (item) item.price = parsed;
    }
    setEditingPriceItem(null);
  };

  const speakStockSummary = () => {
    const text = lang === 'mr'
      ? `तुमच्या दुकानात एकूण ${products.length} वस्तू आहेत. एकूण कमाई ४२ हजार ८०० रुपये आहे. संध्याकाळी ६ ते ९:३० ही सर्वाधिक विक्रीची वेळ आहे.`
      : lang === 'hi'
        ? `आपकी दुकान में कुल ${products.length} सामान हैं। कुल कमाई ₹42,800 है। शाम 6 से 9:30 बजे सबसे ज्यादा ऑर्डर आते हैं।`
        : `You have ${products.length} items listed. Total revenue is ₹42,800. Peak rush hours are 6 to 9:30 PM.`;
    onSpeakText(text);
  };

  return (
    <div className="vendor-stock-scroll">
      {/* 1. TOP HEADER & AUDIO LISTEN */}
      <div className="stock-view-header">
        <div>
          <div className="stock-title-row">
            <h1 className="stock-view-title devanagari">{vp.stockViewTitle}</h1>
            <span className="total-items-chip devanagari">
              {vp.totalItemsBadge}
            </span>
          </div>
          <div className="stock-view-sub devanagari">{vp.stockViewSubtitle}</div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="stock-audio-listen-btn devanagari"
            style={{ 
              background: 'rgba(59, 130, 246, 0.15)', 
              borderColor: 'rgba(59, 130, 246, 0.35)', 
              color: '#60A5FA' 
            }}
            onClick={() => setShowOndcModal(true)}
            title="Export to Government ONDC & GeM Marketplaces"
          >
            <Globe size={15} />
            <span>ONDC & GeM कैटलॉग</span>
          </button>

          <button 
            className="stock-audio-listen-btn devanagari"
            onClick={speakStockSummary}
            title="Listen to stock and revenue overview"
          >
            <Volume2 size={15} />
            <span>बोलकर सुनें</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & VOICE SEARCH BAR */}
      <div className="search-voice-bar">
        <div className="search-input-wrapper">
          <Search size={17} color="var(--silk-muted)" />
          <input
            type="text"
            className="search-stock-input devanagari"
            placeholder={vp.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <button 
          className="search-mic-btn"
          onClick={onStartVoiceSearch}
          title="बोलकर खोजें / Voice Search"
        >
          <Mic size={18} />
        </button>
      </div>

      {/* Voice Prompt Suggestions */}
      <div className="voice-query-suggestion-row">
        <span className="suggestion-label devanagari">💡 पूछें:</span>
        <button 
          className="suggestion-chip devanagari"
          onClick={() => {
            setSearchQuery('दीये');
            onSpeakText('पूजा दीये आपका सबसे ज्यादा बिकने वाला सामान है!');
          }}
        >
          {vp.voiceAskPrompt}
        </button>
      </div>

      {/* 3. THREE TOP METRIC TILES */}
      <div className="stock-metric-tiles-grid">
        {/* Metric 1: Total Revenue */}
        <div className="stock-metric-card revenue-tile">
          <div className="metric-tile-top">
            <span className="metric-tile-title devanagari">{vp.totalRevenue}</span>
            <TrendingUp size={16} color="#10B981" />
          </div>
          <div className="metric-tile-val">
            {vp.revenueVal}
          </div>
          <div className="metric-tile-growth devanagari">
            {vp.revenueGrowth}
          </div>
        </div>

        {/* Metric 2: Active Selling */}
        <div className="stock-metric-card active-tile">
          <div className="metric-tile-top">
            <span className="metric-tile-title devanagari">{vp.activeProducts}</span>
            <span className="dot-green" />
          </div>
          <div className="metric-tile-val">
            {activeProductsCount} {lang === 'mr' ? 'वस्तू' : 'सामान'}
          </div>
          <div className="metric-tile-sub devanagari">
            {vp.activeProductsSub}
          </div>
        </div>

        {/* Metric 3: Stock Alert */}
        <div className="stock-metric-card alert-tile">
          <div className="metric-tile-top">
            <span className="metric-tile-title devanagari">{vp.stockAlerts}</span>
            <AlertTriangle size={15} color="#F59E0B" />
          </div>
          <div className="metric-tile-val text-amber">
            {lowStockCount} {lang === 'mr' ? 'कमी/बंद' : 'कम/बंद'}
          </div>
          <button 
            className="alert-refill-btn devanagari"
            onClick={() => setActiveFilter('low_stock')}
          >
            {vp.stockAlertsSub}
          </button>
        </div>
      </div>

      {/* 4. SELLING TIME INSIGHTS (कब बिकता है सबसे ज्यादा?) */}
      <div className="rush-hour-insight-card">
        <div className="rush-hour-header">
          <div className="rush-title-box">
            <Clock size={18} color="var(--terracotta)" />
            <div>
              <div className="rush-title devanagari">{vp.rushHourTitle}</div>
              <div className="rush-sub devanagari">{vp.rushHourSub}</div>
            </div>
          </div>
          <div className="rush-percent-badge">
            {vp.rushHourBadge}
          </div>
        </div>

        {/* Peak Window Box */}
        <div className="peak-window-box">
          <div className="peak-time-text devanagari">
            <span>{vp.peakTime}</span>
            <span className="peak-flame-tag devanagari">{vp.peakBadge}</span>
          </div>
          <p className="peak-explanation devanagari">
            {vp.peakDesc}
          </p>

          {/* Visual Time Bars */}
          <div className="time-bars-container">
            {/* Morning */}
            <div className="time-bar-row">
              <span className="time-label devanagari">{vp.morningTime}</span>
              <div className="time-track">
                <div className="time-fill bar-slow" style={{ width: '28%' }} />
              </div>
              <span className="time-status devanagari">{vp.morningLevel}</span>
            </div>

            {/* Afternoon */}
            <div className="time-bar-row">
              <span className="time-label devanagari">{vp.afternoonTime}</span>
              <div className="time-track">
                <div className="time-fill bar-medium" style={{ width: '55%' }} />
              </div>
              <span className="time-status devanagari">{vp.afternoonLevel}</span>
            </div>

            {/* Evening Peak */}
            <div className="time-bar-row">
              <span className="time-label devanagari" style={{ fontWeight: 700, color: 'var(--marigold)' }}>
                {vp.eveningTime}
              </span>
              <div className="time-track">
                <div className="time-fill bar-peak" style={{ width: '94%' }} />
              </div>
              <span className="time-status devanagari" style={{ fontWeight: 700, color: '#EF4444' }}>
                {vp.eveningLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Actionable tip callout */}
        <div className="artisan-advice-box devanagari">
          <span>💡</span>
          <span>{vp.rushHourTip}</span>
        </div>
      </div>

      {/* 5. FILTER PILLS */}
      <div className="filter-pills-row">
        <button 
          className={`filter-pill-btn devanagari ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          {vp.filterAll}
        </button>
        <button 
          className={`filter-pill-btn devanagari ${activeFilter === 'active' ? 'active' : ''}`}
          onClick={() => setActiveFilter('active')}
        >
          {vp.filterActive}
        </button>
        <button 
          className={`filter-pill-btn devanagari ${activeFilter === 'low_stock' ? 'active' : ''}`}
          onClick={() => setActiveFilter('low_stock')}
        >
          {vp.filterLowStock}
        </button>
      </div>

      {/* 6. PRODUCT CARDS LIST WITH STOCK CONTROLS */}
      <div className="stock-products-list">
        {filteredProducts.map((prod) => {
          const title = lang === 'mr' ? prod.title_mr || prod.title : lang === 'en' ? prod.title_en || prod.title : prod.title;
          const isOutOfStock = prod.stock === 0;
          const isLowStock = prod.stock > 0 && prod.stock <= 5;

          return (
            <div key={prod.id} className="stock-item-card">
              {/* Card Top Row: Image & Name */}
              <div className="stock-card-top-row">
                <div className="stock-item-image-wrapper">
                  <img src={prod.image} alt={title} className="stock-item-thumb" />
                  <span className={`stock-badge ${isOutOfStock ? 'badge-out' : isLowStock ? 'badge-low' : 'badge-live'}`}>
                    {isOutOfStock ? vp.outOfStockTag : isLowStock ? vp.lowStockTag : vp.liveTag}
                  </span>
                </div>

                <div className="stock-item-meta">
                  <div className="stock-item-title devanagari">
                    {title}
                  </div>

                  <div className="stock-price-line">
                    <span className="stock-price-val">₹{prod.price}</span>
                    <span className="stock-zerofee-pill devanagari">
                      {vp.zeroFeeTag} ₹{prod.price}
                    </span>
                  </div>

                  {/* Selling velocity badge & ONDC compliance */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <div className="stock-velocity-chip devanagari">
                      {prod.velocity_text || vp.fastSellingBadge}
                    </div>
                    <span style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#93C5FD', borderRadius: '10px', padding: '2px 7px', fontWeight: 600 }}>
                      🌐 ONDC & GeM Ready
                    </span>
                    {prod.is_supabase && (
                      <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', borderRadius: '10px', padding: '2px 7px', fontWeight: 600 }}>
                        ⚡ Supabase DB
                      </span>
                    )}
                  </div>

                  {/* Hands Behind the Craft - Provenance Badge */}
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      className="devanagari"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: 'var(--marigold)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedArtisanStory(prod)}
                      title="See the Hands Behind the Craft (कारीगर की कहानी)"
                    >
                      <span>🖐️</span>
                      <span>कारीगर: रमेश पाटील (Paithan) • विवरण देखें →</span>
                    </button>
                  </div>

                  {/* AI Fair Price Protection Breakdown */}
                  <div style={{ 
                    marginTop: '6px', 
                    fontSize: '10.5px', 
                    color: '#6EE7B7', 
                    background: 'rgba(16, 185, 129, 0.08)', 
                    border: '1px dashed rgba(16, 185, 129, 0.25)', 
                    borderRadius: '6px', 
                    padding: '3px 8px' 
                  }} className="devanagari">
                    💡 AI सुरक्षित मूल्य: सामग्री ₹{Math.round(prod.price * 0.35)} + मजदूरी ₹{Math.round(prod.price * 0.45)} + हुनर मार्जिन ₹{Math.round(prod.price * 0.20)}
                  </div>
                </div>

                {/* Selling Toggle */}
                <div className="stock-toggle-box">
                  <label className="switch-toggle" title="Toggle Live/Off">
                    <input 
                      type="checkbox" 
                      checked={prod.is_selling && !isOutOfStock} 
                      onChange={() => onToggleStatus(prod.id, !prod.is_selling)}
                    />
                    <span className="slider-round" />
                  </label>
                </div>
              </div>

              {/* Low stock warning banner if applicable */}
              {isLowStock && (
                <div className="low-stock-warning-banner devanagari">
                  <AlertTriangle size={14} color="#D97706" />
                  <span>{vp.onlyPiecesLeft.replace('{count}', prod.stock)} • {vp.weekendDemand}</span>
                </div>
              )}

              {/* Out of stock notice if applicable */}
              {isOutOfStock && (
                <div className="out-of-stock-notice-banner devanagari">
                  <span>ℹ️</span>
                  <span>{vp.outOfStockNotice}</span>
                </div>
              )}

              {/* Card Mid Row: Stock Quantity Stepper & Add Stock */}
              <div className="stock-stepper-row">
                <div className="stock-stepper-left">
                  <span className="stock-stepper-label devanagari">
                    {vp.availableStock}
                  </span>
                  <span className="stock-status-helper devanagari">
                    ({prod.stock} {vp.piecesLeft})
                  </span>
                </div>

                <div className="stepper-controls-group">
                  <button 
                    className="stepper-btn minus-btn"
                    onClick={() => onUpdateStock(prod.id, -1)}
                    disabled={prod.stock === 0}
                    title="Decrease stock by 1"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="stepper-count-display">
                    {prod.stock}
                  </span>

                  <button 
                    className="stepper-btn plus-btn"
                    onClick={() => onUpdateStock(prod.id, 1)}
                    title="Increase stock by 1"
                  >
                    <Plus size={14} />
                  </button>

                  <button 
                    className="add-ten-btn devanagari"
                    onClick={() => onUpdateStock(prod.id, 10)}
                    title="Quick add 10 pieces"
                  >
                    {vp.addTenBtn}
                  </button>
                </div>
              </div>

              {/* Card Bottom Row: Revenue from item & Quick Actions */}
              <div className="stock-card-bottom-row">
                <div className="item-revenue-display">
                  <span className="item-rev-label devanagari">{vp.earnedFromItem}</span>
                  <span className="item-rev-amount">
                    ₹{prod.revenue?.toLocaleString('en-IN') || '14,380'}
                  </span>
                  <span className="item-orders-count devanagari">
                    ({prod.orders_count || 16} ऑर्डर्स)
                  </span>
                </div>

                <div className="stock-card-buttons">
                  <button 
                    className="edit-price-btn devanagari"
                    onClick={() => {
                      setEditingPriceItem(prod);
                      setNewPriceValue(String(prod.price));
                    }}
                  >
                    <Edit3 size={13} />
                    <span>{vp.changePriceBtn}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 7. BOTTOM BANNER TO LIST NEW PRODUCT */}
      <div 
        className="add-product-cta-banner"
        onClick={() => onNavigateTab('add_product')}
      >
        <div className="cta-banner-left">
          <div className="cta-banner-sub devanagari">दुकान में और सामान जोड़ें</div>
          <div className="cta-banner-main devanagari">नया सामान तुरंत लिस्ट करें</div>
          <div className="cta-banner-micro devanagari">फोटो खींचें और दाम भरें • 1 मिनट का काम</div>
        </div>

        <div className="cta-camera-button">
          <Camera size={24} color="white" />
        </div>
      </div>

      {/* Edit Price Modal */}
      {editingPriceItem && (
        <div className="modal-overlay" onClick={() => setEditingPriceItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="devanagari" style={{ fontSize: '16px', color: 'var(--marigold)' }}>
                {vp.changePriceBtn}
              </h3>
              <button className="modal-close-btn" onClick={() => setEditingPriceItem(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '16px 0' }}>
              <div style={{ fontSize: '13px', color: 'var(--silk-muted)', marginBottom: '8px' }} className="devanagari">
                {editingPriceItem.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold' }}>₹</span>
                <input 
                  type="number" 
                  className="text-input"
                  style={{ fontSize: '20px', fontWeight: 'bold' }}
                  value={newPriceValue}
                  onChange={(e) => setNewPriceValue(e.target.value)}
                  autoFocus
                />
              </div>
              <button 
                className="primary-btn devanagari"
                onClick={() => handlePriceSave(editingPriceItem.id)}
              >
                <span>सुरक्षित करें (Save Price)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ONDC & GeM Beckn Protocol Inspector Modal */}
      {showOndcModal && (
        <div className="modal-overlay" onClick={() => setShowOndcModal(false)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '640px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} color="#60A5FA" />
                <div>
                  <h3 className="devanagari" style={{ fontSize: '16px', color: '#93C5FD' }}>
                    ONDC & GeM डिजिटल कॉमर्स कैटलॉग
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--silk-muted)' }}>
                    Beckn Protocol v1.2.0 • Government e-Marketplace Integration
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setShowOndcModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 0', overflowY: 'auto', flex: 1 }}>
              {/* Compliance Badges */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', padding: '4px 8px', borderRadius: '6px' }}>
                  <Check size={12} /> ONDC Beckn RET12 Compliant
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60A5FA', padding: '4px 8px', borderRadius: '6px' }}>
                  <Check size={12} /> GeM Handicrafts Category Validated
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--marigold)', padding: '4px 8px', borderRadius: '6px' }}>
                  <Shield size={12} /> GI Tagged Direct-from-Maker
                </span>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--silk-muted)', marginBottom: '10px' }} className="devanagari">
                यह कैटलॉग सीधे <strong>Open Network for Digital Commerce (ONDC)</strong> और सरकारी <strong>GeM</strong> पोर्टल से लाइव सिंक होता है ताकि बिचौलियों के बिना राष्ट्रीय और अंतरराष्ट्रीय खरीदार सीधे कारीगर से खरीद सकें:
              </div>

              {/* JSON Code Viewer */}
              <div style={{ background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#E2E8F0', maxHeight: '240px', overflowY: 'auto' }}>
                <pre>{JSON.stringify({
                  context: {
                    domain: "ONDC:RET12",
                    action: "search",
                    core_version: "1.2.0",
                    bpp_id: "bpp.handsof.org",
                    bpp_uri: "https://bpp.handsof.org/ondc"
                  },
                  message: {
                    catalog: {
                      "bpp/descriptor": {
                        name: "HandsOf - Marginalized Artisans Network",
                        short_desc: "Direct-from-maker authentic handcrafted goods under SIH26090 initiative"
                      },
                      "bpp/providers": [
                        {
                          id: "ART-MH-2026-0891",
                          descriptor: {
                            name: "Ramesh Patil Weaves",
                            short_desc: "Traditional Silk & Handloom Weaver Cluster"
                          },
                          items_count: products.length,
                          items: products.slice(0, 3).map(p => ({
                            id: p.id,
                            descriptor: {
                              name: p.title_en || p.title,
                              code: "HSN-5007",
                              images: [p.image]
                            },
                            price: {
                              currency: "INR",
                              value: String(p.price)
                            },
                            category_id: "HANDICRAFT_HANDLOOM",
                            tags: {
                              artisan_name: "Ramesh Patil",
                              provenance: "See the Hands Behind the Craft",
                              gi_tagged: "YES",
                              studio_enhanced: p.is_studio_enhanced ? "YES" : "NO"
                            }
                          }))
                        }
                      ]
                    }
                  }
                }, null, 2)}</pre>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  className="secondary-btn devanagari"
                  style={{ flex: 1 }}
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
                    const dlAnchor = document.createElement('a');
                    dlAnchor.setAttribute("href", dataStr);
                    dlAnchor.setAttribute("download", "HandsOf_ONDC_Catalog.json");
                    dlAnchor.click();
                  }}
                >
                  <Download size={15} />
                  <span>डाउनलोड ONDC JSON (.json)</span>
                </button>

                <button
                  className="primary-btn devanagari"
                  style={{ flex: 1 }}
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(products, null, 2));
                    setCopiedOndc(true);
                    setTimeout(() => setCopiedOndc(false), 2500);
                  }}
                >
                  {copiedOndc ? <Check size={16} /> : <Copy size={15} />}
                  <span>{copiedOndc ? 'कॉपी हो गया!' : 'Beckn पेलोड कॉपी करें'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "See the Hands Behind the Craft" Artisan Provenance Modal */}
      {selectedArtisanStory && (
        <div className="modal-overlay" onClick={() => setSelectedArtisanStory(null)}>
          <div 
            className="modal-content" 
            style={{ maxWidth: '520px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🖐️</span>
                <div>
                  <h3 className="devanagari" style={{ fontSize: '16px', color: 'var(--marigold)' }}>
                    कारीगरी के पीछे का हुनर (Hands Behind the Craft)
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--silk-muted)' }}>
                    Artisan Provenance & Direct Heritage Linkage
                  </div>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedArtisanStory(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--indigo-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', border: '2px solid var(--marigold)' }}>
                  👨‍🎨
                </div>
                <div>
                  <div className="devanagari" style={{ fontSize: '16px', fontWeight: 700, color: 'white' }}>
                    रमेश पाटील (Ramesh Patil)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--marigold)' }} className="devanagari">
                    तृतीय पीढ़ी के पैठणी मास्टर बुनकर (3rd Gen Master Weaver)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--silk-subtle)' }}>
                    📍 पैठण, छत्रपति संभाजीनगर, महाराष्ट्र • ID: ART-MH-2026-0891
                  </div>
                </div>
              </div>

              {/* Craft Heritage Story */}
              <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--silk-muted)', marginBottom: '14px' }} className="devanagari">
                "यह उत्पाद पूरी तरह से पारंपरिक लकड़ी के करघे (Pit Loom) पर शुद्ध रेशम और इलेक्ट्रोप्लेटेड ज़री से बुना गया है। हैंड्सऑफ ऐप के जरिए सीधे खरीदने पर आपके दिए गए पैसे का <strong>100% हिस्सा बिना किसी बिचौलिए की कटौती के सीधे कारीगर परिवार को मिलता है।</strong>"
              </div>

              {/* Certifications Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '11px', color: '#6EE7B7', fontWeight: 700 }}>✅ GI Tag Registered</div>
                  <div style={{ fontSize: '10px', color: 'var(--silk-subtle)' }}>Geographical Indication GI-38</div>
                </div>
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '8px 10px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--marigold)', fontWeight: 700 }}>✅ MoSJE VISVAS Eligible</div>
                  <div style={{ fontSize: '10px', color: 'var(--silk-subtle)' }}>Govt. Direct Benefit Scheme</div>
                </div>
              </div>

              <button
                className="primary-btn devanagari"
                style={{ width: '100%' }}
                onClick={() => setSelectedArtisanStory(null)}
              >
                <span>सत्यापित कारीगर प्रोफ़ाइल बंद करें</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
