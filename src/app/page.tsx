'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Metadata } from 'next';
import { Mic, MicOff, Settings, X, SwitchCamera } from 'lucide-react';

import { UrlInputModal } from '@/components/url-input-modal';
import { Subtitles } from '@/components/subtitles';
import { Navbar } from '@/components/navbar';


import { SubtitleSettings } from '@/components/subtitle-settings';
import useLiveTranslation from '@/hooks/useLiveTranslation';
import useHuggingFaceSpeech from '@/hooks/useHuggingFaceSpeech';
import { LanguageSelector } from '@/components/language-selector';

import { siteConfig } from '@/config/site';

export default function Page() {
  const [showSettings, setShowSettings] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('es-ES');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [contentUrl, setContentUrl] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(true);
  const [useHuggingFace, setUseHuggingFace] = useState(false);
  const [subtitleSettings, setSubtitleSettings] = useState({
    fontSize: 18,
    position: 'bottom', // "top", "bottom"
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  });

  // Setup live translation with Next.js API route
  const liveTranslation = useLiveTranslation({
    sourceLanguage,
    targetLanguage,
    autoStart: false,
  });

  // Setup Hugging Face translation
  const huggingFaceTranslation = useHuggingFaceSpeech({
    sourceLanguage,
    targetLanguage,
    autoStart: false,
  });

  // Get the active translation service based on toggle
  const {
    isListening,
    translatedText,
    originalText,
    error,
    startListening,
    stopListening,
  } = useHuggingFace ? huggingFaceTranslation : liveTranslation;

  // Toggle translation service
  const toggleService = useCallback(() => {
    // Stop the current service before switching
    if (isListening) {
      stopListening();
    }
    setUseHuggingFace(prev => !prev);
  }, [isListening, stopListening]);

  // Toggle recording function
  const toggleRecording = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const handleUrlSubmit = (url: string) => {
    setContentUrl(url);
    setShowUrlModal(false);
  };

  return (
    <div className='relative w-full h-screen flex flex-col'>
      {/* URL Input Modal */}
      {showUrlModal && <UrlInputModal onSubmit={handleUrlSubmit} />}

      <Navbar />

      {/* Main content area (iframe with the provided URL) */}
      <div className='flex-1 relative w-full h-full'>
        {contentUrl ? (
          <iframe
            src={contentUrl}
            className='w-full h-full border-0'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-500'>
            <p className='text-xl'>Ingrese una URL para mostrar el contenido</p>
          </div>
        )}

        {/* Floating control bar at the top */}
        <div className='absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg px-4 py-2 flex items-center gap-4 z-10'>
          <button
            onClick={toggleRecording}
            className={`rounded-full p-2 ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
            } text-white transition-colors flex items-center gap-2`}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            <span>{isListening ? 'Detener' : 'Comenzar ahora'}</span>
          </button>

          <button
            onClick={toggleService}
            className={`rounded-full p-2 ${
              useHuggingFace ? 'bg-purple-500 hover:bg-purple-600' : 'bg-blue-500 hover:bg-blue-600'
            } text-white transition-colors flex items-center gap-2`}
            title={useHuggingFace ? 'Using Hugging Face AI (click to switch to API)' : 'Using standard API (click to switch to Hugging Face)'}
          >
            <SwitchCamera size={18} />
            <span className="text-xs whitespace-nowrap">{useHuggingFace ? 'Hugging Face' : 'API Translation'}</span>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'
            aria-label='Configuración'
          >
            <Settings size={20} />
          </button>

          <div className='flex gap-2'>
            <div className='w-[140px]'>
              <label className="block text-xs mb-1 text-gray-500">From</label>
              <select
                value={sourceLanguage}
                onChange={(e) => {
                  setSourceLanguage(e.target.value);
                  // If actively listening, we need to stop and restart to apply the new language
                  if (isListening) {
                    stopListening();
                    setTimeout(() => startListening(), 300);
                  }
                }}
                className='appearance-none w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
              >
                <option value="es-ES">Español</option>
                <option value="en-US">English</option>
                <option value="fr-FR">Français</option>
              </select>
            </div>
            
            <div className='w-[140px]'>
              <label className="block text-xs mb-1 text-gray-500">To</label>
              <LanguageSelector value={targetLanguage} onChange={(lang) => {
                setTargetLanguage(lang);
                // If actively listening, we need to stop and restart to apply the new language
                if (isListening) {
                  stopListening();
                  setTimeout(() => startListening(), 300);
                }
              }} />
            </div>
          </div>
        </div>

        {/* Original text display (top) */}
        {originalText && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/70 text-white px-4 py-2 rounded shadow-lg z-10 mt-16 max-w-[90%] text-center">
            <div className="text-xs uppercase tracking-wider mb-1 opacity-70">Original</div>
            {originalText}
          </div>
        )}
        
        {/* Translated subtitles (bottom) */}
        <Subtitles text={translatedText} settings={subtitleSettings} />
        
        {/* Service indicator */}
        <div className="absolute bottom-4 right-4 text-xs bg-black/40 text-white px-3 py-1 rounded-full z-20">
          {useHuggingFace ? '🤖 Hugging Face' : '🌐 API Translation'}
        </div>
        
        {/* Error message if translation fails */}
        {error && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-20">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
