'use client'
import { useState, useEffect, useRef, useCallback } from 'react';
import { huggingFaceService } from '@/services/huggingface';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    MediaRecorder: any;
  }
}

type UseHuggingFaceSpeechProps = {
  sourceLanguage: string;
  targetLanguage: string; // Should be in HF format (e.g., "eng" for English)
  autoStart?: boolean;
  onTranscriptUpdate?: (text: string) => void;
  onTranslationUpdate?: (text: string) => void;
}

// Map from browser language codes to Hugging Face language codes
const languageCodeMap: Record<string, string> = {
  'en-US': 'eng',
  'es-ES': 'spa',
  'fr-FR': 'fra',
  'de-DE': 'deu',
  'it-IT': 'ita',
  'pt-PT': 'por',
  'ru-RU': 'rus',
  'zh-CN': 'cmn',
  'ja-JP': 'jpn',
  'ko-KR': 'kor',
  // Add more mappings as needed
};

// For languages specified without a country code
const simpleLanguageCodeMap: Record<string, string> = {
  'en': 'eng',
  'es': 'spa',
  'fr': 'fra',
  'de': 'deu',
  'it': 'ita',
  'pt': 'por',
  'ru': 'rus',
  'zh': 'cmn',
  'ja': 'jpn',
  'ko': 'kor',
  // Add more mappings as needed
};

const mapToHFLanguageCode = (code: string): string => {
  // First try the full code
  if (languageCodeMap[code]) {
    return languageCodeMap[code];
  }
  
  // Then try just the language part
  const langPart = code.split('-')[0];
  if (simpleLanguageCodeMap[langPart]) {
    return simpleLanguageCodeMap[langPart];
  }
  
  // Default to the original code if no mapping exists
  console.warn(`No mapping found for language code: ${code}, using original code`);
  return code;
};

