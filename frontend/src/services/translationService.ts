import { TranslationRequest, TranslationResponse, Translation } from '../types/storytelling';
import { api } from './api';

export class TranslationService {
  static async translateStory(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      const response = await api.post('/storytelling/translate', {
        text: request.text,
        sourceLanguage: request.sourceLanguage,
        targetLanguages: request.targetLanguages
      });

      const result = response.data;

      // Normalize to expected TranslationResponse
      const translations: Translation[] = (result.data?.translations || []).map((t: any) => ({
        id: t.id || `temp-${Date.now()}`,
        storyId: t.storyId || '',
        language: t.language,
        languageName: t.languageName || t.language,
        translatedText: t.translatedText,
        confidence: typeof t.confidence === 'number' ? t.confidence : 0.9,
        createdAt: t.createdAt ? new Date(t.createdAt) : new Date()
      }));

      return { success: true, translations } as TranslationResponse;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Translation failed';
      console.error('Translation error:', message);
      return { success: false, translations: [], error: message };
    }
  }

  static async detectLanguage(text: string): Promise<string> {
    try {
      const response = await api.post('/storytelling/detect-language', { text });
      const result = response.data;
      return result.data?.language || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }

  static async getTranslationQuota(): Promise<{ used: number; limit: number }> {
    try {
      const response = await api.get('/storytelling/utils/translation-quota');
      const result = response.data;
      return result.data || { used: 0, limit: 1000 };
    } catch (error) {
      console.error('Error getting translation quota:', error);
      return { used: 0, limit: 1000 };
    }
  }

  static async saveTranslations(storyId: string, translations: Translation[]): Promise<void> {
    try {
      await api.post(`/storytelling/${storyId}/translations`, { translations });
    } catch (error) {
      console.error('Error saving translations:', error);
      throw error;
    }
  }

  static validateText(text: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!text || text.trim().length === 0) errors.push('Text cannot be empty');
    if (text.length > 10000) errors.push('Text is too long (maximum 10,000 characters)');
    if (text.length < 10) errors.push('Text is too short (minimum 10 characters)');
    return { isValid: errors.length === 0, errors };
  }
}