import { useState, useEffect } from 'react';
import { PlayerModal, CharacterModal, type Player, type Character } from '@games/shared';
import { SplashScreen } from './SplashScreen';
import { PlayerSelectionScreen } from './PlayerSelectionScreen';
import { CharacterSelectionScreen } from './CharacterSelectionScreen';
import { GameLevelScreen, type GameDifficulty } from './GameLevelScreen';
import { VersusScreen } from './VersusScreen';
import { GuessingGame } from './GuessingGame';
import './App.css';

type Screen = 'splash' | 'player-selection' | 'character-selection' | 'game-level' | 'versus' | 'game';

function App() {
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shouldSlideIn, setShouldSlideIn] = useState(false);
  const [gameCountdown, setGameCountdown] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  // Keyboard shortcut handlers: Ctrl/Cmd + Shift + P (Players), Ctrl/Cmd + Shift + C (Characters)
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
        } else if (key === 'c') {
          e.preventDefault();
          e.stopPropagation();
          setIsCharacterModalOpen((prev) => !prev);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, []);

  const handleSplashComplete = () => {
    setIsTransitioning(true);
    setShouldSlideIn(false);
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

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
    setIsTransitioning(true);
    setShouldSlideIn(false);
    setTimeout(() => {
      setCurrentScreen('character-selection');
      setIsTransitioning(false);
      // Trigger slide-in animation after a brief moment
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldSlideIn(true);
        });
      });
    }, 300);
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
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
    setTimeout(() => {
      setCurrentScreen('versus');
      setIsTransitioning(false);
      // Trigger slide-in animation after a brief moment
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShouldSlideIn(true);
        });
      });
    }, 300);
  };

  const handleVersusComplete = () => {
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
      setCurrentScreen('character-selection');
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
        {currentScreen === 'splash' && (
          <div className={`screen screen-splash ${isTransitioning ? 'slide-out-left' : ''}`}>
            <SplashScreen onComplete={handleSplashComplete} />
          </div>
        )}
        
        {currentScreen === 'player-selection' && (
          <div className={`screen screen-player-selection ${isTransitioning ? 'slide-out-left' : (shouldSlideIn ? 'slide-in-right' : '')}`}>
            <PlayerSelectionScreen onPlayerSelect={handlePlayerSelect} />
          </div>
        )}
        
        {currentScreen === 'character-selection' && selectedPlayer && (
          <div className={`screen screen-character-selection ${isTransitioning ? 'slide-out-left' : (shouldSlideIn ? 'slide-in-right' : '')}`}>
            <CharacterSelectionScreen 
              selectedPlayer={selectedPlayer} 
              onCharacterSelect={handleCharacterSelect} 
            />
          </div>
        )}
        
        {currentScreen === 'game-level' && selectedPlayer && selectedCharacter && (
          <div className={`screen screen-game-level ${isTransitioning ? 'slide-out-left' : (shouldSlideIn ? 'slide-in-right' : '')}`}>
            <GameLevelScreen onLevelSelect={handleGameLevelSelect} />
          </div>
        )}
        
        {currentScreen === 'versus' && selectedPlayer && selectedCharacter && (
          <div className={`screen screen-versus ${isTransitioning ? 'slide-out-left' : (shouldSlideIn ? 'slide-in-right' : '')}`}>
            <VersusScreen 
              selectedPlayer={selectedPlayer}
              selectedCharacter={selectedCharacter}
              onComplete={handleVersusComplete}
            />
          </div>
        )}
        
        {currentScreen === 'game' && selectedPlayer && selectedCharacter && selectedDifficulty && (
          <div className={`screen screen-game ${isTransitioning ? '' : 'slide-in-right'}`}>
            {!gameStarted ? (
              <div className="game-countdown">
                {gameCountdown !== null && (
                  <div className="game-countdown-number">{gameCountdown}</div>
                )}
              </div>
            ) : (
              <GuessingGame
                selectedPlayer={selectedPlayer}
                selectedCharacter={selectedCharacter}
                selectedDifficulty={selectedDifficulty}
                onGameEnd={handleGameEnd}
              />
            )}
          </div>
        )}
      </div>
      <PlayerModal isOpen={isPlayerModalOpen} onClose={() => setIsPlayerModalOpen(false)} />
      <CharacterModal isOpen={isCharacterModalOpen} onClose={() => setIsCharacterModalOpen(false)} />
    </div>
  );
}

export default App;