const useHuggingFaceSpeech = ({
  sourceLanguage = 'es-ES',
  targetLanguage = 'en',
  autoStart = false,
  onTranscriptUpdate,
  onTranslationUpdate,
}: UseHuggingFaceSpeechProps) => {
  const [isListening, setIsListening] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevSourceLanguageRef = useRef(sourceLanguage);
  
  // Initialize speech recognition for interim feedback
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      return null;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = sourceLanguage;
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      // Process results - just for real-time display
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        interimTranscript += transcript;
      }
      
      // Update display with interim results
      setOriginalText(interimTranscript);
      if (onTranscriptUpdate) onTranscriptUpdate(interimTranscript);
    };
    
    recognition.onerror = (event: any) => {
      // Don't set error for no-speech as it's common
      if (event.error !== 'no-speech') {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      console.log('Recognition ended, isListening:', isListening);
      // If we're still supposed to be listening, restart
      if (isListening) {
        try {
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              recognition.start();
            }
          }, 100);
        } catch (e) {
          console.error('Failed to restart speech recognition:', e);
        }
      }
    };
    
    return recognition;
  }, [sourceLanguage, onTranscriptUpdate, isListening]);
  
  // Initialize audio recording for sending to Hugging Face
  const initMediaRecorder = useCallback(async () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          await processAudioChunks();
        }
      };
      
      return mediaRecorder;
    } catch (e) {
      console.error('Error initializing media recorder:', e);
      setError(`Microphone access error: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    }
  }, []);
  
  // Process audio chunks and send to Hugging Face for translation
  const processAudioChunks = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = []; // Clear for next recording
    
    setIsTranslating(true);
    try {
      console.log('Sending audio to Hugging Face for translation');
      const mappedTargetLang = mapToHFLanguageCode(targetLanguage);
      console.log(`Using target language: ${mappedTargetLang}`);
      
      const result = await huggingFaceService.translateSpeech(audioBlob, {
        targetLanguage: mappedTargetLang
      });
      
      console.log('Translation result:', result);
      setTranslatedText(result);
      if (onTranslationUpdate) onTranslationUpdate(result);
    } catch (e) {
      console.error('Translation error:', e);
      setError(`Translation error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Start listening and recording
  const startListening = useCallback(async () => {
    // Don't start if already listening
    if (isListening) {
      console.log('Already listening, skipping startListening call');
      return;
    }
    
    console.log('Starting speech recognition and recording');
    setError('');
    
    // Initialize recognition for real-time feedback
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    
    // Initialize media recorder for sending to HF
    mediaRecorderRef.current = await initMediaRecorder();
    
    if (recognitionRef.current && mediaRecorderRef.current) {
      try {
        // Set isListening before starting to prevent race conditions
        setIsListening(true);
        
        // Start recognition for interim display
        recognitionRef.current.start();
        
        // Start media recording
        mediaRecorderRef.current.start();
        console.log('Media recorder started');
        
        // Set up interval to stop and restart recording every 5 seconds
        // This is to avoid sending too large audio files to HF
        recordingIntervalRef.current = setInterval(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            
            // Start a new recording after a short delay
            setTimeout(async () => {
              if (isListening) {
                mediaRecorderRef.current = await initMediaRecorder();
                if (mediaRecorderRef.current) {
                  mediaRecorderRef.current.start();
                }
              }
            }, 200);
          }
        }, 5000); // Process audio every 5 seconds
        
        console.log('Speech recognition and recording started');
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        setError(`Failed to start: ${e instanceof Error ? e.message : String(e)}`);
        setIsListening(false);
        
        // Clean up if start fails
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
      }
    }
  }, [isListening, initRecognition, initMediaRecorder]);
  
  // Stop listening and recording
  const stopListening = useCallback(() => {
    // Don't stop if not already listening
    if (!isListening) {
      console.log('Not listening, skipping stopListening call');
      return;
    }
    
    console.log('Stopping speech recognition and recording');
    
    // Set isListening to false first to prevent auto-restart
    setIsListening(false);
    
    // Clear recording interval
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping speech recognition:', e);
      }
    }
    
    // Stop media recorder and process final audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error stopping media recorder:', e);
      }
    }
    
    console.log('Speech recognition and recording stopped');
  }, [isListening]);
  
  // Auto-start if requested - only run on mount and when autoStart changes
  useEffect(() => {
    console.log('Auto-start effect running, autoStart:', autoStart);
    
    if (autoStart && !isListening) {
      // Use a timeout to avoid immediate start conflicts
      setTimeout(() => {
        startListening();
      }, 100);
    }
    
    // Cleanup function
    return () => {
      console.log('Clean up effect');
      stopListening();
    };
  }, [autoStart]); // Intentionally omit startListening and stopListening from deps
  
  // Update recognition language if sourceLanguage changes
  useEffect(() => {
    // Skip if language hasn't actually changed
    if (prevSourceLanguageRef.current === sourceLanguage) {
      return;
    }
    
    console.log('Source language changed from', prevSourceLanguageRef.current, 'to:', sourceLanguage);
    prevSourceLanguageRef.current = sourceLanguage;
    
    if (recognitionRef.current) {
      recognitionRef.current.lang = sourceLanguage;
      console.log('Updated recognition language to:', sourceLanguage);
      
      // If we're currently listening, restart to apply the new language
      if (isListening) {
        console.log('Restarting due to language change');
        stopListening();
        // Give a bit more time for cleanup before restarting
        setTimeout(() => startListening(), 500);
      }
    }
  }, [sourceLanguage, isListening, startListening, stopListening]);
  
  // Return public API - matching the useLiveTranslation API
  return {
    isListening,
    originalText,
    translatedText,
    error,
    isTranslating,
    startListening,
    stopListening,
    setSourceLanguage: (lang: string) => {
      // This is part of the useLiveTranslation API
      // Language change is handled by the effect above
      prevSourceLanguageRef.current = lang;
    },
  };
};

export default useHuggingFaceSpeech;