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

  // Cleanup helper to remove highlights
  const clearHighlights = useCallback(() => {
    document.querySelectorAll('.reading-highlight, .bg-yellow-500\\/20').forEach(el => {
      el.classList.remove('reading-highlight', 'bg-yellow-500/20', 'rounded', 'px-1', '-mx-1', 'transition-colors', 'duration-300');
    });
  }, []);

  const stopReading = useCallback(() => {
    readingActive.current = false;
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    clearHighlights();
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

    // Stop unique previous instances just in case
    window.speechSynthesis.cancel();
    clearHighlights();

    setIsReading(true);
    setIsPaused(false);
    readingActive.current = true;

    let currentIndex = 0;

    const speakNext = () => {
      if (!readingActive.current) {
         if (currentIndex >= textBlocks.length) {
             stopReading();
         }
        return;
      }

      if (currentIndex >= textBlocks.length) {
          stopReading();
          return;
      }

      const el = textBlocks[currentIndex];
      
      // Highlight: Add Tailwind classes for nice yellow background
      el.classList.add('bg-yellow-500/20', 'rounded', 'px-1', '-mx-1', 'transition-colors', 'duration-300');
      
      // Smooth scroll only if element is out of viewport (roughly)
      const rect = el.getBoundingClientRect();
      const inViewport = (
          rect.top >= 0 &&
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
        // Remove highlight
        el.classList.remove('bg-yellow-500/20', 'rounded', 'px-1', '-mx-1', 'transition-colors', 'duration-300');
        currentIndex++;
        // Use timeout to allow UI update / breath
        if (readingActive.current) {
          setTimeout(speakNext, 50);
        }
      };

      utterance.onerror = (e) => {
         console.warn('Speech error or cancel', e);
         el.classList.remove('bg-yellow-500/20', 'rounded', 'px-1', '-mx-1', 'transition-colors', 'duration-300');
         if (readingActive.current) { 
             currentIndex++;
             setTimeout(speakNext, 50);
         }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNext();
  }, [contentSelector, lang, rate, clearHighlights, stopReading]);

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
    stopReading
  };
};
