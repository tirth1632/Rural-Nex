import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe2, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'gu', label: 'ગુજરાતી' }
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use base language code (e.g. 'en-US' -> 'en')
  const baseCode = (i18n.language || 'en').split('-')[0];
  const currentLanguage = LANGUAGES.find(l => l.code === baseCode) || LANGUAGES[0];

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
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50 transition shadow-sm"
      >
        <Globe2 size={14} className="text-gray-400" />
        {currentLanguage.label}
        <ChevronDown size={12} className={`text-gray-400 ml-0.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 text-sm font-medium transition flex items-center justify-between ${
                baseCode === lang.code 
                  ? 'bg-green-50 text-green-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {lang.label}
              {baseCode === lang.code && <Check size={14} className="text-green-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
