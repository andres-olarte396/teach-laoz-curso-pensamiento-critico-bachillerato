import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface AccessibilitySettings {
  fontSize: number;    // Multiplier for base font size
  lineSpacing: number; // Multiplier for line height
  dyslexicFont: boolean;
  highContrast: boolean;
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateFontSize: (size: number) => void;
  updateLineSpacing: (spacing: number) => void;
  toggleDyslexicFont: () => void;
  toggleHighContrast: () => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  fontSize: 1,
  lineSpacing: 1.6,
  dyslexicFont: false,
  highContrast: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('accessibility_settings', JSON.stringify(settings));
    
    // Apply settings to document root
    const root = document.documentElement;
    root.style.setProperty('--font-scale', settings.fontSize.toString());
    root.style.setProperty('--line-spacing-scale', settings.lineSpacing.toString());
    
    if (settings.dyslexicFont) {
        root.classList.add('dyslexic-font');
    } else {
        root.classList.remove('dyslexic-font');
    }

    if (settings.highContrast) {
        root.classList.add('high-contrast-mode');
    } else {
        root.classList.remove('high-contrast-mode');
    }
  }, [settings]);

  const updateFontSize = (fontSize: number) => setSettings(prev => ({ ...prev, fontSize }));
  const updateLineSpacing = (lineSpacing: number) => setSettings(prev => ({ ...prev, lineSpacing }));
  const toggleDyslexicFont = () => setSettings(prev => ({ ...prev, dyslexicFont: !prev.dyslexicFont }));
  const toggleHighContrast = () => setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  const resetSettings = () => setSettings(DEFAULT_SETTINGS);

  return (
    <AccessibilityContext.Provider 
        value={{ 
            settings, 
            updateFontSize, 
            updateLineSpacing, 
            toggleDyslexicFont, 
            toggleHighContrast, 
            resetSettings 
        }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
