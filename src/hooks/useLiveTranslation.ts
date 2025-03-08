'use client'
import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type UseLiveTranslationProps = {
  sourceLanguage: string;
  targetLanguage: string;
  autoStart?: boolean;
  onTranscriptUpdate?: (text: string) => void;
  onTranslationUpdate?: (text: string) => void;
}

const useLiveTranslation = ({
  sourceLanguage = 'es-ES',
  targetLanguage = 'en',
  autoStart = false,
  onTranscriptUpdate,
  onTranslationUpdate,
}: UseLiveTranslationProps) => {
  const [isListening, setIsListening] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize speech recognition
  // Keep track of final transcript outside of the recognition callback
  const finalTranscriptRef = useRef<string>('');
  
  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser');
      return null;
    }
    
    // Reset the transcript when creating a new recognition instance
    finalTranscriptRef.current = '';
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = sourceLanguage;
    
    // Use a local variable to track current results session
    let currentSession = {
      finalTranscript: '',
      interimTranscript: ''
    };
    
    recognition.onresult = async (event: any) => {
      let interimTranscript = '';
      let hasNewFinalResult = false;
      
      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          currentSession.finalTranscript += transcript + ' ';
          finalTranscriptRef.current = currentSession.finalTranscript;
          hasNewFinalResult = true;
        } else {
          interimTranscript += transcript;
          currentSession.interimTranscript = interimTranscript;
        }
      }
      
      // Use final transcript for translation, show interim for immediate feedback
      const displayText = currentSession.finalTranscript + currentSession.interimTranscript;
      console.log('Display text:', displayText);
      setOriginalText(displayText);
      if (onTranscriptUpdate) onTranscriptUpdate(displayText);
      
      // Only translate when we have new final results
      if (hasNewFinalResult && currentSession.finalTranscript.trim()) {
        // Debounce translation to avoid too many API calls
        if (translationTimeoutRef.current) {
          clearTimeout(translationTimeoutRef.current);
        }
        
        translationTimeoutRef.current = setTimeout(async () => {
          const textToTranslate = currentSession.finalTranscript.trim();
          console.log('Translating:', textToTranslate);
          await translateText(textToTranslate);
        }, 1000);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      // Don't set error for 'no-speech' as it's common and not a real error
      if (event.error !== 'no-speech') {
        setError(`Speech recognition error: ${event.error}`);
      }
    };
    
    recognition.onend = () => {
      console.log('Recognition ended, isListening:', isListening);
      // If we're still supposed to be listening, restart recognition
      if (isListening) {
        try {
          // Small delay to prevent rapid restarts
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              console.log('Restarting recognition');
              recognition.start();
            }
          }, 100);
        } catch (e) {
          console.error('Failed to restart speech recognition:', e);
          setError('Failed to restart speech recognition');
          setIsListening(false);
        }
      }
    };
    
    return recognition;
  }, [sourceLanguage, onTranscriptUpdate]);
  
  // Translate text using the API
  const translateText = async (text: string) => {
    if (!text.trim()) return;
    
    console.log('Starting translation API call for:', text);
    setIsTranslating(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sourceLanguage,
          targetLanguage,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Translation received:', data.translation);
      setTranslatedText(data.translation);
      if (onTranslationUpdate) onTranslationUpdate(data.translation);
    } catch (e: any) {
      console.error('Translation error:', e);
      setError(`Translation error: ${e.message}`);
    } finally {
      setIsTranslating(false);
    }
  };
  
  // Start listening
  const startListening = useCallback(() => {
    // Don't start if already listening
    if (isListening) {
      console.log('Already listening, skipping startListening call');
      return;
    }
    
    console.log('Starting speech recognition');
    setError('');
    
    // Create the recognition instance if it doesn't exist
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
    }
    
    if (recognitionRef.current) {
      try {
        // Set isListening before starting to prevent race conditions
        setIsListening(true);
        recognitionRef.current.start();
        console.log('Speech recognition started');
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        setError('Failed to start speech recognition');
        setIsListening(false);
      }
    }
  }, [isListening, initRecognition]);
  
  // Stop listening
  const stopListening = useCallback(() => {
    // Don't stop if not already listening
    if (!isListening) {
      console.log('Not listening, skipping stopListening call');
      return;
    }
    
    console.log('Stopping speech recognition');
    
    // Set isListening to false first to prevent auto-restart
    setIsListening(false);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('Speech recognition stopped');
      } catch (e) {
        console.error('Error stopping speech recognition:', e);
      }
    }
    
    // Clear any pending translation requests
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }
    
    // Translate any remaining text
    if (finalTranscriptRef.current && finalTranscriptRef.current.trim()) {
      console.log('Translating remaining text after stopping');
      translateText(finalTranscriptRef.current.trim());
      // Reset transcript after final translation
      finalTranscriptRef.current = '';
    }
  }, [isListening, translateText]);
  
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error('Error cleaning up speech recognition:', e);
        }
      }
      
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
    };
  }, [autoStart]); // Remove startListening from deps
  
  // Track language changes to avoid unnecessary rerenders
  const prevSourceLanguageRef = useRef(sourceLanguage);

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
        console.log('Restarting recognition due to language change');
        
        // Manually stop and restart without triggering state changes
        try {
          if (recognitionRef.current) {
            recognitionRef.current.stop();
            
            // Create new recognition instance with updated language
            setTimeout(() => {
              recognitionRef.current = initRecognition();
              if (recognitionRef.current) {
                recognitionRef.current.start();
              }
            }, 300);
          }
        } catch (e) {
          console.error('Error restarting recognition:', e);
        }
      }
    }
  }, [sourceLanguage, isListening, initRecognition]);

  // Return public API
  return {
    isListening,
    originalText,
    translatedText,
    error,
    isTranslating,
    startListening,
    stopListening,
    setSourceLanguage: (lang: string) => {
      if (recognitionRef.current) {
        recognitionRef.current.lang = lang;
      }
    },
  };
};

export default useLiveTranslation;
