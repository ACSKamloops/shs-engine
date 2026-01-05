/**
 * WordMatchGame - Interactive vocabulary matching game
 * Users match Secwépemctsín words to their English meanings
 */
import { useState, useEffect, useCallback } from 'react';
import './WordMatchGame.css';

interface Word {
  word: string;
  meaning: string;
}

interface CategoryOption {
  key: string;
  icon: string;
  label: string;
}

interface WordMatchGameProps {
  words: Word[];
  category: string;
  categories?: CategoryOption[];
  onCategoryChange?: (category: string) => void;
  onComplete?: (score: number, total: number) => void;
}

export function WordMatchGame({ words, category, categories, onCategoryChange, onComplete }: WordMatchGameProps) {
  const [gameWords, setGameWords] = useState<Word[]>([]);
  const [shuffledMeanings, setShuffledMeanings] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [wrongPair, setWrongPair] = useState<{ word: string; meaning: string } | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Initialize game with 6 random words
  const initializeGame = useCallback(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(6, words.length));
    setGameWords(selected);
    setShuffledMeanings([...selected.map(w => w.meaning)].sort(() => Math.random() - 0.5));
    setMatches(new Set());
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
    setSelectedWord(null);
    setSelectedMeaning(null);
    setWrongPair(null);
  }, [words]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Check for match when both selected
  useEffect(() => {
    if (selectedWord && selectedMeaning) {
      setAttempts(a => a + 1);
      const matchedWord = gameWords.find(w => w.word === selectedWord);
      
      if (matchedWord && matchedWord.meaning === selectedMeaning) {
        // Correct match!
        setMatches(prev => new Set([...prev, selectedWord]));
        setScore(s => s + 1);
        setSelectedWord(null);
        setSelectedMeaning(null);
      } else {
        // Wrong match - show feedback
        setWrongPair({ word: selectedWord, meaning: selectedMeaning });
        setTimeout(() => {
          setWrongPair(null);
          setSelectedWord(null);
          setSelectedMeaning(null);
        }, 800);
      }
    }
  }, [selectedWord, selectedMeaning, gameWords]);

  // Check for game completion
  useEffect(() => {
    if (matches.size === gameWords.length && gameWords.length > 0) {
      setGameComplete(true);
      onComplete?.(score, gameWords.length);
    }
  }, [matches, gameWords.length, score, onComplete]);

  const handleWordClick = (word: string) => {
    if (matches.has(word) || wrongPair) return;
    setSelectedWord(selectedWord === word ? null : word);
  };

  const handleMeaningClick = (meaning: string) => {
    const matchedWord = gameWords.find(w => w.meaning === meaning);
    if ((matchedWord && matches.has(matchedWord.word)) || wrongPair) return;
    setSelectedMeaning(selectedMeaning === meaning ? null : meaning);
  };

  const getAccuracy = () => {
    if (attempts === 0) return 0;
    return Math.round((score / attempts) * 100);
  };

  return (
    <div className="word-match-game">
      <div className="game-header">
        <h3>🎯 Word Match</h3>
        <div className="game-stats">
          <span className="stat">✓ {score}/{gameWords.length}</span>
          <span className="stat">🎯 {getAccuracy()}%</span>
        </div>
      </div>

      {/* Inline Category Selector */}
      {categories && onCategoryChange && (
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => onCategoryChange(cat.key)}
              className={`category-tab ${category === cat.key ? 'active' : ''}`}
              title={cat.label}
            >
              <span className="tab-icon">{cat.icon}</span>
            </button>
          ))}
        </div>
      )}

      {gameComplete ? (
        <div className="game-complete">
          <div className="celebration">🎉</div>
          <h4>Kukwstsétsemc! (Thank you!)</h4>
          <p>You matched all {gameWords.length} words!</p>
          <p className="accuracy">Accuracy: {getAccuracy()}%</p>
          <button onClick={initializeGame} className="play-again-btn">
            Play Again
          </button>
        </div>
      ) : (
        <div className="match-grid">
          <div className="column words-column">
            <div className="column-label">Secwépemctsín</div>
            {gameWords.map((w) => (
              <button
                key={w.word}
                className={`match-card word-card ${
                  matches.has(w.word) ? 'matched' : ''
                } ${selectedWord === w.word ? 'selected' : ''} ${
                  wrongPair?.word === w.word ? 'wrong' : ''
                }`}
                onClick={() => handleWordClick(w.word)}
                disabled={matches.has(w.word)}
              >
                {w.word}
              </button>
            ))}
          </div>

          <div className="column meanings-column">
            <div className="column-label">English</div>
            {shuffledMeanings.map((meaning) => {
              const matchedWord = gameWords.find(w => w.meaning === meaning);
              const isMatched = matchedWord && matches.has(matchedWord.word);
              
              return (
                <button
                  key={meaning}
                  className={`match-card meaning-card ${
                    isMatched ? 'matched' : ''
                  } ${selectedMeaning === meaning ? 'selected' : ''} ${
                    wrongPair?.meaning === meaning ? 'wrong' : ''
                  }`}
                  onClick={() => handleMeaningClick(meaning)}
                  disabled={isMatched}
                >
                  {meaning}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="hint-text">
        Click a word, then click its matching meaning
      </p>
    </div>
  );
}
