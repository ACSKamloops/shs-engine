/**
 * useLanguageData - Unified hook for all Secwepemctsín language data
 * 
 * Provides access to:
 * - Dictionary (12,690 words with themes)
 * - Stories (787 bilingual pairs)
 * - Phrase Books (440 phrases, 3 dialects)
 * - Songs (117 songs)
 * - Language Series (49 bilingual pairs)
 * - Cultural Knowledge (260 sections)
 */

import { useMemo, useState, useCallback } from 'react';

// Import all data sources
import dictionaryData from '../data/dictionary_gold_standard.json';
import thematicVocab from '../data/thematic_vocabulary.json';

// Lazy load larger datasets
const loadStories = () => import('../data/stories/all_sptekwles.json');
const loadPhraseBooks = () => import('../data/phrase_books/all_phrase_books.json');
const loadSongs = () => import('../data/language_books/setsatsinas.json');

// Types
export interface Word {
  word: string;
  pronunciation: string;
  meaning: string;
}

export interface BilingualPair {
  secwepemc: string;
  english: string;
  page?: number;
}

export interface Phrase extends BilingualPair {
  section?: string;
  dialect?: string;
}

export interface Story {
  id: string;
  title_secwepemc: string;
  title_english: string;
  storyteller?: string;
  content: BilingualPair[];
}

export interface Song {
  title: string;
  lyrics: string;
  page?: number;
}

export type Dialect = 'eastern' | 'northern' | 'western';

// Dictionary access
export function useDictionary() {
  const words = dictionaryData.words as Word[];
  const totalWords = dictionaryData.metadata.totalWords;
  
  const getRandomWord = useCallback(() => {
    const index = Math.floor(Math.random() * words.length);
    return words[index];
  }, [words]);
  
  const getDailyWord = useCallback((dateString?: string) => {
    const date = dateString || new Date().toISOString().split('T')[0];
    const seed = date.split('-').reduce((acc, part, idx) => acc + parseInt(part) * (idx + 1), 0);
    return words[seed % words.length];
  }, [words]);
  
  const searchWords = useCallback((query: string) => {
    const lower = query.toLowerCase();
    return words.filter(w => 
      w.word.toLowerCase().includes(lower) || 
      w.meaning.toLowerCase().includes(lower)
    );
  }, [words]);
  
  return {
    words,
    totalWords,
    getRandomWord,
    getDailyWord,
    searchWords,
  };
}

// Thematic vocabulary access
export function useThematicVocabulary() {
  const themes = thematicVocab as Record<string, Word[]>;
  
  const getTheme = useCallback((themeName: string) => {
    return themes[themeName] || [];
  }, [themes]);
  
  const availableThemes = useMemo(() => Object.keys(themes), [themes]);
  
  return {
    themes,
    getTheme,
    availableThemes,
  };
}

// Stories access (lazy loaded)
export function useStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const load = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const data = await loadStories();
      setStories(data.stories || []);
      setLoaded(true);
    } catch (e) {
      console.error('Failed to load stories:', e);
    }
    setLoading(false);
  }, [loaded, loading]);
  
  const getStory = useCallback((id: string) => {
    return stories.find(s => s.id === id);
  }, [stories]);
  
  const getRandomPair = useCallback(() => {
    if (stories.length === 0) return null;
    const story = stories[Math.floor(Math.random() * stories.length)];
    if (!story.content || story.content.length === 0) return null;
    return story.content[Math.floor(Math.random() * story.content.length)];
  }, [stories]);
  
  return {
    stories,
    loading,
    loaded,
    load,
    getStory,
    getRandomPair,
  };
}

// Phrase books access (lazy loaded)
export function usePhraseBooks() {
  const [dialects, setDialects] = useState<{ id: string; dialect: string; phrases: Phrase[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const load = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const data = await loadPhraseBooks();
      setDialects(data.dialects || []);
      setLoaded(true);
    } catch (e) {
      console.error('Failed to load phrase books:', e);
    }
    setLoading(false);
  }, [loaded, loading]);
  
  const getPhrases = useCallback((dialectId: Dialect) => {
    const dialect = dialects.find(d => d.id === dialectId);
    return dialect?.phrases || [];
  }, [dialects]);
  
  const getRandomPhrase = useCallback((dialectId?: Dialect) => {
    let allPhrases = dialects.flatMap(d => 
      d.phrases.map(p => ({ ...p, dialect: d.dialect }))
    );
    if (dialectId) {
      allPhrases = allPhrases.filter(p => p.dialect?.toLowerCase().includes(dialectId));
    }
    if (allPhrases.length === 0) return null;
    return allPhrases[Math.floor(Math.random() * allPhrases.length)];
  }, [dialects]);
  
  return {
    dialects,
    loading,
    loaded,
    load,
    getPhrases,
    getRandomPhrase,
  };
}

// Songs access (lazy loaded)
export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const load = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const data = await loadSongs();
      setSongs(data.songs || []);
      setLoaded(true);
    } catch (e) {
      console.error('Failed to load songs:', e);
    }
    setLoading(false);
  }, [loaded, loading]);
  
  const getRandomSong = useCallback(() => {
    if (songs.length === 0) return null;
    return songs[Math.floor(Math.random() * songs.length)];
  }, [songs]);
  
  return {
    songs,
    loading,
    loaded,
    load,
    getRandomSong,
    totalSongs: songs.length,
  };
}

// Combined language data hook
export function useLanguageData() {
  const dictionary = useDictionary();
  const themes = useThematicVocabulary();
  const stories = useStories();
  const phrases = usePhraseBooks();
  const songs = useSongs();
  
  // Load all lazy datasets
  const loadAll = useCallback(async () => {
    await Promise.all([
      stories.load(),
      phrases.load(),
      songs.load(),
    ]);
  }, [stories, phrases, songs]);
  
  return {
    dictionary,
    themes,
    stories,
    phrases,
    songs,
    loadAll,
  };
}

export default useLanguageData;
