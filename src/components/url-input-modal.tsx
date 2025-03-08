'use client';

import type React from 'react';

import { useState } from 'react';

interface UrlInputModalProps {
  onSubmit: (url: string) => void;
}

export function UrlInputModal({ onSubmit }: UrlInputModalProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic URL validation
    if (!url) {
      setError('Por favor, ingrese una URL');
      return;
    }

    // Add https:// if not present
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = `https://${url}`;
    }

    onSubmit(processedUrl);
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md'>
        <h2 className='text-xl font-semibold mb-4'>Ingrese la URL del contenido</h2>
        <p className='text-gray-600 dark:text-gray-300 mb-4'>
          Ingrese la URL de la presentación o videollamada que desea traducir.
        </p>

        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='url' className='block text-sm font-medium mb-1'>
              URL
            </label>
            <input
              type='text'
              id='url'
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              placeholder='https://ejemplo.com'
              className='w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
            />
            {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
          </div>

          <div className='flex justify-end'>
            <button
              type='submit'
              className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors'
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
