'use client'
import { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

type UseLiveTranslationProps = {
  initialSourceLanguage: string;
  initialTargetLanguage: string;
  autoStart?: boolean;
  onTranscriptUpdate?: (text: string) => void;
  onTranslationUpdate?: (text: string) => void;
}

const useLiveTranslation = ({
  autoStart = false,
  initialSourceLanguage,
  initialTargetLanguage,
  onTranscriptUpdate,
  onTranslationUpdate,
}: UseLiveTranslationProps) => {
  const [isListening, setIsListening] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [error, setError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState(initialSourceLanguage);
  const [targetLanguage, setTargetLanguage] = useState(initialTargetLanguage);
  
  // References for managing subtitle content
  const recognitionRef = useRef<any>(null);
  const translationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastResultTimestampRef = useRef<number>(Date.now());
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subtituleDisplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Line-by-line approach
  const currentLineRef = useRef<string>(''); // Current visible line
  const currentTranslationRef = useRef<string>(''); // Current complete translation
  
  // Initialize speech recognition
  // Keep track of transcript buffers 
  const finalTranscriptRef = useRef<string>('');
  const recentWordsBufferRef = useRef<string[]>([]); // Buffer of recent words

  const callTranslationAPI = useCallback((text: string) => {
    console.log('Making API call with:', { text, sourceLanguage, targetLanguage });
    return fetch('/api/translate', {
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
  }, [sourceLanguage, targetLanguage]);

  // Translate text using the API with queue-based subtitle approach
  const translateText = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    console.log('Starting translation API call for:', text);
    setIsTranslating(true);
    try {
      const response = await callTranslationAPI(text);
      
      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Translation received:', data.translation);
      
      const translation = data.translation.trim();
      
      if (translation) {
        console.log("Received translation:", translation);
        
        // Store the current translation
        currentTranslationRef.current = translation;
        currentLineRef.current = translation;
        
        // Just update with the current line - keep it simple
        setTranslatedText(currentLineRef.current);
        if (onTranslationUpdate) onTranslationUpdate(currentLineRef.current);
        
        // Update the last activity timestamp
        lastResultTimestampRef.current = Date.now();
        
        // Set an inactivity timeout to clear the subtitles after a pause
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        if (subtituleDisplayTimeoutRef.current) {
          clearTimeout(subtituleDisplayTimeoutRef.current);
        }
        
        inactivityTimeoutRef.current = setTimeout(() => {
          // Clear displayed text
          setOriginalText('');
          if (onTranscriptUpdate) onTranscriptUpdate('');
          
          // Reset word buffers to ensure we start fresh with next phrase
          recentWordsBufferRef.current = [];
          finalTranscriptRef.current = '';
        }, 250);
        subtituleDisplayTimeoutRef.current = setTimeout(() => {
          // Display the current line
          setTranslatedText('');
          if (onTranslationUpdate) onTranslationUpdate('');
          currentTranslationRef.current = '';
          currentLineRef.current = '';
        }, 3000);
      }
    } catch (e: any) {
      console.error('Translation error:', e);
      setError(`Translation error: ${e.message}`);
    } finally {
      setIsTranslating(false);
    }
  }, [callTranslationAPI]);
  
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
    recognition.lang = sourceLanguage
    
    // Use a local variable to track current results session
    let currentSession = {
      finalTranscript: '',
      interimTranscript: ''
    };
    
    recognition.onresult = async (event: any) => {
      // Update timestamp to track active speaking
      lastResultTimestampRef.current = Date.now();
      
      // Cancel any pending inactivity timeout
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (subtituleDisplayTimeoutRef.current) {
        clearTimeout(subtituleDisplayTimeoutRef.current);
      }
      
      let interimTranscript = '';
      let hasNewFinalResult = false;
      
      // Process results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // For final results, add to the buffer
          const newWords = transcript.trim().split(/\s+/);
          
          // Add new words to our buffer
          newWords.forEach((word: string) => {
            if (word) {
              recentWordsBufferRef.current.push(word);
            }
          });
          
          
          currentSession.finalTranscript = recentWordsBufferRef.current.join(' '); 
          finalTranscriptRef.current = currentSession.finalTranscript;
          hasNewFinalResult = true;
          
          // Clear interim since we've incorporated these words as final
          currentSession.interimTranscript = '';
        } else {
          interimTranscript += transcript;
          currentSession.interimTranscript = interimTranscript;
        }
      }
      
      // Combine final words with any interim results for display
      const finalWords = recentWordsBufferRef.current;
      
      console.log('Final words:', finalWords);
      console.log('Interim words:', currentSession.interimTranscript);

      let displayWords = [...finalWords];
      if (currentSession.interimTranscript) {
        const interimWords = currentSession.interimTranscript.trim().split(/\s+/);
        displayWords = displayWords.concat(interimWords);
      }
      
      const displayText = displayWords.join(' ');
      
      setOriginalText(displayText);
      if (onTranscriptUpdate) onTranscriptUpdate(displayText);
      
      // Translate in real-time using the sliding window text
      if (translationTimeoutRef.current) {
        clearTimeout(translationTimeoutRef.current);
      }
      
      // Use a shorter debounce time for real-time translation
      translationTimeoutRef.current = setTimeout(async () => {
        // Translate our sliding window text (only the most recent words)
        const textToTranslate = displayText.trim();
        if (textToTranslate) {
          console.log('Translating sliding window text:', textToTranslate);
          await translateText(textToTranslate);
        }
      }, 250); // Shorter timeout for more responsive translations
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
  }, [sourceLanguage, onTranscriptUpdate, translateText]);

  // Start listening
  const startListening = useCallback(() => {
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
  }, [initRecognition]);
  
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
    
    // Clear any pending timeouts
    if (translationTimeoutRef.current) {
      clearTimeout(translationTimeoutRef.current);
    }
    
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    if (subtituleDisplayTimeoutRef.current) {
      clearTimeout(subtituleDisplayTimeoutRef.current);
    }
    
    // Do one final translation with the complete transcript
    const finalText = originalText.trim();
    if (finalText) {
      console.log('Doing final translation after stopping');
      translateText(finalText);
      
      // Clear any existing inactivity timeout
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (subtituleDisplayTimeoutRef.current) {
        clearTimeout(subtituleDisplayTimeoutRef.current);
      }
      
      // After a short delay, clear the subtitles when stopping
      inactivityTimeoutRef.current = setTimeout(() => {
        setOriginalText('');
        setTranslatedText('');
        if (onTranscriptUpdate) onTranscriptUpdate('');
        if (onTranslationUpdate) onTranslationUpdate('');
        
        // Reset all translation references
        currentTranslationRef.current = '';
        currentLineRef.current = '';
        inactivityTimeoutRef.current = null;
      }, 250);
    } else {
      // Clear immediately if there's no text
      setOriginalText('');
      setTranslatedText('');
      if (onTranscriptUpdate) onTranscriptUpdate('');
      if (onTranslationUpdate) onTranslationUpdate('');
      
      // Reset all translation references
      currentTranslationRef.current = '';
      currentLineRef.current = '';
    }
    
    // Reset all references
    finalTranscriptRef.current = '';
    recentWordsBufferRef.current = [];
  }, [isListening, translateText]);
  
  // Auto-start if requested - only run on mount and when autoStart changes
  useEffect(() => {
    console.log('Auto-start effect running, autoStart:', autoStart);
    let isMounted = true;
    
    if (autoStart && !isListening) {
      // Use a timeout to avoid immediate start conflicts
      setTimeout(() => {
        if (isMounted) {
          startListening();
        }
      }, 100);
    }
    return () => {
      isMounted = false;
    };
  }, [autoStart, startListening]);
  
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
      setSourceLanguage(lang);
    },
    setTargetLanguage,
  };
};

export default useLiveTranslation;
