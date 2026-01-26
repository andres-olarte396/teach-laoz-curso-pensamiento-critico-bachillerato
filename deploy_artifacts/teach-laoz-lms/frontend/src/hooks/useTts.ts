import { useState, useRef, useEffect, useCallback } from "react";
import { useAccessibility } from "../context/AccessibilityContext";

interface UseTtsOptions {
  contentSelector?: string;
  onEnd?: () => void;
  lang?: string;
}

export const useTts = (options: UseTtsOptions = {}) => {
  const { contentSelector = ".content-area", lang = "es-ES", onEnd } = options;

  const { settings, updateTtsVoice, updateTtsRate } = useAccessibility();
  const { ttsVoiceURI: selectedVoiceURI, ttsRate: rate } = settings;

  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);

  const setRate = useCallback(
    (newRate: number) => {
      updateTtsRate(newRate);
      if (readingActive.current) {
        window.speechSynthesis.cancel();
      }
    },
    [updateTtsRate]
  );

  const readingActive = useRef(false);
  const currentIndexRef = useRef(0);
  const textBlocksRef = useRef<HTMLElement[]>([]);
  const boundaryFiredRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const esVoices = allVoices.filter((v) => v.lang.startsWith("es"));
      setAvailableVoices(esVoices);

      // Initialize if not set
      if (!selectedVoiceURI && esVoices.length > 0) {
        const preferred =
          esVoices.find(
            (v) => v.name.includes("Google") || v.name.includes("Natural")
          ) || esVoices[0];
        if (preferred) {
          updateTtsVoice(preferred.voiceURI);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoiceURI, updateTtsVoice]);

  const setVoice = useCallback(
    (voiceURI: string) => {
      updateTtsVoice(voiceURI);
    },
    [updateTtsVoice]
  );

  const clearHighlights = useCallback(() => {
    document
      .querySelectorAll(
        ".reading-highlight, .reading-word-highlight, .tts-word"
      )
      .forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.classList.contains("reading-word-highlight")) {
          htmlEl.classList.remove("reading-word-highlight");
        }
        if (htmlEl.classList.contains("reading-highlight")) {
          htmlEl.style.cssText = "";
          htmlEl.classList.remove("reading-highlight");
        }
      });
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
    if (timerRef.current) clearInterval(timerRef.current);
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
    const originalContent = el.innerHTML;
    boundaryFiredRef.current = false;

    // Advanced Word Segmentation (only if not already segmented)
    // Advanced Word Segmentation (only if not already segmented)
    // We use a filter to skip nested lists (UL, OL) to prevent reading them twice (once as part of parent, once as independent block)
    const filter: NodeFilter = {
      acceptNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (el.tagName === "LI") {
            const tag = element.tagName;
            if (
              tag === "UL" ||
              tag === "OL" ||
              tag === "DL" ||
              tag === "TABLE" ||
              element.classList.contains("mermaid")
            ) {
              return NodeFilter.FILTER_REJECT;
            }
          }
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    };

    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      filter
    );
    const textNodes: Node[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode);
      currentNode = walker.nextNode();
    }

    // Construct text to speak from the specific nodes we decided to process
    // This avoids including text from nested UL/OL that we rejected above
    const originalText = textNodes.map((n) => n.textContent).join("");

    let globalCharOffset = 0;
    textNodes.forEach((node) => {
      const text = node.textContent || "";
      const fragment = document.createDocumentFragment();
      const tokens = text.split(/(\s+)/);

      tokens.forEach((token) => {
        if (token.trim().length > 0) {
          const span = document.createElement("span");
          span.className = "tts-word transition-all duration-75";
          span.dataset.charIndex = globalCharOffset.toString();
          span.textContent = token;
          fragment.appendChild(span);
        } else {
          fragment.appendChild(document.createTextNode(token));
        }
        globalCharOffset += token.length;
      });

      if (node.parentNode) {
        node.parentNode.replaceChild(fragment, node);
      }
    });

    // Block level Highlight
    const isDark = document.documentElement.classList.contains("dark");
    el.style.cssText = `
      background-color: ${
        isDark ? "rgba(16, 185, 129, 0.08)" : "rgba(16, 185, 129, 0.05)"
      } !important;
      border-radius: 12px !important;
      padding-left: 16px !important;
      padding-right: 16px !important;
      margin-left: -16px !important;
      border-left: 5px solid #10b981 !important;
      transition: all 0.4s ease !important;
    `;
    el.classList.add("reading-highlight");

    // Smooth scroll
    const rect = el.getBoundingClientRect();
    if (rect.top < 100 || rect.bottom > window.innerHeight) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const utterance = new SpeechSynthesisUtterance(originalText);
    utterance.lang = lang;
    utterance.rate = rate;

    // Selected Voice Integration
    const voices = window.speechSynthesis.getVoices();
    const userVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);

    if (userVoice) {
      utterance.voice = userVoice;
    } else {
      // Fallback if the selected voice is not found
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith(lang) &&
            (v.name.includes("Google") || v.name.includes("Natural"))
        ) || voices.find((v) => v.lang.startsWith(lang));
      if (preferredVoice) utterance.voice = preferredVoice;
    }

    const wordsSpans = Array.from(
      el.querySelectorAll(".tts-word")
    ) as HTMLElement[];

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        boundaryFiredRef.current = true;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const charIndex = event.charIndex;
        let activeSpan: HTMLElement | null = null;
        for (let i = 0; i < wordsSpans.length; i++) {
          const spanIndex = parseInt(wordsSpans[i].dataset.charIndex || "0");
          if (spanIndex <= charIndex) {
            activeSpan = wordsSpans[i];
          } else {
            break;
          }
        }

        if (activeSpan) {
          wordsSpans.forEach((w) =>
            w.classList.remove("reading-word-highlight")
          );
          activeSpan.classList.add("reading-word-highlight");
        }
      }
    };

    utterance.onend = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      el.innerHTML = originalContent;
      el.style.cssText = "";
      el.classList.remove("reading-highlight");

      currentIndexRef.current++;
      if (readingActive.current) {
        setTimeout(speakNext, 60);
      }
    };

    utterance.onerror = (e) => {
      if (timerRef.current) clearInterval(timerRef.current);
      console.warn("[TTS] Playback Error:", e);
      el.innerHTML = originalContent;
      el.style.cssText = "";
      if (readingActive.current && e.error !== "interrupted") {
        currentIndexRef.current++;
        setTimeout(speakNext, 60);
      }
    };

    window.speechSynthesis.speak(utterance);

    // Hybrid Sync Fallback
    setTimeout(() => {
      if (
        readingActive.current &&
        !boundaryFiredRef.current &&
        wordsSpans.length > 0
      ) {
        let wordIndex = 0;
        const baseDelay = 220;
        const adjustedDelay = baseDelay / rate;

        timerRef.current = window.setInterval(() => {
          if (!readingActive.current || isPaused) return;

          if (wordIndex < wordsSpans.length) {
            wordsSpans.forEach((w) =>
              w.classList.remove("reading-word-highlight")
            );
            wordsSpans[wordIndex].classList.add("reading-word-highlight");
            wordIndex++;
          } else {
            if (timerRef.current) clearInterval(timerRef.current);
          }
        }, adjustedDelay);
      }
    }, 1500);
  }, [lang, rate, stopReading, isPaused, selectedVoiceURI]);

  const startReading = useCallback(() => {
    const container = document.querySelector(contentSelector);
    if (!container) return;

    const blocks = Array.from(
      container.querySelectorAll<HTMLElement>(
        "h1, h2, h3, h4, p, li, blockquote, .mermaid, table"
      )
    );
    const textBlocks = blocks.filter((el) => {
      // Prevent duplication: if a container (blockquote, li) has 'p' children which are also selected,
      // ignore the container and let the 'p' children be read.
      if (
        (el.tagName === "BLOCKQUOTE" || el.tagName === "LI") &&
        el.querySelector("p")
      ) {
        return false;
      }

      const text = el.innerText?.trim();
      return text && text.length > 0;
    });
    textBlocksRef.current = textBlocks;

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
    currentIndexRef.current = Math.min(
      currentIndexRef.current + 1,
      textBlocksRef.current.length
    );
    speakNext();
  }, [isReading, clearHighlights, speakNext]);

  const seekBackward = useCallback(() => {
    if (!isReading) return;
    window.speechSynthesis.cancel();
    clearHighlights();
    currentIndexRef.current = Math.max(currentIndexRef.current - 1, 0);
    speakNext();
  }, [isReading, clearHighlights, speakNext]);

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
    availableVoices,
    selectedVoiceURI,
    startReading,
    pauseReading,
    resumeReading,
    stopReading,
    seekForward,
    seekBackward,
    setVoice,
    rate,
    setRate,
  };
};
