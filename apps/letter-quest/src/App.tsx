import { useState, useEffect } from 'react';
import { PlayerModal, type Player } from '@games/shared';
import { PlayerSelectionScreen } from './PlayerSelectionScreen';
import { GameLevelScreen, type GameDifficulty } from './GameLevelScreen';
import { TypingGame } from './TypingGame';
import './App.css';

type Screen = 'player-selection' | 'game-level' | 'game';

function App() {
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('player-selection');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldSlideIn, setShouldSlideIn] = useState(false);
  const [gameCountdown, setGameCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Keyboard shortcut handler: Ctrl/Cmd + Shift + P (Players)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();
      
      if (modifier && e.shiftKey) {
        if (key === 'p') {
          e.preventDefault();
          e.stopPropagation();
          setIsPlayerModalOpen((prev) => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setIsTransitioning(true);
    setShouldSlideIn(false);
    setTimeout(() => {
      setCurrentScreen('game-level');
      setIsTransitioning(false);
      // Trigger slide-in animation after a brief moment
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldSlideIn(true);
        });
      });
    }, 300);
  };

  const handleGameLevelSelect = (difficulty: GameDifficulty) => {
    setSelectedDifficulty(difficulty);
    setIsTransitioning(true);
    setShouldSlideIn(false);
    setGameStarted(false);
    setGameCountdown(null);
    setTimeout(() => {
      setCurrentScreen('game');
      setIsTransitioning(false);
      // Trigger slide-in animation after a brief moment
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldSlideIn(true);
          // Start countdown after screen slides in
          setTimeout(() => {
            setGameCountdown(3);
          }, 300);
        });
      });
    }, 300);
  };

  // Handle game countdown
  useEffect(() => {
    if (gameCountdown === null) return;

    if (gameCountdown === 0) {
      // Countdown finished, game starts
      setGameStarted(true);
      return;
    }

    const timer = setTimeout(() => {
      setGameCountdown(gameCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameCountdown]);

  const handleGameEnd = () => {
    setIsTransitioning(true);
    setShouldSlideIn(false);
    setGameStarted(false);
    setGameCountdown(null);
    setTimeout(() => {
      setCurrentScreen('player-selection');
      setIsTransitioning(false);
      // Trigger slide-in animation after a brief moment
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldSlideIn(true);
        });
      });
    }, 300);
  };

  return (
    <div className="app">
      <div className="static-background"></div>
      <div className={`screen-container ${isTransitioning ? 'transitioning' : ''}`}>
        {currentScreen === 'player-selection' && (
          <div className={`screen screen-player-selection ${isTransitioning ? 'slide-out-left' : (shouldSlideIn ? 'slide-in-right' : '')}`}>
            <PlayerSelectionScreen onPlayerSelect={handlePlayerSelect} />
          </div>
        )}
        
        {currentScreen === 'game-level' && selectedPlayer && (
          <div className={`screen screen-game-level ${isTransitioning ? 'slide-out-left' : (shouldSlideIn ? 'slide-in-right' : '')}`}>
            <GameLevelScreen onLevelSelect={handleGameLevelSelect} />
          </div>
        )}
        
        {currentScreen === 'game' && selectedPlayer && selectedDifficulty && (
          <div className={`screen screen-game ${isTransitioning ? '' : 'slide-in-right'}`}>
            {!gameStarted ? (
              <div className="game-countdown">
                {gameCountdown !== null && (
                  <div className="game-countdown-number">{gameCountdown}</div>
                )}
              </div>
            ) : (
              <TypingGame
                selectedPlayer={selectedPlayer}
                selectedDifficulty={selectedDifficulty}
                onGameEnd={handleGameEnd}
              />
            )}
          </div>
        )}
      </div>
      <PlayerModal isOpen={isPlayerModalOpen} onClose={() => setIsPlayerModalOpen(false)} />
    </div>
  );
}

export default App;

