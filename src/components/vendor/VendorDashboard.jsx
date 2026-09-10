import React, { useState, useEffect } from 'react';
import VendorHeader from './VendorHeader';
import VendorHome from './VendorHome';
import VendorProductsStock from './VendorProductsStock';
import AddProductModal from './AddProductModal';
import AiProductStudioModal from '../studio/AiProductStudioModal';
import VendorBottomNav from './VendorBottomNav';
import { translations } from '../../locales/translations';
import { artisanDbService } from '../../services/supabaseClient';
import { voiceService } from '../../services/voiceService';
import { X, PhoneCall, MessageCircle, Home, Package, Plus, Sparkles } from 'lucide-react';

export default function VendorDashboard({
  lang,
  onSelectLang,
  artisanData,
  onOpenOnboarding
}) {
  const t = translations[lang] || translations.hi;
  const vp = t.vendorPortal;

  const [activeTab, setActiveTab] = useState('home'); // 'home', 'stock'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [isPlayingSummary, setIsPlayingSummary] = useState(false);
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceQueryResult, setVoiceQueryResult] = useState('');
  const [showVoiceQueryModal, setShowVoiceQueryModal] = useState(false);
  const [showHelplineModal, setShowHelplineModal] = useState(false);

  // Load products from service
  useEffect(() => {
    async function loadData() {
      const prods = await artisanDbService.getProducts();
      setProducts(prods);
    }
    loadData();
  }, []);

  const handleSpeakText = (text) => {
    voiceService.speak(text, lang, {
      onStart: () => setIsPlayingSummary(true),
      onEnd: () => setIsPlayingSummary(false),
      onError: () => setIsPlayingSummary(false)
    });
  };

  const handlePlayTodaySummary = () => {
    if (isPlayingSummary) {
      voiceService.stopSpeaking();
      setIsPlayingSummary(false);
      return;
    }

    const summaryText = lang === 'mr'
      ? `नमस्कार! आजची तुमची एकूण कमाई ₹३,८५० आहे. उद्या सकाळी ८ वाजता हे पैसे थेट तुमच्या बँक खात्यात जमा होतील. आज २ ऑर्डर्सचे पिकअप ४ वाजेपर्यंत होणार आहे. संध्याकाळी ६ ते ९:३० ही सर्वाधिक विक्रीची वेळ आहे, दुकानात साठा तयार ठेवा!`
      : lang === 'hi'
        ? `नमस्ते! आज की आपकी कुल कमाई ₹3,850 है। कल सुबह 8 बजे यह सीधे आपके बैंक खाते में जमा हो जाएगी। आज 2 ऑर्डर्स का पिकअप शाम 4 बजे तक है। शाम 6 से 9:30 बजे सबसे ज्यादा बिक्री होती है, कृपया स्टॉक तैयार रखें!`
        : `Welcome! Today's earnings are ₹3,850. Direct bank transfer scheduled for tomorrow 8:00 AM. 2 orders pickup scheduled by 4:00 PM today. Peak buying rush hours are 6:00 to 9:30 PM!`;

    handleSpeakText(summaryText);
  };

  const handleToggleProductStatus = async (productId, newStatus) => {
    const updated = await artisanDbService.toggleProductStatus(productId, newStatus);
    if (updated) {
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      const msg = newStatus 
        ? (lang === 'mr' ? 'वस्तूची विक्री सुरू केली' : 'सामान की बिक्री चालू की')
        : (lang === 'mr' ? 'वस्तू बंद केली' : 'सामान की बिक्री बंद की');
      handleSpeakText(msg);
    }
  };

  const handleUpdateStock = async (productId, delta) => {
    const updated = await artisanDbService.updateStock(productId, delta);
    if (updated) {
      setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      voiceService.playTone('cue');
    }
  };

  const handlePublishNewProduct = async (productData) => {
    const created = await artisanDbService.addProduct(productData);
    if (created) {
      setProducts(prev => [created, ...prev]);
      setIsAddModalOpen(false);
      setActiveTab('stock');
      const msg = lang === 'mr'
        ? 'नवीन वस्तू यशस्वीरीत्या लाईव्ह झाली!'
        : 'नया सामान सफलतापूर्वक ऑनलाइन लाइव हो गया!';
      handleSpeakText(msg);
    }
  };

  const handlePublishStudioProduct = async (productData) => {
    const created = await artisanDbService.addProduct(productData);
    if (created) {
      setProducts(prev => [created, ...prev]);
      setIsStudioModalOpen(false);
      setActiveTab('stock');
      voiceService.playTone('success');
      const msg = lang === 'mr'
        ? 'AI स्टुडिओ फोटोसह नवीन वस्तू लाईव्ह झाली!'
        : 'AI स्टूडियो फोटो के साथ नया सामान ऑनलाइन लाइव हो गया!';
      handleSpeakText(msg);
    }
  };

  const handleStartVoiceQuery = () => {
    setShowVoiceQueryModal(true);
    setIsListeningVoice(true);
    setVoiceQueryResult('');

    voiceService.startListening(lang, {
      onStart: () => setIsListeningVoice(true),
      onResult: ({ final, interim }) => {
        const spoken = final || interim;
        if (spoken) {
          setVoiceQueryResult(spoken);
          if (spoken.includes('कमाई') || spoken.includes('kamai') || spoken.includes('earn')) {
            setTimeout(() => {
              handleSpeakText('आज आपकी कुल कमाई 3850 रुपये है!');
            }, 800);
          } else if (spoken.includes('स्टॉक') || spoken.includes('stock')) {
            setActiveTab('stock');
            setTimeout(() => {
              handleSpeakText('आपके पास 6 सामानों में स्टॉक कम है।');
            }, 800);
          }
        }
      },
      onEnd: () => setIsListeningVoice(false),
      onError: () => setIsListeningVoice(false)
    });
  };

  return (
    <div className="vendor-portal-container">
      {/* 1. TOP HEADER WITH DESKTOP RESPONSIVE CONTROLS */}
      <VendorHeader
        lang={lang}
        onSelectLang={onSelectLang}
        artisanData={artisanData}
        onOpenVoiceQuery={handleStartVoiceQuery}
        onOpenOnboarding={onOpenOnboarding}
        onOpenHelpline={() => setShowHelplineModal(true)}
      />

      {/* 2. DESKTOP & MOBILE NAVIGATION TABS BAR */}
      <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className={`filter-pill-btn devanagari ${activeTab === 'home' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('home')}
          >
            <Home size={15} />
            <span>🏪 {lang === 'mr' ? 'दुकान व प्रोफाइल' : 'दुकान व प्रोफाइल'}</span>
          </button>

          <button
            className={`filter-pill-btn devanagari ${activeTab === 'stock' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => setActiveTab('stock')}
          >
            <Package size={15} />
            <span>📦 {lang === 'mr' ? 'साठा आणि विक्री वेळ' : 'स्टॉक व बिक्री समय'} ({products.length})</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="primary-btn devanagari"
            style={{ height: '38px', padding: '0 16px', fontSize: '13px', borderRadius: '20px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1E293B', fontWeight: 800, border: 'none' }}
            onClick={() => setIsStudioModalOpen(true)}
            title="AI Product Studio"
          >
            <Sparkles size={15} />
            <span>✨ {lang === 'mr' ? 'AI स्टुडिओ' : 'AI स्टूडियो'}</span>
          </button>

          <button
            className="secondary-btn devanagari"
            style={{ height: '38px', padding: '0 14px', fontSize: '13px', borderRadius: '20px' }}
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={15} />
            <span>+ नया सामान</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT VIEWPORT */}
      <div className="vendor-tab-viewport">
        {activeTab === 'home' && (
          <VendorHome
            lang={lang}
            artisanData={artisanData}
            products={products}
            onToggleProductStatus={handleToggleProductStatus}
            onNavigateTab={(tab) => {
              if (tab === 'add_product') setIsAddModalOpen(true);
              else setActiveTab(tab);
            }}
            onPlayTodaySummary={handlePlayTodaySummary}
            isPlayingSummary={isPlayingSummary}
            onOpenVoiceQuery={handleStartVoiceQuery}
            onEditProfile={onOpenOnboarding}
            onOpenStudio={() => setIsStudioModalOpen(true)}
          />
        )}

        {activeTab === 'stock' && (
          <VendorProductsStock
            lang={lang}
            products={products}
            onUpdateStock={handleUpdateStock}
            onToggleStatus={handleToggleProductStatus}
            onNavigateTab={(tab) => {
              if (tab === 'add_product') setIsAddModalOpen(true);
              else setActiveTab(tab);
            }}
            onSpeakText={handleSpeakText}
            onStartVoiceSearch={handleStartVoiceQuery}
          />
        )}
      </div>

      {/* 4. ADD PRODUCT MODAL / DIALOG */}
      {isAddModalOpen && (
        <div className="add-product-screen" onClick={() => setIsAddModalOpen(false)}>
          <div className="add-product-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <AddProductModal
              lang={lang}
              onClose={() => setIsAddModalOpen(false)}
              onPublish={handlePublishNewProduct}
              onSpeakText={handleSpeakText}
              onOpenStudio={() => {
                setIsAddModalOpen(false);
                setIsStudioModalOpen(true);
              }}
              isListening={isListeningVoice}
              onStartVoiceFill={() => {
                setIsListeningVoice(true);
                voiceService.startListening(lang, {
                  onStart: () => setIsListeningVoice(true),
                  onResult: ({ final }) => {
                    if (final) voiceService.playTone('success');
                  },
                  onEnd: () => setIsListeningVoice(false),
                  onError: () => setIsListeningVoice(false)
                });
              }}
              onStopVoiceFill={() => {
                voiceService.stopListening();
                setIsListeningVoice(false);
              }}
            />
          </div>
        </div>
      )}

      {/* 4.2 AI PRODUCT STUDIO MODAL */}
      {isStudioModalOpen && (
        <AiProductStudioModal
          lang={lang}
          onClose={() => setIsStudioModalOpen(false)}
          onSaveToShop={handlePublishStudioProduct}
          artisanCraft={artisanData?.craft_category || 'हथकरघा बुनाई'}
        />
      )}

      {/* 5. MOBILE BOTTOM NAVIGATION (Hidden on Desktop) */}
      <VendorBottomNav
        lang={lang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenHelpline={() => setShowHelplineModal(true)}
      />

      {/* Voice Assistant Modal */}
      {showVoiceQueryModal && (
        <div className="modal-overlay" onClick={() => setShowVoiceQueryModal(false)}>
          <div className="modal-content voice-query-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="devanagari" style={{ fontSize: '16px', color: 'var(--marigold)' }}>
                🎙️ बोलकर पूछें (Voice Saathi)
              </h3>
              <button className="modal-close-btn" onClick={() => setShowVoiceQueryModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', padding: '24px 0 16px' }}>
              <button 
                className={`voice-modal-mic-pulse ${isListeningVoice ? 'active' : ''}`}
                onClick={handleStartVoiceQuery}
              >
                🎙️
              </button>

              <div style={{ marginTop: '16px', fontSize: '16px', fontWeight: 'bold' }} className="devanagari">
                {isListeningVoice ? '🔴 सुन रहे हैं... बोलिए' : 'बोलने के लिए माइक दबाएं'}
              </div>

              {voiceQueryResult ? (
                <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px' }} className="devanagari">
                  "{voiceQueryResult}"
                </div>
              ) : (
                <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--silk-muted)' }} className="devanagari">
                  उदा: 'आज कितनी कमाई हुई?', 'कम स्टॉक दिखाओ'
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Helpline Modal */}
      {showHelplineModal && (
        <div className="modal-overlay" onClick={() => setShowHelplineModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="devanagari" style={{ fontSize: '16px', color: '#60A5FA' }}>
                📞 {vp.sellerHelpline}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowHelplineModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid #3B82F6', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#93C5FD', fontWeight: 600 }}>Toll-Free Government Helpline</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginTop: '4px' }}>
                  1800-419-HELP
                </div>
                <p style={{ fontSize: '12px', color: 'var(--silk-muted)', marginTop: '4px' }} className="devanagari">
                  MoSJE कारीगर सहायता केंद्र (सुबह 9 से शाम 7 बजे तक)
                </p>
                <button 
                  className="primary-btn devanagari"
                  style={{ marginTop: '12px', height: '44px' }}
                  onClick={() => alert('Dialing 1800-419-HELP...')}
                >
                  <PhoneCall size={16} />
                  <span>तुरंत मुफ्त कॉल करें</span>
                </button>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10B981', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#6EE7B7', fontWeight: 600 }}>WhatsApp Coordinator</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginTop: '4px' }} className="devanagari">
                  स्थानीय क्लस्टर मित्र (District Paithan/Wardha)
                </div>
                <button 
                  className="secondary-btn devanagari"
                  style={{ marginTop: '12px', height: '44px', width: '100%', borderColor: '#10B981', color: '#34D399' }}
                  onClick={() => alert('Opening WhatsApp Coordinator Chat...')}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp पर चैट करें</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
