import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Home, Mic, MicOff, Settings } from 'lucide-react';

import useLiveTranslation from '@/hooks/useLiveTranslation';

import { Button } from './ui/button';
import { SubtitleSettings, SubtitleSettingsProps } from './subtitle-settings';

type NavbarProps = {
  setTranslatedText: (text: string) => void;
  setOriginalText: (text: string) => void;
  initialSourceLanguage: string;
  initialTargetLanguage: string;
} & SubtitleSettingsProps;

export function Navbar({
  settings: subtitleSettings,
  onChange: setSubtitleSettings,
  initialSourceLanguage,
  initialTargetLanguage,
  setTranslatedText,
  setOriginalText,
}: NavbarProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Setup live translation with Next.js API route
  const liveTranslation = useLiveTranslation({
    initialSourceLanguage,
    initialTargetLanguage,
    autoStart: true,
  });

  const {
    isListening,
    originalText,
    translatedText,
    startListening,
    stopListening,
    setSourceLanguage,
    setTargetLanguage,
  } = liveTranslation;

  useEffect(() => {
    setOriginalText(originalText);
  }, [originalText]);

  useEffect(() => {
    setTranslatedText(translatedText);
  }, [translatedText]);

  // Toggle recording function
  const toggleRecording = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    setSourceLanguage(initialSourceLanguage);
  }, [initialSourceLanguage, setSourceLanguage]);

  useEffect(() => {
    setTargetLanguage(initialTargetLanguage);
  }, [initialTargetLanguage, setTargetLanguage]);

  return (
    <>
      {isListening && (
        <div className='absolute top-4 right-4 flex items-center gap-1 text-xs bg-destructive text-white px-2 py-1 rounded-full z-20'>
          <Mic size={12} /> Listening
        </div>
      )}

      <div className={`group absolute z-10 top-0 left-0 flex items-center w-full h-20 p-4`}>
        <div
          className={`flex items-center gap-1 p-2 bg-black rounded-full duration-500 ${
            isListening && !showSettings ? '-translate-y-20 group-hover:translate-y-0' : 'translate-y-0'
          }`}
        >
          <Button size='icon' variant='default' asChild>
            <Link href='/'>
              <Home />
            </Link>
          </Button>
          <Button size='icon' variant={isListening ? 'destructive' : 'outline'} onClick={toggleRecording}>
            {isListening ? <MicOff /> : <Mic />}
          </Button>
          <Button
            size='icon'
            variant='default'
            onClick={() => setShowSettings(!showSettings)}
            aria-label='Configuración'
          >
            <Settings />
          </Button>

          {/*
          <Label htmlFor='from'>From</Label>
          <LanguageSelector
            label='From'
            id='from'
            value={initialSourceLanguage}
            onChange={setSourceLanguage}
          />

          <Label htmlFor='to'>To</Label>
          <LanguageSelector label='To' id='to' value={initialTargetLanguage} onChange={setTargetLanguage} />
          */}
        </div>
      </div>

      {showSettings && (
        <div className='absolute z-20 top-20 left-4 flex'>
          <div className='overflow-hidden w-80 rounded-xl'>
            <div className='px-3 py-2 bg-black/80 backdrop-blur-md border-b border-white/15 text-center'>
              <h3 className='text-white/65 font-medium'>Settings</h3>
            </div>
            <SubtitleSettings settings={subtitleSettings} onChange={setSubtitleSettings} />
          </div>
        </div>
      )}
    </>
  );
}
