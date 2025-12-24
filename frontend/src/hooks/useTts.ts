import { useState, useRef, useEffect, useCallback } from 'react';

interface UseTtsOptions {
  contentSelector?: string;
  onEnd?: () => void;
  lang?: string;
  rate?: number;
}

export const useTts = (options: UseTtsOptions = {}) => {
  const {
    contentSelector = '.content-area',
    lang = 'es-ES',
    rate = 1.0,
    onEnd
  } = options;

  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const readingActive = useRef(false);
  const currentIndexRef = useRef(0);
  const textBlocksRef = useRef<HTMLElement[]>([]);

  // Cleanup helper to remove highlights
  const clearHighlights = useCallback(() => {
    document.querySelectorAll('.reading-highlight').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.cssText = '';
      htmlEl.classList.remove('reading-highlight');
    });
  }, []);

  const stopReading = useCallback(() => {
    readingActive.current = false;
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    clearHighlights();
    currentIndexRef.current = 0;
    if (onEnd) onEnd();
  }, [clearHighlights, onEnd]);

  const pauseReading = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resumeReading = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const speakNext = useCallback(() => {
    if (!readingActive.current) return;

    const textBlocks = textBlocksRef.current;
    if (currentIndexRef.current >= textBlocks.length) {
        stopReading();
        return;
    }

    const el = textBlocks[currentIndexRef.current];

    // Highlight: Use subtler styles for better UX
    const isDark = document.documentElement.classList.contains('dark');
    
    // Use cssText but with softer values
    el.style.cssText = `
      background-color: ${isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'} !important;
      border-radius: 8px !important;
      padding-left: 12px !important;
      padding-right: 12px !important;
      margin-left: -12px !important; /* Compensate padding */
      border-left: 4px solid #10b981 !important;
      transition: all 0.5s ease !important;
    `;
    
    el.classList.add('reading-highlight'); 
    
    // Smooth scroll only if element is out of viewport (roughly)
    const rect = el.getBoundingClientRect();
    const inViewport = (
        rect.top >= 150 && 
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
    if (!inViewport) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    const text = el.innerText;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    utterance.onend = () => {
      // Remove highlight styles by clearing cssText
      el.style.cssText = '';
      el.classList.remove('reading-highlight');
      
      currentIndexRef.current++;
      // Use timeout to allow UI update / breath
      if (readingActive.current) {
        setTimeout(speakNext, 50);
      }
    };

    utterance.onerror = (e) => {
       console.warn('Speech error or cancel', e);
       el.classList.remove('bg-yellow-500/20', 'rounded', 'px-1', '-mx-1', 'transition-colors', 'duration-300');
       if (readingActive.current) { 
           // If error wasn't a manual cancel, move next
           if (e.error !== 'interrupted') {
               currentIndexRef.current++;
               setTimeout(speakNext, 50);
           }
       }
    };

    window.speechSynthesis.speak(utterance);
  }, [lang, rate, stopReading]);

  const startReading = useCallback(() => {
    // Safety check for content area
    const container = document.querySelector(contentSelector);
    if (!container) return;

    // Enhanced selector for readable blocks
    const blocks = Array.from(container.querySelectorAll<HTMLElement>('h1, h2, h3, h4, p, li, blockquote, .mermaid, table'));
    const textBlocks = blocks.filter(el => {
      const text = el.innerText?.trim();
      return text && text.length > 0;
    });

    if (textBlocks.length === 0) return;
    textBlocksRef.current = textBlocks;

    // Debug: Log found blocks
    console.log(`[TTS] Found ${textBlocks.length} readable blocks.`);

    // Stop unique previous instances just in case
    window.speechSynthesis.cancel();
    clearHighlights();

    setIsReading(true);
    setIsPaused(false);
    readingActive.current = true;
    currentIndexRef.current = 0;

    speakNext();
  }, [contentSelector, clearHighlights, speakNext]);

  const seekForward = useCallback(() => {
    if (!isReading) return;
    window.speechSynthesis.cancel();
    clearHighlights();
    // Move 1 block forward (approximation for 10s in simple content)
    currentIndexRef.current = Math.min(currentIndexRef.current + 1, textBlocksRef.current.length);
    speakNext();
  }, [isReading, clearHighlights, speakNext]);

  const seekBackward = useCallback(() => {
    if (!isReading) return;
    window.speechSynthesis.cancel();
    clearHighlights();
    // Move 1 block backward
    currentIndexRef.current = Math.max(currentIndexRef.current - 1, 0);
    speakNext();
  }, [isReading, clearHighlights, speakNext]);

  // Use effect to cleanup on unmount
  useEffect(() => {
    return () => {
      if (readingActive.current) {
        stopReading();
      }
    };
  }, [stopReading]);

  return {
    isReading,
    isPaused,
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    seekForward,
    seekBackward
  };
};
