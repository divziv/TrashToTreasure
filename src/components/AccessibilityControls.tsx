import React, { useState, useEffect } from 'react';
import { Eye, Volume2, VolumeX, Type, HelpCircle, Sparkles } from 'lucide-react';

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

  // Trigger custom global styling class on the document body based on vision mode
  useEffect(() => {
    const body = document.documentElement;
    // Remove previous modes
    body.classList.remove('protanopia-filter', 'deuteranopia-filter', 'tritanopia-filter', 'monochromacy-filter', 'text-large', 'text-xlarge');
    
    if (visionMode === 'protan') body.classList.add('protanopia-filter');
    if (visionMode === 'deuteran') body.classList.add('deuteranopia-filter');
    if (visionMode === 'tritan') body.classList.add('tritanopia-filter');
    if (visionMode === 'mono') body.classList.add('monochromacy-filter');

    if (fontSize === 'large') body.classList.add('text-large');
    if (fontSize === 'xlarge') body.classList.add('text-xlarge');

    // Announce mode choice via TTS if enabled
    if (voiceActive) {
      announceSpeech(`Vision mode updated to ${visionMode === 'default' ? 'standard colors' : visionMode + ' accessible colors'}`);
    }
  }, [visionMode, fontSize]);

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
      className="bg-[#FAF8F2] text-black py-3 px-4 border-b-4 border-black flex flex-wrap items-center justify-between gap-4 text-xs font-bold"
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
              ? 'bg-rose-450 text-white font-extrabold' 
              : 'bg-white text-black hover:bg-[#FAF8F2]'
          }`}
          aria-label={voiceActive ? "Turn off Voice assistance" : "Turn on Auditory Screen Reader assistance"}
        >
          {voiceActive ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
          <span>{voiceActive ? "READER: ON" : "VOICE READER"}</span>
        </button>
      </div>
    </div>
  );
}
