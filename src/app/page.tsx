'use client';

import { useEffect, useState } from 'react';
import type { Metadata } from 'next';
import { Mic, MicOff, Settings, X } from 'lucide-react';

import { UrlInputModal } from '@/components/url-input-modal';
import { LanguageSelector } from '@/components/language-selector';
import { Subtitles } from '@/components/subtitles';
import { SubtitleSettings } from '@/components/subtitle-settings';

import { siteConfig } from '@/config/site';

export default function Page() {
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [subtitleText, setSubtitleText] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(true);
  const [subtitleSettings, setSubtitleSettings] = useState({
    fontSize: 18,
    position: 'bottom', // "top", "bottom"
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  });

  // Simulated audio capture and translation
  useEffect(() => {
    if (!isRecording) {
      setSubtitleText('');
      return;
    }

    // Simulate receiving translated text
    const translations = [
      'Bienvenidos a esta presentación sobre inteligencia artificial.',
      'La traducción en tiempo real facilita la comunicación global.',
      'Este sistema utiliza reconocimiento de voz y traducción automática.',
      'Puede personalizar la apariencia de los subtítulos según sus preferencias.',
    ];

    let index = 0;
    const interval = setInterval(() => {
      setSubtitleText(translations[index % translations.length]);
      index++;
    }, 3000);

    return () => clearInterval(interval);
  }, [isRecording, targetLanguage]);

  // Request microphone permission
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // In a real app, you would process the audio stream here
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('No se pudo acceder al micrófono. Por favor, conceda permisos.');
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleUrlSubmit = (url: string) => {
    setContentUrl(url);
    setShowUrlModal(false);
  };

  return (
    <div className='relative w-full h-screen flex flex-col'>
      {/* URL Input Modal */}
      {showUrlModal && <UrlInputModal onSubmit={handleUrlSubmit} />}

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
            <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} />
          </div>
        </div>

        {/* Subtitles overlay */}
        <Subtitles text={subtitleText} settings={subtitleSettings} />
      </div>

      {/* Settings panel */}
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
    </div>
  );
}
