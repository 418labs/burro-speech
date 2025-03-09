import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  console.log('Translation API called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { text, sourceLanguage, targetLanguage } = body;
    
    if (!text || text.trim() === '') {
      console.log('Empty text received, returning empty translation');
      return NextResponse.json({ translation: '' });
    }
    
    console.log(`Translating: "${text}" from ${sourceLanguage} to ${targetLanguage} (Target language code: ${targetLanguage})`);
    
    let translation = '';
    
    try {
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
            content: `Take the text between tags and translate it from ${sourceLanguage} to ${targetLanguage}. Return only the translation without any explanations or additional text: <text>${text}</text>`
          }
        ]
      });
      
      translation = (response.content[0] as any).text;
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

