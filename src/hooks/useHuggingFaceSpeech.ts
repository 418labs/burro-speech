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
  onTranslationUpdate?: (text: string | { line1: string; line2: string }) => void;
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
  const [translatedText, setTranslatedText] = useState<string | { line1: string; line2: string }>('');
  const [error, setError] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  
  // References for managing the speech recognition and recording
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevSourceLanguageRef = useRef(sourceLanguage);
  const prevTargetLanguageRef = useRef(targetLanguage);
  const lastActivityTimestampRef = useRef<number>(Date.now());
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // For subtitle approach
  const MAX_SUBTITLE_WORDS = 10; // Maximum words per subtitle line
  const recentWordsBufferRef = useRef<string[]>([]); // Buffer for transcript words
  
  // Very simple single line approach
  const currentTranslationRef = useRef<string>(''); // Current translation
  
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
      // Update timestamp for activity tracking
      lastActivityTimestampRef.current = Date.now();
      
      // Clear any existing inactivity timeout
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      
      let interimTranscript = '';
      
      // Process results - for real-time display with sliding window
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          // For final results, add to our word buffer
          const words = transcript.trim().split(/\s+/);
          words.forEach(word => {
            if (word) {
              recentWordsBufferRef.current.push(word);
            }
          });
          
          // Apply sliding window to transcript words
          if (recentWordsBufferRef.current.length > MAX_SUBTITLE_WORDS) {
            recentWordsBufferRef.current = recentWordsBufferRef.current.slice(-MAX_SUBTITLE_WORDS);
          }
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Combine words in buffer with any interim results
      let displayWords = [...recentWordsBufferRef.current];
      
      if (interimTranscript.trim()) {
        const interimWords = interimTranscript.trim().split(/\s+/);
        displayWords = displayWords.concat(interimWords);
        
        // Apply sliding window to combined words
        if (displayWords.length > MAX_SUBTITLE_WORDS) {
          displayWords = displayWords.slice(-MAX_SUBTITLE_WORDS);
        }
      }
      
      const displayText = displayWords.join(' ');
      
      // Update display with sliding window transcript
      setOriginalText(displayText);
      if (onTranscriptUpdate) onTranscriptUpdate(displayText);
      
      // Reset any existing inactivity timeout for translated text
      // Only needed if we want to keep showing translated text while speech continues
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
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
      
      // Configure the media recorder with shorter timeslice for more frequent data collection
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      audioChunksRef.current = [];
      
      // Collect data more frequently
      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // Process audio more frequently - if we have data, process it right away
          // This will make translation more real-time by processing each audio chunk as it arrives
          if (audioChunksRef.current.length > 0 && isListening) {
            processAudioChunks();
          }
        }
      };
      
      // Process chunks when recording stops
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
  
  // No need for sentence advancement in the super simple approach

  // Track when we're already processing
  const isProcessingRef = useRef(false);
  
  // Process audio chunks and send to Hugging Face for translation
  const processAudioChunks = async () => {
    // Skip if empty or already processing
    if (audioChunksRef.current.length === 0 || isProcessingRef.current) return;
    
    // Mark as processing to prevent overlapping processes
    isProcessingRef.current = true;
    
    // Create a blob from the current chunks
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    // Make a copy and clear the buffer for the next recording
    const currentAudio = audioBlob;
    audioChunksRef.current = []; 
    
    // Set translating state without waiting for response to reduce perceived lag
    setIsTranslating(true);
    
    try {
      console.log('Sending audio to Hugging Face for real-time translation');
      console.log('Current target language:', targetLanguage);
      const mappedTargetLang = mapToHFLanguageCode(targetLanguage);
      console.log('Mapped target language:', mappedTargetLang);
      
      // Don't block on this, process async
      huggingFaceService.translateSpeech(currentAudio, {
        targetLanguage: mappedTargetLang
      }).then(result => {
        console.log('Translation result:', result);
        
        if (result && result.trim()) {
          // Update the last activity timestamp
          lastActivityTimestampRef.current = Date.now();
          
          // Super Simple Approach
          const translation = result.trim();
          
          if (translation) {
            console.log("HF Received translation:", translation);
            
            // Just store the current translation
            currentTranslationRef.current = translation;
            
            // Just show it as is
            setTranslatedText(translation);
            if (onTranslationUpdate) onTranslationUpdate(translation);
            
            // Set an inactivity timeout to clear the subtitles after a pause
            if (inactivityTimeoutRef.current) {
              clearTimeout(inactivityTimeoutRef.current);
            }
            
            // Clear the subtitles after 1 second of inactivity
            inactivityTimeoutRef.current = setTimeout(() => {
              // Clear displayed text
              setTranslatedText('');
              setOriginalText('');
              if (onTranslationUpdate) onTranslationUpdate('');
              if (onTranscriptUpdate) onTranscriptUpdate('');
              
              // Reset word buffers to ensure we start fresh with next phrase
              recentWordsBufferRef.current = [];
              currentTranslationRef.current = '';
            }, 1000); // 1 second pause before clearing
          }
        }
        
        setIsTranslating(false);
        // Mark as done processing
        isProcessingRef.current = false;
      }).catch(e => {
        console.error('Translation error:', e);
        setError(`Translation error: ${e instanceof Error ? e.message : String(e)}`);
        setIsTranslating(false);
        isProcessingRef.current = false;
      });
    } catch (e) {
      console.error('Error processing audio chunks:', e);
      setError(`Processing error: ${e instanceof Error ? e.message : String(e)}`);
      setIsTranslating(false);
      isProcessingRef.current = false;
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
        
        // Start media recording with a shorter timeslice for more real-time results
        // The timeslice parameter (in ms) indicates how frequently the ondataavailable event is dispatched
        mediaRecorderRef.current.start(300); // Get data every 300ms for more frequent processing
        console.log('Media recorder started');
        
        // Set up interval as a backup mechanism to ensure we restart recording regularly
        // This helps prevent issues with very long recordings and acts as a safety mechanism
        recordingIntervalRef.current = setInterval(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            // Stop current recorder (which will trigger processing any remaining chunks)
            mediaRecorderRef.current.stop();
            
            // Start a new recording after a short delay
            setTimeout(async () => {
              if (isListening) {
                mediaRecorderRef.current = await initMediaRecorder();
                if (mediaRecorderRef.current) {
                  // Make sure to restart with the timeslice parameter for frequent ondataavailable events
                  mediaRecorderRef.current.start(300);
                }
              }
            }, 100); // Shorter delay for quicker restart
          }
        }, 1500); // Shorten the interval for more continuous translation
        
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
    
    // Clear inactivity timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
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
    
    // Set a timeout to clear the subtitles after stopping recognition
    // This replaces any existing inactivity timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    // After a few seconds, clear the subtitles for a clean slate
    inactivityTimeoutRef.current = setTimeout(() => {
      // Clear display
      setOriginalText('');
      setTranslatedText('');
      if (onTranscriptUpdate) onTranscriptUpdate('');
      if (onTranslationUpdate) onTranslationUpdate('');
      
      // Reset word buffers and processing state
      recentWordsBufferRef.current = [];
      currentTranslationRef.current = '';
      isProcessingRef.current = false;
      inactivityTimeoutRef.current = null;
    }, 1000); // Keep the final result visible for 1 second
    
    console.log('Speech recognition and recording stopped');
  }, [isListening, onTranscriptUpdate, onTranslationUpdate]);
  
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
      
      // Make extra sure all timeouts are cleared
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [autoStart, stopListening]); // Add stopListening to deps, but still omit startListening
  
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
      setSourceLanguage(lang);
      prevSourceLanguageRef.current = lang;
    },
    setTargetLanguage: (lang: string) => {
      console.log('Hugging Face: Setting target language to:', lang);
      setTargetLanguage(lang);
      prevTargetLanguageRef.current = lang;
    },
  };
};

export default useHuggingFaceSpeech;
