import { useState, useCallback, useEffect } from 'react';
import { Mic, MicOff, Settings, X } from 'lucide-react';

import { LanguageSelector } from './language-selector';
import { SubtitleSettings } from './subtitle-settings';
import { Button } from './ui/button';
import useLiveTranslation from '@/hooks/useLiveTranslation';
import { SubtitleSettingsProps } from './subtitle-settings';

type NavbarProps ={
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
    autoStart: false,
  });

  const {
    isListening,
    originalText,
    translatedText,
    startListening,
    stopListening,
    setSourceLanguage,
    setTargetLanguage,
  } =  liveTranslation;

  useEffect(() => {
      setOriginalText(originalText);
  }, [ originalText]);

  useEffect(() => {
      setTranslatedText(translatedText);
  }, [ translatedText]);
 
  // Toggle recording function
  const toggleRecording = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <>
      <div className='absolute z-10 right-4 flex items-center justify-center h-full'>
        <div className='flex flex-col items-center gap-2 p-4 bg-white shadow-xl border rounded-xl'>
          <Button size='lg' variant={isListening ? 'destructive' : 'default'} onClick={toggleRecording}>
            {isListening ? <MicOff /> : <Mic />}
          </Button>

          <Button size='lg' variant='outline' onClick={() => setShowSettings(!showSettings)} aria-label='Configuración'>
            <Settings />
          </Button>

          <LanguageSelector
            value={initialSourceLanguage}
            onChange={setSourceLanguage}
          />

          <LanguageSelector
            value={initialTargetLanguage}
            onChange={setTargetLanguage}
          />
        </div>
      </div>

      {showSettings && (
        <div className='absolute right-4 top-20 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4 m-4 w-80 z-20'>
          <div className='flex justify-between items-center mb-4'>
            <h3 className='font-medium'>Configuración de subtítulos</h3>
            <button
              onClick={() => setShowSettings(false)}
              className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            >
              <X size={20} />
            </button>
          </div>
          <SubtitleSettings settings={subtitleSettings} onChange={setSubtitleSettings} />
        </div>
      )}
    </>
  );
}
