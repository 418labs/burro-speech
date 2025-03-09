'use client';

import { useState, useEffect } from 'react';

import { Subtitles } from '@/components/subtitles';
import { Navbar } from '@/components/navbar';
import { useSearchParams, useRouter } from 'next/navigation';

function validateLanguage(lang: string) {
  if (!lang) return false;
  const regex = /^[a-z]{2}-[A-Z]{2}$/i;
  return regex.test(lang);
}

const DEFAULT_SOURCE_LANGUAGE = 'pt-BR';

export default function TranslateOverlay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(true);
  const [subtitleSettings, setSubtitleSettings] = useState({
    fontSize: 18,
    position: 'bottom', // "top", "bottom"
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  });

  useEffect(() => {
    // This runs only on the client side
    const url = searchParams.get('url') ?? '';
    let from = searchParams.get('from') ?? navigator.language;
    let to = searchParams.get('to') ?? '';
    from = validateLanguage(from) ? from : '';
    to = validateLanguage(to) ? to : '';
    setContentUrl(url);
    setShowUrlModal(false);
    setSourceLanguage(from);
    setTargetLanguage(to);
    // Redirect if necessary params are missing
    if (!url || !to) {
      router.push('/');
    }
  }, [searchParams, router]);

  console.log('sourceLanguage', sourceLanguage);
  console.log('targetLanguage', targetLanguage);

  return (
    <div className='relative w-full h-screen flex flex-col'>
      <Navbar
        settings={subtitleSettings}
        onChange={setSubtitleSettings}
        setTranslatedText={setTranslatedText}
        setOriginalText={setOriginalText}
        initialSourceLanguage={DEFAULT_SOURCE_LANGUAGE}
        initialTargetLanguage={targetLanguage}
      />

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
        <Subtitles text={translatedText} settings={subtitleSettings} />
      </div>
    </div>
  );
}
