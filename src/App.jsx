import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VoiceNodeVisualizer from './components/VoiceNodeVisualizer';
import LanguageSelectionSlide from './components/LanguageSelectionSlide';
import ArtisanDetailsSlide from './components/ArtisanDetailsSlide';
import VendorDashboard from './components/vendor/VendorDashboard';
import { translations } from './locales/translations';
import { voiceService } from './services/voiceService';
import { artisanDbService } from './services/supabaseClient';

export default function App() {
  // Unified 3-Step Flow:
  // Step 1: Language Selection
  // Step 2: Basic Info (Name, Phone, DOB, Craft, Location, Category)
  // Step 3: Vendor Profile & Product Storefront Hub
  const [currentStep, setCurrentStep] = useState(1);
  const [lang, setLang] = useState('hi');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [dictatingField, setDictatingField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Artisan profile data
  const [artisanData, setArtisanData] = useState({
    id: 'e102cb42-a630-4e3e-a131-01b802611a21',
    artisan_code: 'ART-MH-2026-0891',
    full_name: 'रमेश पाटील (Ramesh Patil)',
    phone: '9823012345',
    craft_category: 'हथकरघा व पैठणी बुनाई',
    state: 'Maharashtra',
    district: 'Chhatrapati Sambhajinagar (Paithan)',
    social_category: 'OBC',
    visvas_eligible: true
  });

  // Form input state
  const [formData, setFormData] = useState({
    full_name: 'रमेश पाटील',
    phone: '9823012345',
    email: 'ramesh.weaves@gmail.com',
    date_of_birth: '1988-05-14',
    age: 38,
    craft_category: 'हथकरघा बुनाई',
    craft_specialty: 'Pure Silk Paithani Sarees & Traditional Handloom',
    state: 'Maharashtra',
    district: 'Chhatrapati Sambhajinagar (Paithan)',
    social_category: 'OBC',
    language_preference: 'hi'
  });

  const t = translations[lang] || translations.hi;

  const speakText = (text, targetLang = lang) => {
    if (!voiceEnabled) return;
    setIsSpeaking(true);
    voiceService.speak(text, targetLang, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  useEffect(() => {
    if (!voiceEnabled) return;

    if (currentStep === 1) {
      speakText(t.slide1Spoken, lang);
    } else if (currentStep === 2) {
      speakText(t.detailsSpoken, lang);
    }

    return () => {
      voiceService.stopSpeaking();
      setIsSpeaking(false);
    };
  }, [currentStep, lang, voiceEnabled]);

  const handleSelectLang = (newLang) => {
    setLang(newLang);
    const newT = translations[newLang] || translations.hi;
    setFormData((prev) => ({
      ...prev,
      language_preference: newLang,
      craft_category: newT.crafts.handloom
    }));
  };

  const handlePlaySample = (sampleText, sampleLang) => {
    voiceService.speak(sampleText, sampleLang, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const handleToggleVoice = () => {
    if (voiceEnabled) {
      voiceService.stopSpeaking();
      voiceService.stopListening();
      setIsSpeaking(false);
      setIsListening(false);
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
      voiceService.playTone('cue');
    }
  };

  const handleStartVoiceDictation = (fieldName) => {
    setDictatingField(fieldName);
    setIsListening(true);

    voiceService.startListening(lang, {
      onStart: () => setIsListening(true),
      onResult: ({ final, interim }) => {
        const spoken = final || interim;
        if (spoken) {
          setFormData((prev) => ({
            ...prev,
            [fieldName]: spoken
          }));
        }
      },
      onEnd: () => {
        setIsListening(false);
        setDictatingField(null);
      },
      onError: () => {
        setIsListening(false);
        setDictatingField(null);
      }
    });
  };

  const handleStopVoiceDictation = () => {
    voiceService.stopListening();
    setIsListening(false);
    setDictatingField(null);
  };

  // Step 2 Submission -> Directly transitions to Step 3: Vendor Profile & Store Hub
  const handleProfileSubmit = async () => {
    setIsSubmitting(true);
    voiceService.stopSpeaking();

    try {
      const payload = {
        ...formData,
        visvas_eligible: ['OBC', 'SC', 'ST', 'Women SHG'].includes(formData.social_category)
      };

      const result = await artisanDbService.saveArtisanProfile(payload);
      setArtisanData(result.data);
      voiceService.playTone('success');
      
      setCurrentStep(3);
      const welcomeMsg = lang === 'mr'
        ? `अभिनंदन! आपले कारागीर प्रोफाइल तयार झाले आहे. आजची कमाई ₹३,८५० आहे.`
        : `बधाई हो! आपकी कारीगर प्रोफाइल और दुकान तैयार है। आज की कमाई ₹3,850 है।`;
      speakText(welcomeMsg, lang);
    } catch (err) {
      console.error('Profile creation error:', err);
      setArtisanData({
        ...formData,
        artisan_code: 'ART-MH-2026-0891',
        visvas_eligible: true
      });
      setCurrentStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* STEPS 1 & 2: ONBOARDING HEADER (Language & Details) */}
      {currentStep < 3 && (
        <Header
          currentStep={currentStep}
          lang={lang}
          voiceEnabled={voiceEnabled}
          onToggleVoice={handleToggleVoice}
        />
      )}

      {/* STEP 1: LANGUAGE SELECTION */}
      {currentStep === 1 && (
        <div className="slide-content-area">
          <VoiceNodeVisualizer
            isSpeaking={isSpeaking}
            isListening={isListening}
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
            onReplay={() => speakText(t.slide1Spoken, lang)}
            statusText={
              isSpeaking 
                ? (lang === 'mr' ? 'बोलत आहे...' : 'बोल रहे हैं...')
                : (lang === 'mr' ? 'आवाज सहाय्यक तयार' : 'आवाज़ सहायक तैयार')
            }
            subText={lang === 'mr' ? 'पुन्हा ऐकण्यासाठी टॅप करा' : 'दोबारा सुनने के लिए टैप करें'}
          />

          <LanguageSelectionSlide
            selectedLang={lang}
            onSelectLang={handleSelectLang}
            onPlaySample={handlePlaySample}
            onNext={() => {
              voiceService.stopSpeaking();
              voiceService.playTone('cue');
              setCurrentStep(2);
            }}
          />
        </div>
      )}

      {/* STEP 2: BASIC INFO (Name, Phone, DOB, Craft, Location, Category) */}
      {currentStep === 2 && (
        <div className="slide-content-area">
          <VoiceNodeVisualizer
            isSpeaking={isSpeaking}
            isListening={isListening}
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
            onReplay={() => speakText(t.detailsSpoken, lang)}
            statusText={
              isListening 
                ? (lang === 'mr' ? 'ऐकत आहे... बोला' : 'सुन रहे हैं... बोलिए')
                : isSpeaking 
                  ? (lang === 'mr' ? 'बोलत आहे...' : 'बोल रहे हैं...')
                  : (lang === 'mr' ? 'आवाज सहाय्यक तयार' : 'आवाज़ सहायक तैयार')
            }
            subText={lang === 'mr' ? 'पुन्हा ऐकण्यासाठी टॅप करा' : 'दोबारा सुनने के लिए टैप करें'}
          />

          <ArtisanDetailsSlide
            lang={lang}
            formData={formData}
            setFormData={setFormData}
            onSpeakText={(text) => speakText(text, lang)}
            onStartVoiceDictation={handleStartVoiceDictation}
            onStopVoiceDictation={handleStopVoiceDictation}
            dictatingField={dictatingField}
            onSubmit={handleProfileSubmit}
            onBack={() => {
              voiceService.stopSpeaking();
              setCurrentStep(1);
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* STEP 3: VENDOR PROFILE & STOREFRONT HUB (Profile, Products, Stock, Rush Hours, Revenue) */}
      {currentStep === 3 && (
        <VendorDashboard
          lang={lang}
          onSelectLang={handleSelectLang}
          artisanData={artisanData}
          onOpenOnboarding={() => {
            voiceService.stopSpeaking();
            setCurrentStep(2);
          }}
        />
      )}
    </div>
  );
}
