'use client';

import { useState } from 'react';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';

import { MOCK_LANGUAGES } from '@/mock/languages';

interface LanguageSelectorProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelector({ label, id, value: initialValue, onChange }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(initialValue);
  return (
    <Select
      defaultValue={selectedLanguage}
      onValueChange={(value) => {
        onChange(value);
        setSelectedLanguage(value);
      }}
    >
      <SelectTrigger className='w-[60px]'>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{label}</SelectLabel>
          {MOCK_LANGUAGES.map((language) => (
            <SelectItem key={language.code} value={language.code}>
              {language.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
