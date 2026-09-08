import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2, Check } from 'lucide-react';

export interface LanguageOption {
  code: string;
  label: string;
  nativeName: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' }
];

interface LanguageSelectorProps {
  className?: string;
  variant?: 'pill' | 'compact';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '', variant = 'pill' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize language code (e.g. 'en-US' -> 'en', 'gu-IN' -> 'gu')
  const currentCode = (i18n.language || localStorage.getItem('i18nextLng') || 'en').split('-')[0];
  const currentLanguage = LANGUAGES.find(l => l.code === currentCode) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    document.documentElement.lang = code;

    // Update settings in localStorage if present
    try {
      const saved = localStorage.getItem('ruralnex_user_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.interfaceLanguage = code;
        localStorage.setItem('ruralnex_user_settings', JSON.stringify(parsed));
      }
    } catch (e) {
      // ignore
    }

    // Notify other components
    window.dispatchEvent(new CustomEvent('ruralnex_language_changed', { detail: { language: code } }));

    // Sync to backend if authenticated
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (token) {
        fetch('/api/v1/auth/profile/', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ preferred_language: code })
        }).catch(() => {});
      }
    } catch (e) {
      // ignore
    }

    setIsOpen(false);
  };

  return (
    <div 
      className={`relative inline-block text-left ${className}`} 
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Language"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 ${
          variant === 'compact' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'
        } rounded-lg border text-gray-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer select-none ${
          isOpen
            ? 'bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-700 text-gray-900 dark:text-white'
            : 'bg-white dark:bg-zinc-900/90 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
        }`}
      >
        <Globe2 size={14} className="text-gray-500 dark:text-zinc-400 shrink-0" />
        <span className="tracking-tight">{currentLanguage.nativeName}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full pt-1.5 z-50">
          <div className="w-40 bg-white dark:bg-[#0c0d10] rounded-xl shadow-lg border border-gray-200/90 dark:border-zinc-800 py-1 animate-in fade-in zoom-in-95 duration-100">
          {LANGUAGES.map(lang => {
            const isSelected = currentCode === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                  isSelected 
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold' 
                    : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/60 hover:text-gray-900 dark:hover:text-white font-normal'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{lang.nativeName}</span>
                  {lang.code !== 'en' && (
                    <span className="text-[11px] text-gray-400 dark:text-zinc-500 font-normal">
                      ({lang.label})
                    </span>
                  )}
                </div>
                {isSelected && <Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />}
              </button>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
