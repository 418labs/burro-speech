const HF_API_TOKEN = process.env.NEXT_PUBLIC_HF_API_TOKEN;
const API_URL = 'https://router.huggingface.co/hf-inference/models/facebook/seamless-m4t-v2-large';

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

      // Prepare parameters for the model
      const params = JSON.stringify({
        model: "facebook/seamless-m4t-v2-large",
        task: "automatic-speech-recognition",  // Use ASR task for the API
        inputs: base64Audio,
        parameters: {
          // No need to specify source language (it's automatically detected)
          //tgt_lang: options.targetLanguage,
          // Setting to get only text (not audio)
          //generateSpeech: false
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
      // The API returns an object with the transcription in either 'text' or 'generated_text' property
      return result.text || result.generated_text || '';
    } catch (error) {
      console.error('Error translating speech:', error);
      throw error;
    }
  }
}


export const huggingFaceService = new HuggingFaceService();
