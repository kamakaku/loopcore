import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'EN', flag: '🇬🇧', label: t('languages.english') },
    { code: 'de', name: 'DE', flag: '🇩🇪', label: t('languages.german') }
  ];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      setIsOpen(false);
      
      // Update HTML lang attribute
      document.documentElement.lang = languageCode;
      
      // Force a re-render of date-related components
      window.dispatchEvent(new Event('languageChanged'));
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label={t('common.changeLanguage')}
        title={t('common.changeLanguage')}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-700">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[120px] z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full px-3 py-1.5 text-sm flex items-center space-x-2 hover:bg-gray-50 ${
                i18n.language === language.code ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
              }`}
            >
              <span role="img" aria-label={language.label}>{language.flag}</span>
              <span>{language.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}