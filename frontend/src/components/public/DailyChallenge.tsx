/**
 * DailyChallenge - Daily word learning with streak tracking
 * Shows a new word each day and tracks learning streaks
 */
import { useState, useEffect } from 'react';
import './DailyChallenge.css';
import dictionaryData from '../../data/dictionary_gold_standard.json';

interface Word {
  word: string;
  pronunciation: string;
  meaning: string;
}

interface DailyChallengeProps {
  words?: Word[];
}

interface StreakData {
  currentStreak: number;
  lastPracticeDate: string;
  wordsLearned: string[];
}

const STORAGE_KEY = 'shs_daily_challenge';

function getDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function getDailyWord(words: Word[], dateString: string): Word {
  // Enhanced seed logic for larger datasets
  const seed = dateString.split('-').reduce((acc, part, idx) => {
    return acc + (parseInt(part) * (idx + 1));
  }, 0);
  const index = seed % words.length;
  return words[index];
}

export function DailyChallenge({ words: propsWords }: DailyChallengeProps) {
  const words = propsWords || dictionaryData.words;
  const [revealed, setRevealed] = useState(false);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastPracticeDate: '',
    wordsLearned: [],
  });
  const [practiced, setPracticed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const today = getDateString();
  const dailyWord = getDailyWord(words, today);

  // Load streak data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data: StreakData = JSON.parse(saved);
      setStreakData(data);
      
      // Check if already practiced today
      if (data.lastPracticeDate === today) {
        setPracticed(true);
        setRevealed(true);
      }
    }
  }, [today]);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleMarkLearned = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    let newStreak = 1;
    if (streakData.lastPracticeDate === yesterdayStr) {
      // Continuing streak
      newStreak = streakData.currentStreak + 1;
    } else if (streakData.lastPracticeDate === today) {
      // Already practiced today
      newStreak = streakData.currentStreak;
    }
    // Otherwise, streak resets to 1

    const newData: StreakData = {
      currentStreak: newStreak,
      lastPracticeDate: today,
      wordsLearned: [...new Set([...streakData.wordsLearned, dailyWord.word])],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setStreakData(newData);
    setPracticed(true);
    
    // Show confetti for milestones
    if (newStreak % 5 === 0 || newStreak === 1) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const getStreakEmoji = () => {
    const streak = streakData.currentStreak;
    if (streak >= 30) return '🏆';
    if (streak >= 14) return '⭐';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '✨';
    return '🌱';
  };

  return (
    <div className="daily-challenge">
      {showConfetti && (
        <div className="confetti-overlay">
          {['🎉', '⭐', '🔥', '✨', '🎊'].map((emoji, i) => (
            <span key={i} className="confetti-particle" style={{ 
              left: `${10 + i * 20}%`,
              animationDelay: `${i * 0.1}s`
            }}>
              {emoji}
            </span>
          ))}
        </div>
      )}

      <div className="challenge-header">
        <div className="challenge-title">
          <span className="calendar-icon">📅</span>
          <h3>Daily Word</h3>
        </div>
        <div className="streak-badge">
          <span className="streak-emoji">{getStreakEmoji()}</span>
          <span className="streak-count">{streakData.currentStreak} day{streakData.currentStreak !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className={`word-card-daily ${revealed ? 'revealed' : ''}`}>
        <div className="word-front">
          <p className="word-text">{dailyWord.word}</p>
          <p className="pronunciation">/{dailyWord.pronunciation}/</p>
          {!revealed && (
            <button onClick={handleReveal} className="reveal-btn">
              Reveal Meaning
            </button>
          )}
        </div>
        
        {revealed && (
          <div className="word-meaning">
            <p className="meaning-text">{dailyWord.meaning}</p>
            
            {!practiced ? (
              <button onClick={handleMarkLearned} className="learned-btn">
                ✓ I Learned This!
              </button>
            ) : (
              <p className="practiced-message">
                ✓ Practiced today!
              </p>
            )}
          </div>
        )}
      </div>

      <div className="challenge-stats">
        <div className="stat-item">
          <span className="stat-value">{streakData.wordsLearned.length}</span>
          <span className="stat-label">Words Learned</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{streakData.currentStreak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
      </div>
    </div>
  );
}
