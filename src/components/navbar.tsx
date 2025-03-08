import { useState } from 'react';
import { Mic, MicOff, Settings, X } from 'lucide-react';

import { LanguageSelector } from './language-selector';
import { SubtitleSettings } from './subtitle-settings';
import { useTranslation } from '@/hooks/use-translation';

export function Navbar() {
  const [showSettings, setShowSettings] = useState(false);

  const { isRecording, translationOptions, subtitleSettings, toggleRecording, setTargetLanguage, setSubtitleSettings } =
    useTranslation();

  return (
    <>
      <div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg px-4 py-2 flex items-center gap-4 z-10'>
        <button
          onClick={toggleRecording}
          className={`rounded-full p-2 ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
          } text-white transition-colors flex items-center gap-2`}
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          <span>{isRecording ? 'Detener' : 'Comenzar ahora'}</span>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
          aria-label='Configuración'
        >
          <Settings size={20} />
        </button>

        <div className='w-[140px]'>
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
