import React, { useState, useEffect } from 'react';
import { Eye, Volume2, VolumeX, Type, HelpCircle, Sparkles, BookOpen, Layers } from 'lucide-react';

export type VisionMode = 'default' | 'protan' | 'deuteran' | 'tritan' | 'mono';

interface AccessibilityProps {
  visionMode: VisionMode;
  setVisionMode: (mode: VisionMode) => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
}

export default function AccessibilityControls({
  visionMode,
  setVisionMode,
  voiceActive,
  setVoiceActive
}: AccessibilityProps) {
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  const [readingGuideActive, setReadingGuideActive] = useState<boolean>(false);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

  // Trigger custom global styling class on the document body based on vision mode
  useEffect(() => {
    const body = document.documentElement;
    // Remove previous modes
    body.classList.remove('protanopia-filter', 'deuteranopia-filter', 'tritanopia-filter', 'monochromacy-filter', 'text-large', 'text-xlarge', 'high-contrast-active');
    
    if (visionMode === 'protan') body.classList.add('protanopia-filter');
    if (visionMode === 'deuteran') body.classList.add('deuteranopia-filter');
    if (visionMode === 'tritan') body.classList.add('tritanopia-filter');
    if (visionMode === 'mono') body.classList.add('monochromacy-filter');
    if (highContrastMode) body.classList.add('high-contrast-active');

    if (fontSize === 'large') body.classList.add('text-large');
    if (fontSize === 'xlarge') body.classList.add('text-xlarge');

    // Dispense toast on changes
    let toastTitle = "Vision Mode Shifted";
    let toastMsg = "Your environmental vision filters have been shifted.";
    if (visionMode === 'default') {
      toastTitle = "Default Spectrum Restored";
      toastMsg = "Standard full-contrast layout colors are active.";
    } else if (visionMode === 'protan') {
      toastTitle = "Protanopia Mode Applied";
      toastMsg = "Red/Green weak filter is active. Reds are shifted to preserve safe visual distinction.";
    } else if (visionMode === 'deuteran') {
      toastTitle = "Deuteranopia Mode Applied";
      toastMsg = "Green weak filter is active. Green values are enhanced for structural clarity.";
    } else if (visionMode === 'tritan') {
      toastTitle = "Tritanopia Mode Applied";
      toastMsg = "Blue/Yellow weak filter is active. Blues are shifted to protect contrast.";
    } else if (visionMode === 'mono') {
      toastTitle = "Monochrome Mode Applied";
      toastMsg = "Gray scale contrast enhancement is active for absolute shape-based visibility.";
    }

    setToast({ title: toastTitle, message: toastMsg });
    const timer = setTimeout(() => setToast(null), 4000);

    // Announce mode choice via TTS if enabled
    if (voiceActive) {
      announceSpeech(`Vision mode updated to ${visionMode === 'default' ? 'standard colors' : visionMode + ' accessible colors'}`);
    }

    return () => clearTimeout(timer);
  }, [visionMode, fontSize]);

  // Handle High Contrast mode specific toast and setup
  useEffect(() => {
    const body = document.documentElement;
    if (highContrastMode) {
      body.classList.add('high-contrast-active');
    } else {
      body.classList.remove('high-contrast-active');
    }

    setToast({
      title: highContrastMode ? "High-Contrast Mode: Enabled" : "High-Contrast Mode: Disabled",
      message: highContrastMode 
        ? "Enforcing absolute yellow-on-black color swapping for maximal legibility."
        : "Standard neobrutalist page colors and shadows restored."
    });
    
    const timer = setTimeout(() => setToast(null), 4000);

    if (voiceActive) {
      announceSpeech(highContrastMode ? "High contrast mode activated" : "High contrast mode deactivated");
    }

    return () => clearTimeout(timer);
  }, [highContrastMode]);

  // Handle Reading Guide mode dynamic high-contrast outlines
  useEffect(() => {
    if (!readingGuideActive) return;
    let activeElement: HTMLElement | null = null;

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.innerText && target.tagName !== 'BODY' && target.tagName !== 'HTML') {
        if (activeElement) {
          activeElement.style.outline = '';
          activeElement.style.boxShadow = '';
          activeElement.style.borderRadius = '';
        }
        // Apply high-contrast purple-yellow double border outline
        target.style.outline = '4px solid #7C3AED';
        target.style.boxShadow = '0 0 0 4px #FFD700';
        target.style.borderRadius = '6px';
        activeElement = target;
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        target.style.outline = '';
        target.style.boxShadow = '';
        target.style.borderRadius = '';
      }
    };

    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    setToast({
      title: "Reading Guide Mode: ON",
      message: "Hover any text box to highlight it with a high-contrast guide border."
    });
    
    const timer = setTimeout(() => setToast(null), 4000);
    
    return () => {
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      clearTimeout(timer);
      if (activeElement) {
        activeElement.style.outline = '';
        activeElement.style.boxShadow = '';
        activeElement.style.borderRadius = '';
      }
    };
  }, [readingGuideActive]);

  const announceSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSpeakerToggle = () => {
    const nextState = !voiceActive;
    setVoiceActive(nextState);
    if (nextState) {
      announceSpeech("Voice assistant activated. Hover any card or button to hear description.");
    }
  };

  // Implement automatic hover reader listener globally
  useEffect(() => {
    if (!voiceActive) return;

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const readText = target.getAttribute('data-narrate') || target.getAttribute('aria-label') || target.innerText;
      
      // Read if element is explicitly marked or is button/heading/input
      if (readText && (
        target.hasAttribute('data-narrate') ||
        target.tagName === 'BUTTON' || 
        target.tagName === 'H1' || 
        target.tagName === 'H2' || 
        target.tagName === 'H3' || 
        target.tagName === 'LABEL'
      )) {
        // limit text size to read to avoid long readings unless requested
        const cutText = readText.length > 100 ? readText.slice(0, 95) + '...' : readText;
        announceSpeech(cutText);
      }
    };

    document.addEventListener('mouseover', handleHover);
    return () => {
      document.removeEventListener('mouseover', handleHover);
    };
  }, [voiceActive]);

  return (
    <div 
      id="accessibility-bar"
      className="bg-[#FAF8F2] text-black py-3 px-4 border-b-4 border-black flex flex-wrap items-center justify-between gap-4 text-xs font-bold relative"
      data-narrate="Accessibility controls at TOP. Select vision filters or turn on audio readings."
    >
      <div className="flex items-center gap-2 font-black text-black uppercase tracking-wider">
        <Sparkles className="h-4 w-4 text-indigo-600" />
        <span>INCLUSIVE ACCESS PROTOCOL (WCAG 2.1)</span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Color Blindness Toggles */}
        <div className="flex items-center gap-1 bg-white border-2 border-black p-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="px-2 text-zinc-500 text-[10px] font-black flex items-center gap-1 uppercase tracking-wide">
            <Eye className="h-3.5 w-3.5 text-black" /> VISION:
          </span>
          <button
            onClick={() => setVisionMode('default')}
            className={`px-2 py-1 rounded-lg transition-all font-black uppercase text-[10px] cursor-pointer ${visionMode === 'default' ? 'bg-[#FFD700] text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-amber-100 text-zinc-700'}`}
            title="Standard Theme color settings"
            aria-label="Standard natural colors theme"
          >
            Default
          </button>
          <button
            onClick={() => setVisionMode('protan')}
            className={`px-2 py-1 rounded-lg transition-all font-black uppercase text-[10px] cursor-pointer ${visionMode === 'protan' ? 'bg-[#FFD700] text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-amber-100 text-zinc-700'}`}
            title="Protanopia Color blind filtering (Red/Green-Weak)"
            aria-label="Protanopia safe theme"
          >
            Red-Weak
          </button>
          <button
            onClick={() => setVisionMode('deuteran')}
            className={`px-2 py-1 rounded-lg transition-all font-black uppercase text-[10px] cursor-pointer ${visionMode === 'deuteran' ? 'bg-[#FFD700] text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-amber-100 text-zinc-700'}`}
            title="Deuteranopia Color blind filtering (Green-Weak)"
            aria-label="Deuteranopia safe theme"
          >
            Green-Weak
          </button>
          <button
            onClick={() => setVisionMode('tritan')}
            className={`px-2 py-1 rounded-lg transition-all font-black uppercase text-[10px] cursor-pointer ${visionMode === 'tritan' ? 'bg-[#FFD700] text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-amber-100 text-zinc-700'}`}
            title="Tritanopia Color blind filtering (Blue/Yellow-Weak)"
            aria-label="Tritanopia safe theme"
          >
            Blue-Weak
          </button>
          <button
            onClick={() => setVisionMode('mono')}
            className={`px-2 py-1 rounded-lg transition-all font-black uppercase text-[10px] cursor-pointer ${visionMode === 'mono' ? 'bg-black text-white border border-black' : 'hover:bg-zinc-200 text-zinc-700'}`}
            title="Monochromatic contrast (B&W)"
            aria-label="High contrast monochrome mode"
          >
            Mono
          </button>
        </div>

        {/* High-Contrast Toggler */}
        <button
          onClick={() => setHighContrastMode(prev => !prev)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 border-black font-black text-[10px] uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 ${
            highContrastMode ? 'bg-[#FFD700] text-black' : 'bg-white text-zinc-700 hover:bg-zinc-100'
          }`}
          title="Swap page background to deep black and text to high visibility yellow"
          aria-label="Toggle High-Contrast color profile"
        >
          <Layers className="h-3.5 w-3.5 text-black" />
          <span>Contrast: {highContrastMode ? "HIGH" : "STD"}</span>
        </button>

        {/* Reading Guide Mode */}
        <button
          onClick={() => setReadingGuideActive(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-black font-black text-[10px] uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 ${
            readingGuideActive ? 'bg-indigo-600 text-white border-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'
          }`}
          title="Toggle reading guide to draw borders on hovered text blocks"
          aria-label="Toggle Reading Guide mode"
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Guide: {readingGuideActive ? "ACTIVE" : "OFF"}</span>
        </button>

        {/* Text Sizing Toggles */}
        <div className="flex items-center gap-1 bg-white border-2 border-black p-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="px-2 text-zinc-500 text-[10px] font-black flex items-center gap-1 uppercase tracking-wide">
            <Type className="h-3.5 w-3.5 text-black" /> FONT SIZE:
          </span>
          <button
            onClick={() => setFontSize('normal')}
            className={`px-2 py-1 rounded-lg font-black uppercase text-[10px] cursor-pointer ${fontSize === 'normal' ? 'bg-[#10B981] text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-emerald-50 text-zinc-700'}`}
            aria-label="Set regular text size"
          >
            Normal
          </button>
          <button
            onClick={() => setFontSize('large')}
            className={`px-2 py-1 rounded-lg font-black uppercase text-[10px] cursor-pointer ${fontSize === 'large' ? 'bg-[#10B981] text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-emerald-50 text-zinc-700'}`}
            aria-label="Set large text size for better readability"
          >
            Large
          </button>
          <button
            onClick={() => setFontSize('xlarge')}
            className={`px-2 py-1 rounded-lg font-black uppercase text-[10px] cursor-pointer ${fontSize === 'xlarge' ? 'bg-[#10B981] text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]' : 'hover:bg-emerald-50 text-zinc-700'}`}
            aria-label="Set extra large text size for high visibility"
          >
            X-Large
          </button>
        </div>

        {/* Voice Narrator Activator */}
        <button
          onClick={handleSpeakerToggle}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black transition-all font-black text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 uppercase tracking-wider ${
            voiceActive 
              ? 'bg-rose-500 text-white font-extrabold' 
              : 'bg-white text-black hover:bg-[#FAF8F2]'
          }`}
          aria-label={voiceActive ? "Turn off Voice assistance" : "Turn on Auditory Screen Reader assistance"}
        >
          {voiceActive ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          <span>{voiceActive ? "READER: ON" : "VOICE READER"}</span>
        </button>
      </div>

      {/* FLOATING HUD TOAST NOTIFICATION CARD */}
      {toast && (
        <div 
          className="fixed bottom-6 right-6 z-50 bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm transition-all duration-300 transform animate-bounce-short text-left"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-1.5 mb-1.5">
            <span className="text-sm">🔔</span>
            <strong className="text-black font-black uppercase text-[11px] tracking-wide">{toast.title}</strong>
          </div>
          <p className="text-[10.5px] font-bold text-zinc-650 leading-relaxed">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
