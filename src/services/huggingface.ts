const HF_API_TOKEN = process.env.NEXT_PUBLIC_HF_API_TOKEN;
const API_URL = 'https://api-inference.huggingface.co/models/facebook/seamless-m4t-v2-large';

interface TranslationOptions {
  targetLanguage: string; // Target language code (e.g., "spa" for Spanish, "eng" for English)
}

class HuggingFaceService {
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Remove the prefix "data:audio/xxx;base64," to get only the data
        const base64 = base64data.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async translateSpeech(audioBlob: Blob, options: TranslationOptions): Promise<string> {
    try {
      // Following the Hugging Face documentation for Seamless M4T v2
      const headers = {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
        'x-wait-for-model': 'true',
      };

      // First convert the blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);

      // For Seamless M4T v2, we need a simpler approach - directly sending audio data
      // with the target language specified in the query parameters
      const params = {
        inputs: base64Audio,
      };

      console.log(`Sending request to HF API with target language: ${options.targetLanguage}`);

      // Add the target language as a query parameter
      const urlWithParams = `${API_URL}?task=speech-to-text-translation&tgt_lang=${options.targetLanguage}`;
      console.log(`Using URL: ${urlWithParams}`);
      
      const response = await fetch(urlWithParams, {
        method: 'POST',
        headers,
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error from Hugging Face API: ${errorText}`);
      }

      const result = await response.json();
      console.log("Translation API response:", result);
      
      // The API returns an object with the translation in either 'text' or 'generated_text' property
      return result.text || result.generated_text || '';
    } catch (error) {
      console.error('Error translating speech:', error);
      throw error;
    }
  }

  // Method for direct text-to-text translation if needed in the future
  async translateText(text: string, options: TranslationOptions): Promise<string> {
    try {
      const headers = {
        'Authorization': `Bearer ${HF_API_TOKEN}`,
        'Content-Type': 'application/json',
      };

      const params = JSON.stringify({
        model: "facebook/seamless-m4t-v2-large",
        task: "text-to-text-translation",
        inputs: text,
        parameters: {
          tgt_lang: options.targetLanguage,
        }
      });

      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers,
        body: params
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error from Hugging Face API: ${errorText}`);
      }

      const result = await response.json();
      return result.text || result.generated_text || '';
    } catch (error) {
      console.error('Error translating text:', error);
      throw error;
    }
  }
}


export const  huggingFaceService = new HuggingFaceService();
