import { useState } from 'react';
import { Mic, MicOff, Settings, X } from 'lucide-react';

import { LanguageSelector } from './language-selector';
import { SubtitleSettings } from './subtitle-settings';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from './ui/button';

export function Navbar() {
  const [showSettings, setShowSettings] = useState(false);

  const { isRecording, translationOptions, subtitleSettings, toggleRecording, setTargetLanguage, setSubtitleSettings } =
    useTranslation();

  return (
    <>
      <div className='absolute z-10 right-4 flex items-center justify-center h-full'>
        <div className='flex flex-col items-center gap-2 p-4 bg-white shadow-xl border rounded-xl'>
          <Button size='lg' variant={isRecording ? 'destructive' : 'default'} onClick={toggleRecording}>
            {isRecording ? <MicOff /> : <Mic />}
            {/* <span>{isRecording ? 'Detener' : 'Comenzar ahora'}</span> */}
          </Button>

          <Button size='lg' variant='outline' onClick={() => setShowSettings(!showSettings)} aria-label='Configuración'>
            <Settings />
          </Button>

          <LanguageSelector
            value={translationOptions.targetLanguage}
            onChange={(e: any) => setTargetLanguage(e.target.value)}
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
