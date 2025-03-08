'use client';

import { useState } from 'react';

import { UrlInputModal } from '@/components/url-input-modal';
import { Subtitles } from '@/components/subtitles';
import { useTranslation } from '@/hooks/use-translation';
import { Navbar } from '@/components/navbar';

export default function Page() {
  const [contentUrl, setContentUrl] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(true);

  const { translatedText, subtitleSettings } = useTranslation();

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

        {/* Subtitles overlay */}
        <Subtitles text={translatedText} settings={subtitleSettings} />
      </div>
    </div>
  );
}
