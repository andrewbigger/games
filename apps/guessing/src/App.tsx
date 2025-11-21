import { useState, useEffect } from 'react';
import { greet, DEFAULT_GAME_CONFIG, type GameConfig, PlayerModal, CharacterModal, type Player, type Character } from '@games/shared';
import { SplashScreen } from './SplashScreen';
import { PlayerSelectionScreen } from './PlayerSelectionScreen';
import { CharacterSelectionScreen } from './CharacterSelectionScreen';
import { VersusScreen } from './VersusScreen';
import './App.css';

type Screen = 'splash' | 'player-selection' | 'character-selection' | 'versus' | 'game';

function App() {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
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
        
        {currentScreen === 'versus' && selectedPlayer && selectedCharacter && (
          <div className={`screen screen-versus ${isTransitioning ? 'slide-out-left' : (shouldSlideIn ? 'slide-in-right' : '')}`}>
            <VersusScreen 
              selectedPlayer={selectedPlayer}
              selectedCharacter={selectedCharacter}
              onComplete={handleVersusComplete}
            />
          </div>
        )}
        
        {currentScreen === 'game' && (
          <div className={`screen screen-game ${isTransitioning ? '' : 'slide-in-right'}`}>
            {!gameStarted ? (
              <div className="game-countdown">
                {gameCountdown !== null && (
                  <div className="game-countdown-number">{gameCountdown}</div>
                )}
              </div>
            ) : (
              <header className="app-header">
                <h1>{config.title}</h1>
                <p>{greet(selectedPlayer?.name || 'Player')} Welcome to the Guessing Game!</p>
                {selectedPlayer && (
                  <div className="selected-player-info">
                    <p>Selected Player: <strong>{selectedPlayer.name}</strong></p>
                  </div>
                )}
                {selectedCharacter && (
                  <div className="selected-player-info">
                    <p>Playing Against: <strong>{selectedCharacter.name}</strong></p>
                  </div>
                )}
                <div className="game-info">
                  <p>Version: {config.version}</p>
                  <p>Dimensions: {config.width} x {config.height}</p>
                </div>
                <p className="shared-lib-note">
                  This component imports from <code>@games/shared</code> to demonstrate workspace linking.
                </p>
                <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Press <kbd style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontFamily: 'monospace' }}>
                    {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd' : 'Ctrl'}+Shift+P
                  </kbd> to manage players, <kbd style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '0.2rem 0.4rem', borderRadius: '0.25rem', fontFamily: 'monospace' }}>
                    {navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'Cmd' : 'Ctrl'}+Shift+C
                  </kbd> to manage characters
                </p>
              </header>
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

