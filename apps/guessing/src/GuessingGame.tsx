import { useState, useEffect, useRef } from 'react';
import { readAvatarFile, bufferToDataURL, type Player, type Character } from '@games/shared';
import { type GameDifficulty } from './GameLevelScreen';
import { X } from 'lucide-react';
import './GuessingGame.css';

interface GuessingGameProps {
  selectedPlayer: Player;
  selectedCharacter: Character;
  selectedDifficulty: GameDifficulty;
  onGameEnd: () => void;
}

type GameStatus = 'playing' | 'won' | 'lost';

export function GuessingGame({ selectedPlayer, selectedCharacter, selectedDifficulty, onGameEnd }: GuessingGameProps) {
  const [playerAvatar, setPlayerAvatar] = useState<string | null>(null);
  const [characterAvatar, setCharacterAvatar] = useState<string | null>(null);
  const [showPlayerAvatar, setShowPlayerAvatar] = useState(false);
  const [showCharacterAvatar, setShowCharacterAvatar] = useState(false);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [guesses, setGuesses] = useState<number[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [feedback, setFeedback] = useState<'higher' | 'lower' | 'duplicate' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get range based on difficulty
  const getRange = (difficulty: GameDifficulty): [number, number] => {
    switch (difficulty) {
      case 'easy':
        return [1, 10];
      case 'medium':
        return [1, 30];
      case 'hard':
        return [1, 100];
    }
  };

  // Load avatars
  useEffect(() => {
    const loadAvatars = async () => {
      // Load player avatar
      if (selectedPlayer.avatar) {
        try {
          const buffer = await readAvatarFile(selectedPlayer.avatar);
          setPlayerAvatar(bufferToDataURL(buffer));
        } catch (error) {
          console.error('Failed to load player avatar:', error);
        }
      }

      // Load character avatar
      if (selectedCharacter.avatar) {
        try {
          const buffer = await readAvatarFile(selectedCharacter.avatar);
          setCharacterAvatar(bufferToDataURL(buffer));
        } catch (error) {
          console.error('Failed to load character avatar:', error);
        }
      }
    };

    loadAvatars();
  }, [selectedPlayer, selectedCharacter]);

  // Generate target number on mount
  useEffect(() => {
    const [min, max] = getRange(selectedDifficulty);
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    setTargetNumber(randomNumber);
  }, [selectedDifficulty]);

  // Animate avatars sliding in
  useEffect(() => {
    // Character avatar slides in from right (top-right position)
    const timer1 = setTimeout(() => {
      setShowCharacterAvatar(true);
    }, 300);

    // Player avatar slides in from left (bottom-left position)
    const timer2 = setTimeout(() => {
      setShowPlayerAvatar(true);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Handle win condition - show confetti
  useEffect(() => {
    if (gameStatus === 'won') {
      setShowConfetti(true);
    }
  }, [gameStatus]);

  // Focus input when game starts and avatars are visible
  useEffect(() => {
    if (gameStatus === 'playing' && showPlayerAvatar && showCharacterAvatar) {
      // Small delay to ensure input is rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, showPlayerAvatar, showCharacterAvatar]);

  // Global keyboard listener for number input
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle number keys (0-9) and backspace
      if (e.key >= '0' && e.key <= '9') {
        // If input is not focused, update guess state
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          const [min, max] = getRange(selectedDifficulty);
          const currentGuess = guess || '';
          const newGuess = currentGuess + e.key;
          const guessNum = parseInt(newGuess, 10);
          const maxLength = max.toString().length;
          
          // Allow typing if:
          // 1. The number is within range, OR
          // 2. The string length is less than max length (user is still typing)
          if ((!isNaN(guessNum) && guessNum >= min && guessNum <= max) || 
              newGuess.length < maxLength) {
            setGuess(newGuess);
          }
        }
      } else if (e.key === 'Backspace' && document.activeElement !== inputRef.current) {
        // Handle backspace when input is not focused
        e.preventDefault();
        setGuess((prev) => prev.slice(0, -1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, guess, selectedDifficulty]);

  const handleContinue = () => {
    onGameEnd();
  };

  const handleExit = () => {
    setShowExitModal(true);
  };

  const handleExitConfirm = () => {
    setShowExitModal(false);
    onGameEnd();
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

  const handleGuess = () => {
    const guessNum = parseInt(guess, 10);
    const [min, max] = getRange(selectedDifficulty);

    // Validate input
    if (isNaN(guessNum) || guessNum < min || guessNum > max) {
      return;
    }

    // Check if already guessed
    if (guesses.includes(guessNum)) {
      setFeedback('duplicate');
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 2000);
      return;
    }

    // Add to guesses
    const newGuesses = [...guesses, guessNum];
    setGuesses(newGuesses);
    setGuess('');

    // Check win condition
    if (guessNum === targetNumber) {
      setGameStatus('won');
      setFeedback(null);
      return;
    }

    // Check lose condition (10 guesses used)
    if (newGuesses.length >= 10) {
      setGameStatus('lost');
      setFeedback(null);
      return;
    }

    // Set feedback
    if (guessNum > targetNumber) {
      setFeedback('lower');
    } else {
      setFeedback('higher');
    }

    // Clear feedback after 2 seconds
    setTimeout(() => {
      setFeedback(null);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && gameStatus === 'playing') {
      handleGuess();
    }
  };

  const [min, max] = getRange(selectedDifficulty);
  const guessNum = guess !== '' ? parseInt(guess, 10) : NaN;
  // Only validate that it's a number and within range - don't check if already guessed
  // (handleGuess will prevent duplicate guesses, but we shouldn't disable the button for that)
  const isInputValid = !isNaN(guessNum) && guessNum >= min && guessNum <= max;

  return (
    <div className="guessing-game">
      {/* Confetti container */}
      {showConfetti && (
        <div className="confetti-container">
          {Array.from({ length: 1000 }).map((_, i) => {
            const angle = Math.random() * Math.PI * 2; // Random angle in radians (0-2π)
            const distance = 200 + Math.random() * 600; // Random distance from center (200-800px)
            const randomDelay = Math.random() * 0.3; // Random delay up to 0.3s
            const randomSize = 4 + Math.random() * 10; // Random size between 4px and 14px
            const randomRotation = Math.random() * 720; // Random rotation (0-720 degrees)
            // Calculate x and y positions using trigonometry
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            return (
              <div
                key={i}
                className="confetti"
                style={{
                  '--delay': `${randomDelay}s`,
                  '--x': `${x}px`,
                  '--y': `${y}px`,
                  '--rotation': `${randomRotation}deg`,
                  width: `${randomSize}px`,
                  height: `${randomSize}px`
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      {/* Exit confirmation modal */}
      {showExitModal && (
        <div className="exit-modal-overlay" onClick={handleExitCancel}>
          <div className="exit-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="exit-modal-title">Quit Game?</h2>
            <p className="exit-modal-text">Are you sure you want to quit the game?</p>
            <div className="exit-modal-buttons">
              <button className="exit-modal-button exit-modal-cancel" onClick={handleExitCancel}>
                Cancel
              </button>
              <button className="exit-modal-button exit-modal-confirm" onClick={handleExitConfirm}>
                Quit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit button - top left */}
      {gameStatus === 'playing' && (
        <button className="game-exit-button" onClick={handleExit} aria-label="Exit game">
          <span className="game-exit-icon">⏹</span>
        </button>
      )}

      {/* Character avatar - top right */}
      <div className={`game-character-avatar ${showCharacterAvatar ? 'visible' : ''}`}>
        <div className="game-avatar-container">
          {characterAvatar ? (
            <img src={characterAvatar} alt={selectedCharacter.name} className="game-avatar-image" />
          ) : (
            <div className="game-avatar-placeholder">
              {selectedCharacter.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="game-avatar-name">{selectedCharacter.name}</div>
        
        {/* Speech bubble */}
        {feedback && (
          <div className={`speech-bubble speech-bubble-${feedback}`}>
            <div className="speech-bubble-content">
              {feedback === 'higher' ? (
                <>
                  <span className="speech-bubble-text">Higher</span>
                  <span className="speech-bubble-icon">↑</span>
                </>
              ) : feedback === 'lower' ? (
                <>
                  <span className="speech-bubble-text">Lower</span>
                  <span className="speech-bubble-icon">↓</span>
                </>
              ) : (
                <>
                  <X className="speech-bubble-icon speech-bubble-icon-top" size={32} />
                  <span className="speech-bubble-text">You've already guessed that, please try again</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Player avatar - bottom left */}
      <div className={`game-player-avatar ${showPlayerAvatar ? 'visible' : ''}`}>
        <div className="game-avatar-container">
          {playerAvatar ? (
            <img src={playerAvatar} alt={selectedPlayer.name} className="game-avatar-image" />
          ) : (
            <div className="game-avatar-placeholder">
              {selectedPlayer.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="game-avatar-name">{selectedPlayer.name}</div>
      </div>

      {/* Game content */}
      {gameStatus === 'won' && (
        <div className="game-win-message">
          <h1 className="game-win-title">You guessed it!</h1>
          <button className="game-continue-button" onClick={handleContinue}>
            Play Again
          </button>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="game-lose-message">
          <h1 className="game-lose-title">Oh no!</h1>
          <p className="game-lose-text">
            You've run out of guesses. The number was: <strong>{targetNumber}</strong>. Better luck next time!
          </p>
          <button className="game-play-again-button" onClick={handleContinue}>
            Play Again
          </button>
        </div>
      )}

      {gameStatus === 'playing' && (
        <>
          {/* Input area */}
          <div className="game-input-area">
            <input
              ref={inputRef}
              type="number"
              className="game-number-input"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyPress={handleKeyPress}
              min={min}
              max={max}
              placeholder={`Enter a number (${min}-${max})`}
              disabled={gameStatus !== 'playing'}
              autoFocus
            />
            <button
              className="game-guess-button"
              onClick={handleGuess}
              disabled={!isInputValid || gameStatus !== 'playing'}
            >
              Guess
            </button>
          </div>

          {/* Guess indicators */}
          <div className="game-guess-indicators">
            {Array.from({ length: 10 }).map((_, index) => {
              const isUsed = index < guesses.length;
              return (
                <span
                  key={index}
                  className={`game-guess-indicator ${isUsed ? 'used' : ''}`}
                >
                  ?
                </span>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

