import React, { useState, useEffect } from 'react';
import { Mic, Type, Globe, Save, Share2, BookOpen } from 'lucide-react';
import { VoiceRecorder } from './VoiceRecorder';
import { TextInput } from './TextInput';
import { LanguageSelector } from './LanguageSelector';
import { TranslationResults } from './TranslationResults';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslationService } from '../../services/translationService';
import { StoryFormData } from '../../types/storytelling';
import { CRAFT_TAGS } from '../../utils/languageConstants';
import { StoryService } from '../../services/storyService';

export const StorytellingDashboard: React.FC = () => {
  const [activeInputType, setActiveInputType] = useState<'voice' | 'text'>('voice');
  const [storyData, setStoryData] = useState<StoryFormData>({
    title: '',
    content: '',
    inputType: 'voice',
    originalLanguage: 'en',
    targetLanguages: [],
    tags: [],
    isPublic: false
  });

  const {
    translations,
    isTranslating,
    error: translationError,
    translationProgress,
    translateText,
    detectLanguage,
    updateTranslation,
    removeTranslation,
    clearTranslations
  } = useTranslation();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [storiesError, setStoriesError] = useState<string | null>(null);

  const loadMyStories = async () => {
    try {
      setIsLoadingStories(true);
      setStoriesError(null);
      const res = await StoryService.getMyStories({ page: 1, limit: 10, includePrivate: true });
      console.log('[DEBUG] Stories API response:', res);
      const items = res?.data?.stories || [];
      console.log('[DEBUG] Stories items:', items, 'isArray:', Array.isArray(items));
      setMyStories(items);
    } catch (e) {
      console.error('[DEBUG] Stories error:', e);
      setStoriesError(e instanceof Error ? e.message : 'Failed to load stories');
    } finally {
      setIsLoadingStories(false);
    }
  };

  useEffect(() => {
    loadMyStories();
  }, []);

  // Auto-detect language when content changes
  useEffect(() => {
    if (storyData.content.length > 50) {
      detectLanguage(storyData.content).then(detectedLang => {
        if (detectedLang !== storyData.originalLanguage) {
          setStoryData(prev => ({ ...prev, originalLanguage: detectedLang }));
        }
      });
    }
  }, [storyData.content, detectLanguage, storyData.originalLanguage]);

  const handleVoiceTranscription = (text: string, confidence: number) => {
    setStoryData(prev => ({
      ...prev,
      content: text,
      inputType: 'voice'
    }));
  };

  const handleTextChange = (text: string) => {
    setStoryData(prev => ({
      ...prev,
      content: text,
      inputType: 'text'
    }));
  };

  const handleLanguageSelection = (languages: string[]) => {
    setStoryData(prev => ({
      ...prev,
      targetLanguages: languages
    }));
  };

  const handleTranslate = async () => {
    if (!storyData.content.trim()) {
      alert('Please enter your story first');
      return;
    }

    if (storyData.targetLanguages.length === 0) {
      alert('Please select at least one target language');
      return;
    }

    const validation = TranslationService.validateText(storyData.content);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    await translateText({
      text: storyData.content,
      sourceLanguage: storyData.originalLanguage,
      targetLanguages: storyData.targetLanguages
    });
  };

  const handleExportTranslations = () => {
    if (translations.length === 0) return;

    // Create text content with all translations
    let textContent = '';
    
    translations.forEach((translation, index) => {
      const languageName = getLanguageName(translation.language);
      textContent += `${languageName}:\n${translation.translatedText}\n\n`;
    });

    // Create and download the text file
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLanguageName = (languageCode: string): string => {
    const languageNames: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'ur': 'Urdu',
      'tr': 'Turkish',
      'pl': 'Polish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian'
    };
    return languageNames[languageCode] || languageCode.toUpperCase();
  };

  const handleSaveStory = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const payload = {
        title: storyData.title || 'Untitled Story',
        originalText: storyData.content,
        originalLanguage: storyData.originalLanguage,
        inputType: storyData.inputType,
        tags: storyData.tags,
        isPublic: storyData.isPublic,
        translations: translations.map(t => ({
          language: t.language,
          languageName: (t as any).languageName || t.language,
          translatedText: t.translatedText,
          confidence: (t as any).confidence ?? 0.9
        }))
      };

      await StoryService.saveStory(payload);
      await loadMyStories();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save story');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setStoryData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const canTranslate = storyData.content.trim().length >= 10 && storyData.targetLanguages.length > 0;
  const canSave = storyData.content.trim().length >= 10;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Share Your Craft Story</h1>
        </div>
        <p className="text-gray-600">
          Tell the world about your craft, connect with global audiences, and preserve your artisan heritage.
        </p>
      </div>

      {/* Story Title */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Story Title
        </label>
        <input
          type="text"
          value={storyData.title}
          onChange={(e) => setStoryData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Give your story a compelling title..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Input Method Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Choose Your Input Method</h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveInputType('voice')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                ${activeInputType === 'voice' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Mic className="w-4 h-4" />
              Record Voice
            </button>
            
            <button
              onClick={() => setActiveInputType('text')}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                ${activeInputType === 'text' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Type className="w-4 h-4" />
              Type Text
            </button>
          </div>
        </div>

        {/* Input Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {activeInputType === 'voice' ? (
              <VoiceRecorder
                onTranscription={handleVoiceTranscription}
                language={storyData.originalLanguage}
              />
            ) : (
              <TextInput
                value={storyData.content}
                onChange={handleTextChange}
              />
            )}
          </div>

          <div className="space-y-4">
            {/* Language Selection */}
            <LanguageSelector
              selectedLanguages={storyData.targetLanguages}
              onLanguageChange={handleLanguageSelection}
              sourceLanguage={storyData.originalLanguage}
              maxSelections={8}
            />

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={!canTranslate || isTranslating}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
                ${canTranslate && !isTranslating
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isTranslating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Translating... ({translationProgress}%)
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  Translate Story
                </>
              )}
            </button>

            {/* Tags Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Craft Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {CRAFT_TAGS.slice(0, 8).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`
                      px-3 py-1 text-xs rounded-full border transition-colors
                      ${storyData.tags.includes(tag)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Translation Results */}
      {(translations.length > 0 || isTranslating || translationError) && (
        <TranslationResults
          translations={translations}
          onUpdateTranslation={updateTranslation}
          onRemoveTranslation={removeTranslation}
          isLoading={isTranslating}
        />
      )}

      {/* Translation Error */}
      {translationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 font-medium">Translation Error</div>
          <div className="text-red-500 text-sm mt-1">{translationError}</div>
          <button
            onClick={clearTranslations}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Clear and try again
          </button>
        </div>
      )}

      {/* Save Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={storyData.isPublic}
                onChange={(e) => setStoryData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Make story public</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportTranslations}
              disabled={translations.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={handleSaveStory}
              disabled={!canSave || isSaving}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all
                ${canSave && !isSaving
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Story
                </>
              )}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
            {saveError}
          </div>
        )}
      </div>

      {/* My Stories */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Stories</h3>
          <button
            onClick={loadMyStories}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
        </div>
        {isLoadingStories ? (
          <div className="text-gray-500 text-sm">Loading your stories...</div>
        ) : storiesError ? (
          <div className="text-red-600 text-sm">{storiesError}</div>
        ) : myStories.length === 0 ? (
          <div className="text-gray-500 text-sm">No stories yet. Save your first story above.</div>
        ) : (
          <ul className="space-y-3">
            {Array.isArray(myStories) && myStories.map((s: any) => (
              <li key={s.id || s._id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                <div>
                  <div className="font-medium text-gray-800">{s.title}</div>
                  <div className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleString()} • {s.originalLanguage?.toUpperCase()}</div>
                </div>
                <div className="text-xs px-2 py-1 rounded-full border border-gray-300 text-gray-600">
                  {s.isPublic ? 'Public' : 'Private'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StorytellingDashboard;