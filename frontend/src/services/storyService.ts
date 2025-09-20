// frontend/src/services/storyService.ts
import { api } from './api';

export interface SaveStoryPayload {
  title: string;
  originalText: string;
  originalLanguage: string;
  inputType: 'voice' | 'text';
  tags: string[];
  isPublic: boolean;
  translations: Array<{
    language: string;
    languageName: string;
    translatedText: string;
    confidence: number;
  }>;
  audioUrl?: string;
}

export const StoryService = {
  async saveStory(payload: SaveStoryPayload) {
    const response = await api.post('/storytelling', payload);
    return response.data;
  },

  async getMyStories(params?: { page?: number; limit?: number; includePrivate?: boolean }) {
    const response = await api.get('/storytelling/my-stories', { params });
    return response.data;
  }
};
