'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Input } from './ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Button } from './ui/button';

import { MOCK_LANGUAGES } from '@/mock/languages';

export function FreeTrialForm() {
  const router = useRouter();

  const [url, setUrl] = useState('https://www.canva.com/design/DAGhOT00YU4/hh-AkEG99AYp4Uqe3HX4eA/view?embed');
  const [language, setLanguage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate URL
    if (!isValidUrl(url)) {
      setError('Por favor, introduce una URL válida');
      return;
    }

    // Redirect to /app?url=''&to=''
    router.push(`/app?url=${url}&to=${language}`);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className='w-full py-8 md:px-8'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row gap-2'>
          <div className='w-full'>
            <Label htmlFor='url'>URL of your presentation (Soon)</Label>
            <Input
              type='url'
              id='url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://canva.com/design/...'
              disabled
              required
            />
            {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
          </div>

          <div className='min-w-[80px]'>
            <Label htmlFor='language'>To</Label>

            <Select defaultValue={language} onValueChange={setLanguage}>
              <SelectTrigger id='language'>
                <SelectValue placeholder='Lang' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>To</SelectLabel>
                  {MOCK_LANGUAGES.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type='submit' size='lg' disabled={!language || !url}>
          Try now
        </Button>
      </form>
    </div>
  );
}
