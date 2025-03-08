import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  console.log('Translation API called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { text, sourceLanguage, targetLanguage } = body;
    
    // Skip API call during development/testing if text is empty
    if (!text || text.trim() === '') {
      console.log('Empty text received, returning empty translation');
      return NextResponse.json({ translation: '' });
    }
    
    console.log(`Translating: "${text}" from ${sourceLanguage} to ${targetLanguage}`);
    
    // For hackathon testing purposes, we can use a simulated response to avoid
    // API key requirements or rate limiting during development
    
    // Using environment variable if available, otherwise simulate translation
    let translation = '';
    
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        console.log('Using Anthropic API with API key');
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        
        const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 50,
          temperature: 0,
          messages: [
            {
              role: "user", 
              content: `Translate the following text from ${sourceLanguage.split('-')[0]} to ${targetLanguage}. Return only the translation without any explanations or additional text: "${text}"`
            }
          ]
        });
        
        translation = response.content[0].text;
      } else {
        console.log('Using simulated translation (no API key provided)');
        // Simulate translation for hackathon testing
        // This is just a very basic simulation - replace with real API in production
        
        // Wait a bit to simulate network request
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simple test translations
        if (sourceLanguage.startsWith('es') && targetLanguage === 'en') {
          // Spanish to English
          if (text.toLowerCase().includes('hola')) translation = text.replace(/hola/i, 'hello');
          else if (text.toLowerCase().includes('gracias')) translation = text.replace(/gracias/i, 'thank you');
          else if (text.toLowerCase().includes('buenos días')) translation = text.replace(/buenos días/i, 'good morning');
          else if (text.toLowerCase().includes('cómo estás')) translation = text.replace(/cómo estás/i, 'how are you');
          else translation = `[Translation of: ${text}]`;
        } else if (sourceLanguage.startsWith('fr') && targetLanguage === 'en') {
          // French to English
          if (text.toLowerCase().includes('bonjour')) translation = text.replace(/bonjour/i, 'hello');
          else if (text.toLowerCase().includes('merci')) translation = text.replace(/merci/i, 'thank you');
          else translation = `[Translation of: ${text}]`;
        } else {
          // Default simulated translation
          translation = `[Translation from ${sourceLanguage} to ${targetLanguage}: ${text}]`;
        }
      }
    } catch (apiError: any) {
      console.error('API error:', apiError);
      translation = `[Translation error: ${apiError.message}]`;
    }
    
    console.log(`Translation result: "${translation}"`);
    
    return NextResponse.json({ translation });
  } catch (error: any) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to translate text', message: error.message },
      { status: 500 }
    );
  }
}

