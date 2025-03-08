'use client';

import { useState, useEffect, useCallback } from 'react';

// Tipos para las configuraciones
export interface SubtitleSettings {
  fontSize: number;
  position: 'top' | 'bottom';
  textColor: string;
  backgroundColor: string;
}

export interface TranslationOptions {
  sourceLanguage: string;
  targetLanguage: string;
}

// Lista de idiomas disponibles
export const availableLanguages = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'Inglés' },
  { code: 'pt', name: 'Portugués' },
];

// Hook principal
export function useTranslation() {
  // Estado de grabación
  const [isRecording, setIsRecording] = useState(false);

  // Estado para el texto traducido
  const [translatedText, setTranslatedText] = useState('');

  // Estado para la configuración de idiomas
  const [translationOptions, setTranslationOptions] = useState<TranslationOptions>({
    sourceLanguage: 'en',
    targetLanguage: 'es',
  });

  // Estado para la configuración de subtítulos
  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>({
    fontSize: 18,
    position: 'bottom',
    textColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  });

  // Función para iniciar la grabación
  const startRecording = useCallback(async () => {
    try {
      // Solicitar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // En una implementación real, aquí se procesaría el audio
      // y se enviaría a un servicio de reconocimiento de voz

      setIsRecording(true);
      return true;
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      return false;
    }
  }, []);

  // Función para detener la grabación
  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setTranslatedText('');
  }, []);

  // Función para alternar el estado de grabación
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording();
      return true;
    } else {
      return await startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  // Función para cambiar el idioma de destino
  const setTargetLanguage = useCallback((languageCode: string) => {
    setTranslationOptions((prev) => ({
      ...prev,
      targetLanguage: languageCode,
    }));
  }, []);

  // Función para cambiar el idioma de origen
  const setSourceLanguage = useCallback((languageCode: string) => {
    setTranslationOptions((prev) => ({
      ...prev,
      sourceLanguage: languageCode,
    }));
  }, []);

  // Función para actualizar la configuración de subtítulos
  const updateSubtitleSettings = useCallback((settings: Partial<SubtitleSettings>) => {
    setSubtitleSettings((prev) => ({
      ...prev,
      ...settings,
    }));
  }, []);

  // Simulación de traducción en tiempo real
  useEffect(() => {
    if (!isRecording) {
      setTranslatedText('');
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
      setTranslatedText(translations[index % translations.length]);
      index++;
    }, 3000);

    return () => clearInterval(interval);
  }, [isRecording, translationOptions.targetLanguage]);

  console.log('translatedText', translatedText);

  // Devolver todos los estados y funciones necesarios
  return {
    // Estados
    isRecording,
    translatedText,
    translationOptions,
    subtitleSettings,

    // Funciones para controlar la grabación
    startRecording,
    stopRecording,
    toggleRecording,

    // Funciones para configurar idiomas
    setTargetLanguage,
    setSourceLanguage,
    setSubtitleSettings,

    // Función para actualizar configuración de subtítulos
    updateSubtitleSettings,

    // Lista de idiomas disponibles
    availableLanguages,
  };
}
