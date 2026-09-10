import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function VoiceNodeVisualizer({ 
  isSpeaking, 
  isListening, 
  voiceEnabled, 
  onToggleVoice, 
  onReplay, 
  statusText, 
  subText 
}) {
  return (
    <div 
      className="voice-node-pill"
      onClick={onReplay}
      title="Tap to hear instructions aloud"
    >
      <div className="voice-node-left">
        <div className="voice-avatar-circle">
          <Sparkles size={16} />
        </div>
        <div>
          <div className="voice-status-text">
            {isListening 
              ? '🔴 ' + statusText 
              : isSpeaking 
                ? '🔊 ' + statusText 
                : voiceEnabled 
                  ? statusText 
                  : 'Voice Muted'}
          </div>
          <div className="voice-subtext">
            {subText || (voiceEnabled ? 'Tap anywhere to listen again' : 'Tap to unmute')}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className={`soundwave ${(isSpeaking || isListening) ? 'active' : ''}`}>
          <div className="soundwave-bar"></div>
          <div className="soundwave-bar"></div>
          <div className="soundwave-bar"></div>
          <div className="soundwave-bar"></div>
          <div className="soundwave-bar"></div>
        </div>

        <button 
          className="voice-toggle-btn"
          style={{ padding: '4px 8px', fontSize: '11px' }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleVoice();
          }}
          title={voiceEnabled ? 'Mute voice guide' : 'Enable voice guide'}
        >
          {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      </div>
    </div>
  );
}
