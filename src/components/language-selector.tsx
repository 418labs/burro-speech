'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const languages = [
  { code: 'en-US', name: 'EN' },
  { code: 'es-AR', name: 'ES' },
  { code: 'fr-FR', name: 'FR' },
  { code: 'de-DE', name: 'DE' },
  { code: 'it-IT', name: 'IT' },
  { code: 'pt-BR', name: 'PT' },
  { code: 'ja-JP', name: 'JA' },
  { code: 'zh-CN', name: 'ZH' },
  { code: 'ru-RU', name: 'RU' },
  { code: 'ar-SA', name: 'AR' },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ value: initialValue, onChange }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(initialValue);
  return (
    <div className='relative'>
      <select
        value={selectedLanguage}
        onChange={(e) => {
            onChange(e.target.value)
            setSelectedLanguage(e.target.value);
        }}
        className='appearance-none w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.name}
          </option>
        ))}
      </select>
      <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300'>
        <ChevronDown size={16} />
      </div>
    </div>
  );
}
