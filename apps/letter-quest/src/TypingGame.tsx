import { useState, useEffect, useRef } from 'react';
import { readAvatarFile, bufferToDataURL, type Player } from '@games/shared';
import { type GameDifficulty } from './GameLevelScreen';
import './TypingGame.css';

interface TypingGameProps {
  selectedPlayer: Player;
  selectedDifficulty: GameDifficulty;
  onGameEnd: () => void;
}

type GameStatus = 'playing' | 'won' | 'lost';

export function TypingGame({ selectedPlayer, selectedDifficulty, onGameEnd }: TypingGameProps) {
  const [playerAvatar, setPlayerAvatar] = useState<string | null>(null);
  const [showPlayerAvatar, setShowPlayerAvatar] = useState(false);
  const [letters, setLetters] = useState<string[]>([]);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [score, setScore] = useState<number>(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLetterSubtle, setIsLetterSubtle] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  // Get time limit based on difficulty
  const getTimeLimit = (difficulty: GameDifficulty): number => {
    switch (difficulty) {
      case 'easy':
        return 20;
      case 'medium':
        return 10;
      case 'hard':
        return 5;
    }
  };

  // Generate 20 random letters from A-Z
  useEffect(() => {
    const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    // Shuffle and take first 20
    const shuffled = [...allLetters].sort(() => Math.random() - 0.5);
    setLetters(shuffled.slice(0, 20));
    setTimeRemaining(getTimeLimit(selectedDifficulty));
  }, [selectedDifficulty]);

  // Load player avatar
  useEffect(() => {
    const loadAvatar = async () => {
      if (selectedPlayer.avatar) {
        try {
          const buffer = await readAvatarFile(selectedPlayer.avatar);
          setPlayerAvatar(bufferToDataURL(buffer));
        } catch (error) {
          console.error('Failed to load player avatar:', error);
        }
      }
    };

    loadAvatar();
  }, [selectedPlayer]);

  // Animate player avatar sliding in
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPlayerAvatar(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameStatus !== 'playing' || letters.length === 0 || isPaused) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0.1) {
          // Time's up - game over
          setGameStatus('lost');
          return 0;
        }
        return Math.max(0, prev - 0.1);
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [gameStatus, letters.length, isPaused]);

  // Handle keyboard events
  useEffect(() => {
    if (gameStatus !== 'playing' || letters.length === 0 || isPaused) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const pressedKey = e.key.toUpperCase();
      const currentLetter = letters[currentLetterIndex];

      if (!currentLetter) return;

      // Check if correct key
      if (pressedKey === currentLetter) {
        // Add remaining time to score
        setScore((prev) => prev + Math.max(0, timeRemaining));
        
        // Make the letter subtle
        setIsLetterSubtle(true);
        
        // Pause the timer
        setIsPaused(true);
        
        // Show confetti and success message
        setShowConfetti(true);
        setShowSuccessMessage(true);
        
        // After confetti animation, advance to next letter and resume timer
        setTimeout(() => {
          setShowConfetti(false);
          setShowSuccessMessage(false);
          
          // Move to next letter
          if (currentLetterIndex < letters.length - 1) {
            setCurrentLetterIndex((prev) => prev + 1);
            setTimeRemaining(getTimeLimit(selectedDifficulty));
            // Resume timer by clearing pause state and reset letter subtle state
            setIsPaused(false);
            setIsLetterSubtle(false);
          } else {
            // All letters completed - game won
            setGameStatus('won');
            setIsPaused(false);
            setIsLetterSubtle(false);
          }
        }, 2000);
      } else if (pressedKey.length === 1 && /[A-Z]/.test(pressedKey)) {
        // Wrong key - apply 2 second penalty
        setTimeRemaining((prev) => Math.max(0, prev - 2));
        // Trigger shake animation
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
        }, 500);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStatus, letters, currentLetterIndex, timeRemaining, selectedDifficulty, isPaused]);

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

  const currentLetter = letters[currentLetterIndex] || '';
  const progress = currentLetterIndex + 1;
  const totalLetters = letters.length;

  return (
    <div className={`typing-game ${isShaking ? 'shake' : ''}`}>
      {/* Fireworks container */}
      {showConfetti && (
        <div className="fireworks-container">
          {Array.from({ length: 24 }).map((_, burstIndex) => {
            const burstAngle = (burstIndex / 24) * Math.PI * 2;
            const burstDistance = 50 + Math.random() * 150;
            const burstX = Math.cos(burstAngle) * burstDistance;
            const burstY = Math.sin(burstAngle) * burstDistance;
            const burstDelay = burstIndex * 0.05;
            
            return (
              <div key={burstIndex} className="firework-burst" style={{
                '--burst-x': `${burstX}px`,
                '--burst-y': `${burstY}px`,
                '--burst-delay': `${burstDelay}s`
              } as React.CSSProperties}>
                {Array.from({ length: 40 }).map((_, particleIndex) => {
                  const angle = (particleIndex / 40) * Math.PI * 2;
                  const distance = 80 + Math.random() * 150;
                  const particleDelay = burstDelay + Math.random() * 0.15;
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance;
                  
                  return (
                    <div
                      key={particleIndex}
                      className="firework-particle"
                      style={{
                        '--delay': `${particleDelay}s`,
                        '--x': `${x}px`,
                        '--y': `${y}px`,
                        '--angle': `${angle}rad`
                      } as React.CSSProperties}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Success message overlay */}
      {showSuccessMessage && (
        <div className="success-message-overlay">
          <div className="success-message">You found it!</div>
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
          <h1 className="game-win-title">Congratulations!</h1>
          <p className="game-win-score">Your Score: {Math.round(score)}</p>
          <button className="game-continue-button" onClick={handleContinue}>
            Play Again
          </button>
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="game-lose-message">
          <h1 className="game-lose-title">Time's Up!</h1>
          <p className="game-lose-text">
            You completed {currentLetterIndex} out of {totalLetters} letters.
          </p>
          <p className="game-lose-score">Your Score: {Math.round(score)}</p>
          <button className="game-play-again-button" onClick={handleContinue}>
            Play Again
          </button>
        </div>
      )}

      {gameStatus === 'playing' && (
        <>
          {/* Timer display */}
          <div className="game-timer-container">
            <div className="game-timer-label">Time Remaining</div>
            <div className={`game-timer ${timeRemaining <= 2 ? 'timer-warning' : ''}`}>
              {Math.ceil(timeRemaining)}s
            </div>
          </div>

          {/* Letter display */}
          <div className="game-letter-container">
            <div className="game-letter-label">Find this letter:</div>
            <div className={`game-letter ${isLetterSubtle ? 'subtle' : ''}`}>{currentLetter}</div>
          </div>

          {/* Progress indicator */}
          <div className="game-progress">
            <div className="game-progress-label">
              Letter {progress} of {totalLetters}
            </div>
            <div className="game-progress-bar">
              <div 
                className="game-progress-fill" 
                style={{ width: `${(progress / totalLetters) * 100}%` }}
              />
            </div>
          </div>

          {/* Score display */}
          <div className="game-score">
            Score: {Math.round(score)}
          </div>
        </>
      )}
    </div>
  );
}

