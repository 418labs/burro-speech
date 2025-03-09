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
  const [languageFrom, setLanguageFrom] = useState('es-AR');
  const [languageTo, setLanguageTo] = useState('en-US');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate URL
    if (!isValidUrl(url)) {
      setError('Por favor, introduce una URL válida');
      return;
    }

    // Validate that it's a Canva or Google Slides URL
    if (!url.includes('canva.com') && !url.includes('docs.google.com/presentation')) {
      setError('Please enter a valid Canva or Google Slides URL');
      return;
    }

    // Process URL based on service
    let finalUrl = url;
    
    // For Canva: Convert /edit URLs to /view?embed
    if (url.includes('canva.com') && url.includes('/edit')) {
      finalUrl = url.replace('/edit', '/view?embed');
    }
    
    // For Google Slides: Ensure URL has /embed
    if (url.includes('docs.google.com/presentation')) {
      // If URL doesn't already contain /embed, replace the last part with /embed
      if (!url.includes('/embed')) {
        // Extract ID from URL pattern
        const matches = url.match(/\/d\/([^\/]+)/);
        if (matches && matches[1]) {
          const presentationId = matches[1];
          // Check if URL ends with /edit or /present or similar pattern
          if (url.match(/\/(edit|present|view|pub)($|\?)/)) {
            finalUrl = url.replace(/\/(edit|present|view|pub)($|\?)/, '/embed$2');
          } else {
            // If no recognized ending, append /embed
            finalUrl = `https://docs.google.com/presentation/d/${presentationId}/embed`;
          }
        }
      }
    }

    // Redirect to /app?url=''&to=''
    router.push(`/app?url=${finalUrl}&to=${languageTo}&from=${languageFrom}`);
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
            <Label htmlFor='url'>URL of your presentation</Label>
            <Input
              type='url'
              id='url'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder='https://canva.com/design/... or https://docs.google.com/presentation/...'
              required
            />
            {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
          </div>

          <div className='min-w-[100px]'>
            <Label htmlFor='languageFrom'>From</Label>

            <Select defaultValue={languageFrom} onValueChange={setLanguageFrom}>
              <SelectTrigger id='languageFrom'>
                <SelectValue placeholder='Lang' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>From</SelectLabel>
                  {MOCK_LANGUAGES.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className='min-w-[100px]'>
            <Label htmlFor='languageTo'>To</Label>

            <Select defaultValue={languageTo} onValueChange={setLanguageTo}>
              <SelectTrigger id='languageTo'>
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

        <Button type='submit' size='lg' disabled={!languageTo || !url || !languageFrom}>
          Try now
        </Button>
      </form>
    </div>
  );
}
