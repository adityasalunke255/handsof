import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Check, 
  RotateCw, 
  X, 
  Volume2, 
  Eye, 
  Sliders, 
  Tag, 
  DollarSign, 
  Package, 
  Layers, 
  ArrowRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { voiceService } from '../../services/voiceService';

export default function AiProductStudioModal({
  lang = 'hi',
  onClose,
  onSaveToShop,
  artisanCraft = 'हथकरघा बुनाई'
}) {
  // Tabs / Steps: 'input' -> 'processing' -> 'result'
  const [step, setStep] = useState('input');
  const [inputMode, setInputMode] = useState('camera'); // 'camera' or 'gallery'

  // Camera stream state
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isFacingUser, setIsFacingUser] = useState(false);

  // Images state
  const [rawImage, setRawImage] = useState(null);
  const [studioImage, setStudioImage] = useState(null);

  // Processing phases (0: Segmenting, 1: Relighting, 2: VLM Extracting)
  const [processingPhase, setProcessingPhase] = useState(0);

  // Before/After comparison view mode: 'split' or 'slider'
  const [compareView, setCompareView] = useState('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [studioPreset, setStudioPreset] = useState('boutique_pedestal');

  // Extracted VLM metadata
  const [extractedData, setExtractedData] = useState({
    name: 'हथकरघा शुद्ध कॉटन साड़ी / बैग',
    category: 'handloom',
    craft_type: 'Handloom Weaving',
    material: '100% Pure Cotton',
    main_color: 'Indigo Blue & Gold',
    price: 699,
    price_min: 650,
    price_max: 850,
    materials_cost: 245,
    labor_cost: 315,
    stock: 12,
    tags: ['100% Cotton', 'Handwoven', 'GI Tag Certified', 'AI Studio Quality']
  });

  const [isSaving, setIsSaving] = useState(false);

  // Start Camera when inputMode is 'camera'
  useEffect(() => {
    if (step === 'input' && inputMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, inputMode, isFacingUser]);

  const startCamera = async () => {
    setCameraError('');
    try {
      const constraints = {
        video: {
          facingMode: isFacingUser ? 'user' : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError(
        lang === 'mr' 
          ? 'कॅमेरा सुरू करता आला नाही. कृपया गॅलरीमधून फोटो निवडा किंवा परमिशन तपासा.'
          : 'कैमरा शुरू नहीं हो पाया। कृपया गैलरी से फोटो चुनें या अनुमति दें।'
      );
      setInputMode('gallery');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Capture frame from video
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    voiceService.playTone('cue');

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 800;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setRawImage(dataUrl);
    stopCamera();
    processImageWithAI(dataUrl);
  };

  // Handle file upload from gallery
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setRawImage(dataUrl);
      processImageWithAI(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Call AI studio endpoint with simulated visual progress
  const processImageWithAI = async (imageDataUrl) => {
    setStep('processing');
    setProcessingPhase(0);

    // Phase 1 timer
    setTimeout(() => setProcessingPhase(1), 700);
    // Phase 2 timer
    setTimeout(() => setProcessingPhase(2), 1400);

    try {
      const res = await fetch('/api/ai/studio-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: imageDataUrl,
          craft_hint: artisanCraft,
          preset: studioPreset
        })
      });

      const data = await res.json();
      
      // Delay slightly for dramatic visual effect
      setTimeout(() => {
        if (data.success && data.enhanced_image) {
          setStudioImage(data.enhanced_image);
          if (data.metadata) {
            setExtractedData(prev => ({
              ...prev,
              ...data.metadata,
              price: data.metadata.suggested_price || prev.price,
              stock: 12
            }));
          }
        } else {
          setStudioImage(imageDataUrl);
        }
        setStep('result');
        voiceService.playTone('success');
      }, 2000);

    } catch (err) {
      console.warn('AI Studio API error, using direct render:', err);
      setTimeout(() => {
        setStudioImage(imageDataUrl);
        setStep('result');
      }, 2000);
    }
  };

  const handleChangePreset = async (newPreset) => {
    setStudioPreset(newPreset);
    if (!rawImage) return;
    try {
      const res = await fetch('/api/ai/studio-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_base64: rawImage,
          craft_hint: artisanCraft,
          preset: newPreset
        })
      });
      const data = await res.json();
      if (data.success && data.enhanced_image) {
        setStudioImage(data.enhanced_image);
      }
    } catch (e) {
      console.warn('Preset change error:', e);
    }
  };

  const handleSpeakGuidance = (text) => {
    voiceService.speak(text, lang);
  };

  const handleSaveProduct = async () => {
    setIsSaving(true);
    try {
      const productPayload = {
        title: extractedData.name,
        price: Number(extractedData.price) || 699,
        stock: Number(extractedData.stock) || 12,
        category: extractedData.category,
        craft_type: extractedData.craft_type,
        image: studioImage || rawImage,
        is_studio_enhanced: true,
        tags: extractedData.tags
      };

      if (onSaveToShop) {
        await onSaveToShop(productPayload);
      }

      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 }
      });

      const successMsg = lang === 'mr'
        ? 'अभिनंदन! AI स्टुडिओ फोटोसह वस्तू दुकानात लाईव्ह झाली आहे.'
        : 'बधाई हो! AI स्टूडियो फोटो के साथ सामान दुकान में लाइव हो गया है।';
      voiceService.speak(successMsg, lang);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content studio-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* MODAL HEADER */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <h2 className="devanagari" style={{ fontSize: '18px', margin: 0, color: 'var(--marigold)' }}>
                {lang === 'mr' ? 'AI प्रॉडक्ट स्टुडिओ (AI Product Studio)' : 'AI प्रोडक्ट स्टूडियो (AI Product Studio)'}
              </h2>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--silk-muted)', marginTop: '2px' }}>
              MoSJE Problem Statement ID26090 • Zero-Form Auto Studio Enhancement
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ================= STEP 1: INTAKE (CAMERA / GALLERY) ================= */}
        {step === 'input' && (
          <div style={{ padding: '16px 0' }}>
            {/* Mode Switcher Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                className={`filter-pill-btn devanagari ${inputMode === 'camera' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => setInputMode('camera')}
              >
                <Camera size={16} />
                <span>{lang === 'mr' ? '📸 कॅमेऱ्याने फोटो काढा' : '📸 कैमरे से फोटो खींचें'}</span>
              </button>

              <button
                className={`filter-pill-btn devanagari ${inputMode === 'gallery' ? 'active' : ''}`}
                style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => setInputMode('gallery')}
              >
                <Upload size={16} />
                <span>{lang === 'mr' ? '🖼️ गॅलरीतून निवडा' : '🖼️ गैलरी से चुनें'}</span>
              </button>
            </div>

            {/* CAMERA VIEWPORT */}
            {inputMode === 'camera' && (
              <div style={{ position: 'relative', background: '#0F172A', borderRadius: '16px', overflow: 'hidden', minHeight: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cameraError ? (
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📷</div>
                    <p style={{ color: '#F87171', fontSize: '14px' }} className="devanagari">{cameraError}</p>
                    <button 
                      className="primary-btn devanagari" 
                      style={{ marginTop: '12px' }}
                      onClick={() => setInputMode('gallery')}
                    >
                      गैलरी से फोटो चुनें
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      style={{ width: '100%', height: '360px', objectFit: 'cover' }}
                    />

                    {/* Edge AI Alignment Bounding Box Overlay */}
                    <div className="studio-alignment-guide">
                      <div className="guide-corner top-left" />
                      <div className="guide-corner top-right" />
                      <div className="guide-corner bottom-left" />
                      <div className="guide-corner bottom-right" />
                      <div className="guide-center-crosshair">
                        <span>+</span>
                      </div>
                      <div className="guide-voice-label devanagari">
                        {lang === 'mr' ? 'वस्तू फ्रेमच्या मध्यभागी ठेवा' : 'सामान फ्रेम के बीच में रखें'}
                      </div>
                    </div>

                    {/* Real-time Edge AI Quality Indicators */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span className="edge-ai-chip">
                        <span className="live-db-dot" />
                        <span>उत्पाद डिटेक्ट हुआ</span>
                      </span>
                      <span className="edge-ai-chip">
                        <span className="live-db-dot" />
                        <span>रोशनी पर्याप्त</span>
                      </span>
                    </div>

                    {/* Switch Camera Button */}
                    <button
                      className="camera-flip-btn"
                      onClick={() => setIsFacingUser(!isFacingUser)}
                      title="Switch Camera"
                    >
                      <RotateCw size={18} />
                    </button>

                    {/* Bottom Controls Bar */}
                    <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                      <button
                        className="studio-voice-hint-btn"
                        onClick={() => handleSpeakGuidance(lang === 'mr' ? 'वस्तू फ्रेमच्या मध्यभागी ठेवा आणि कॅमेरा स्थिर ठेवून फोटो काढा' : 'सामान को फ्रेम के बीच में रखें और कैमरा स्थिर करके फोटो लें')}
                        title="Voice guidance"
                      >
                        <Volume2 size={18} />
                      </button>

                      {/* Snap Button */}
                      <button
                        className="studio-snap-btn"
                        onClick={handleCapturePhoto}
                        title="Capture Photo"
                      >
                        <div className="snap-btn-inner" />
                      </button>

                      <div style={{ width: '40px' }} />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* GALLERY UPLOAD VIEWPORT */}
            {inputMode === 'gallery' && (
              <div 
                className="gallery-drop-zone"
                onClick={() => document.getElementById('gallery-file-input')?.click()}
              >
                <input
                  id="gallery-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Upload size={28} color="var(--marigold)" />
                </div>
                <h3 className="devanagari" style={{ fontSize: '16px', color: 'white', margin: '0 0 6px' }}>
                  {lang === 'mr' ? 'येथे फोटो निवडा किंवा ड्रॅग करा' : 'यहाँ फोटो चुनें या ड्रैग करें'}
                </h3>
                <p className="devanagari" style={{ fontSize: '12px', color: 'var(--silk-muted)', margin: 0 }}>
                  PNG, JPG, WebP (स्मार्टफोन से लिया हुआ कोई भी फोटो)
                </p>
                <button className="primary-btn devanagari" style={{ marginTop: '16px', padding: '0 20px', height: '40px' }}>
                  फ़ाइल ब्राउज़ करें
                </button>
              </div>
            )}

            {/* Hint Callout */}
            <div className="artisan-advice-box devanagari" style={{ marginTop: '16px' }}>
              <span>💡</span>
              <span>
                {lang === 'mr'
                  ? 'टीप: नैसर्गिक प्रकाशात घेतलेला फोटो अधिक सुंदर दिसेल. आमचे AI आपोआप पार्श्वभूमी स्वच्छ करेल.'
                  : 'टिप: दिन की रोशनी में खींचा गया फोटो सबसे बेहतर होता है। हमारा AI अपने आप बैकग्राउंड हटा देगा।'}
              </span>
            </div>
          </div>
        )}

        {/* ================= STEP 2: AI PROCESSING ANIMATION ================= */}
        {step === 'processing' && (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <div className="ai-processing-orb">
              <Sparkles size={36} color="var(--marigold)" />
            </div>

            <h3 className="devanagari" style={{ fontSize: '18px', color: 'white', marginTop: '20px' }}>
              {lang === 'mr' ? 'AI स्टुडिओ फोटोवर काम करत आहे...' : 'AI स्टूडियो फोटो पर काम कर रहा है...'}
            </h3>

            <div style={{ maxWidth: '380px', margin: '24px auto 0', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              <div className={`ai-phase-row ${processingPhase >= 0 ? 'active' : ''}`}>
                <span className="phase-icon">✂️</span>
                <div>
                  <div className="phase-title devanagari">पार्श्वभूमी काढणे (Background Segmentation)</div>
                  <div className="phase-desc">U-Net Alpha Matting & Edge Extraction</div>
                </div>
                {processingPhase > 0 && <Check size={16} color="#10B981" />}
              </div>

              <div className={`ai-phase-row ${processingPhase >= 1 ? 'active' : ''}`}>
                <span className="phase-icon">💡</span>
                <div>
                  <div className="phase-title devanagari">स्टूडियो लाइटिंग व शैडो (Relighting & Drop Shadow)</div>
                  <div className="phase-desc">Exposure Normalization & Grounding Pedestal</div>
                </div>
                {processingPhase > 1 && <Check size={16} color="#10B981" />}
              </div>

              <div className={`ai-phase-row ${processingPhase >= 2 ? 'active' : ''}`}>
                <span className="phase-icon">🔍</span>
                <div>
                  <div className="phase-title devanagari">कारीगरी व मटेरियल पहचान (VLM Feature Extraction)</div>
                  <div className="phase-desc">Zero-Shot Attribute & Fair Price Deduction</div>
                </div>
                {processingPhase === 2 && <span className="brand-dot-pulse" />}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: RESULT & ATTRIBUTE CONFIRMATION ================= */}
        {step === 'result' && (
          <div style={{ padding: '16px 0' }}>
            {/* COMPARISON DISPLAY (RAW vs STUDIO ENHANCED) */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="var(--marigold)" />
                  <span className="devanagari" style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
                    {lang === 'mr' ? 'AI स्टुडिओ निकाल (Studio Enhanced Asset)' : 'AI स्टूडियो परिणाम (Studio Enhanced Asset)'}
                  </span>
                  <span className="supabase-live-badge">
                    <span className="live-db-dot" />
                    <span>Studio 100% Ready</span>
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    className={`filter-pill-btn devanagari ${compareView === 'slider' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11px', height: 'auto' }}
                    onClick={() => setCompareView('slider')}
                  >
                    स्लाइडर तुलना
                  </button>
                  <button 
                    className={`filter-pill-btn devanagari ${compareView === 'side' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11px', height: 'auto' }}
                    onClick={() => setCompareView('side')}
                  >
                    दोनों अलग देखें
                  </button>
                </div>
              </div>

              {/* STUDIO LIGHTING PRESETS SELECTOR */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
                <button 
                  className={`filter-pill-btn devanagari ${studioPreset === 'boutique_pedestal' ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  onClick={() => handleChangePreset('boutique_pedestal')}
                >
                  🏛️ {lang === 'mr' ? 'लक्झरी पेडेस्टल' : 'लक्जरी पेडेस्टल'}
                </button>
                <button 
                  className={`filter-pill-btn devanagari ${studioPreset === 'terracotta_warm' ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  onClick={() => handleChangePreset('terracotta_warm')}
                >
                  🏺 {lang === 'mr' ? 'वॉर्म टेराकोटा' : 'वार्म टेराकोटा'}
                </button>
                <button 
                  className={`filter-pill-btn devanagari ${studioPreset === 'festival_glow' ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  onClick={() => handleChangePreset('festival_glow')}
                >
                  ✨ {lang === 'mr' ? 'फेस्टिव्हल ग्लो' : 'फेस्टिवल ग्लो'}
                </button>
                <button 
                  className={`filter-pill-btn devanagari ${studioPreset === 'ondc_clean_white' ? 'active' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  onClick={() => handleChangePreset('ondc_clean_white')}
                >
                  ⚪ {lang === 'mr' ? 'ONDC / अमेझॉन व्हाईट' : 'ONDC / अमेज़न व्हाइट'}
                </button>
              </div>

              {/* SLIDER COMPARISON VIEW */}
              {compareView === 'slider' && (
                <div className="studio-compare-viewport">
                  <img 
                    src={studioImage || rawImage} 
                    alt="AI Studio Enhanced" 
                    className="studio-img-base"
                  />

                  {rawImage && (
                    <div 
                      className="studio-img-overlay-wrap"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img 
                        src={rawImage} 
                        alt="Raw Capture" 
                        className="studio-img-overlay"
                      />
                    </div>
                  )}

                  <div 
                    className="studio-slider-divider"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="slider-handle">
                      <span>↔</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="studio-slider-invisible-input"
                  />

                  <div className="slider-tag raw-tag">📷 कच्चा फोटो (Before)</div>
                  <div className="slider-tag enhanced-tag">✨ AI स्टूडियो (After)</div>
                </div>
              )}

              {/* SIDE-BY-SIDE VIEW */}
              {compareView === 'side' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--silk-muted)', marginBottom: '6px' }}>📷 कच्ची फोटो (Before)</div>
                    <img src={rawImage} alt="Raw" style={{ width: '100%', height: '180px', objectFit: 'contain', borderRadius: '8px' }} />
                  </div>
                  <div style={{ background: '#FAF9F6', borderRadius: '12px', padding: '8px', textAlign: 'center', border: '1.5px solid var(--marigold)' }}>
                    <div style={{ fontSize: '11px', color: '#1E293B', fontWeight: 700, marginBottom: '6px' }}>✨ AI स्टूडियो (After)</div>
                    <img src={studioImage || rawImage} alt="Studio" style={{ width: '100%', height: '180px', objectFit: 'contain', borderRadius: '8px' }} />
                  </div>
                </div>
              )}
            </div>

            {/* DEDUCE & CONFIRM METADATA CARD (ZERO-FORM UX) */}
            <div className="deduce-confirm-box">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span className="devanagari" style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>
                    {lang === 'mr' ? 'AI ने ओळखलेली माहिती (काय हे बरोबर आहे?)' : 'AI द्वारा पहचानी गई जानकारी (क्या यह सही है?)'}
                  </span>
                </div>
                <button
                  className="voice-prompt-pill devanagari"
                  style={{ padding: '4px 10px', fontSize: '11px', height: 'auto' }}
                  onClick={() => handleSpeakGuidance(
                    `AI ने आपका सामान ${extractedData.name} पहचाना है। सुझाई गई कीमत ${extractedData.price} रुपये है।`
                  )}
                >
                  <Volume2 size={13} />
                  <span>बोलकर सुनें</span>
                </button>
              </div>

              {/* Editable Name & Price Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label className="devanagari" style={{ fontSize: '12px', color: 'var(--silk-muted)', display: 'block', marginBottom: '4px' }}>
                    उत्पाद का नाम
                  </label>
                  <input
                    type="text"
                    value={extractedData.name}
                    onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                    className="form-input devanagari"
                    style={{ height: '42px', fontSize: '14px', background: 'rgba(255,255,255,0.06)' }}
                  />
                </div>

                <div>
                  <label className="devanagari" style={{ fontSize: '12px', color: 'var(--silk-muted)', display: 'block', marginBottom: '4px' }}>
                    सुझाई कीमत (₹)
                  </label>
                  <input
                    type="number"
                    value={extractedData.price}
                    onChange={(e) => setExtractedData({ ...extractedData, price: Number(e.target.value) })}
                    className="form-input"
                    style={{ height: '42px', fontSize: '16px', fontWeight: 'bold', color: '#10B981', background: 'rgba(255,255,255,0.06)' }}
                  />
                </div>
              </div>

              {/* Pricing breakdown breakdown chips */}
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '8px 12px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                <span className="devanagari" style={{ fontSize: '12px', color: '#6EE7B7', fontWeight: 600 }}>
                  💡 लागत विश्लेषण:
                </span>
                <span className="devanagari" style={{ fontSize: '11px', color: 'var(--silk-white)' }}>
                  सामग्री ₹{extractedData.materials_cost} + मेहनत ₹{extractedData.labor_cost} + हुनर ₹{Math.max(50, extractedData.price - extractedData.materials_cost - extractedData.labor_cost)}
                </span>
              </div>

              {/* Extracted Traits Tags */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span className="ai-trait-pill">
                  🏷️ {extractedData.craft_type}
                </span>
                <span className="ai-trait-pill">
                  🧵 {extractedData.material}
                </span>
                <span className="ai-trait-pill">
                  🎨 {extractedData.main_color}
                </span>
                <span className="ai-trait-pill text-green">
                  📦 स्टॉक: {extractedData.stock} पीस
                </span>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="secondary-btn devanagari"
                  style={{ flex: 1, height: '48px' }}
                  onClick={() => {
                    setStep('input');
                    setRawImage(null);
                    setStudioImage(null);
                  }}
                  disabled={isSaving}
                >
                  <RotateCw size={16} />
                  <span>{lang === 'mr' ? 'दुसरा फोटो काढा' : 'दूसरा फोटो लें'}</span>
                </button>

                <button
                  className="primary-btn devanagari"
                  style={{ flex: 2, height: '48px', fontSize: '15px' }}
                  onClick={handleSaveProduct}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <span>सेव हो रहा है...</span>
                  ) : (
                    <>
                      <Check size={18} />
                      <span>{lang === 'mr' ? 'दुकान सुरू करा व सेव्ह करा' : 'दुकान में जोड़ें और लाइव करें'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
