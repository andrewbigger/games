import { useState } from 'react';
import { QuitModal } from './QuitModal';
import './GameLevelScreen.css';

export type GameDifficulty = 'easy' | 'medium' | 'hard';

interface GameLevelScreenProps {
  onLevelSelect: (difficulty: GameDifficulty) => void;
}

export function GameLevelScreen({ onLevelSelect }: GameLevelScreenProps) {
  const [showQuitModal, setShowQuitModal] = useState(false);

  const handleLevelClick = (difficulty: GameDifficulty) => {
    onLevelSelect(difficulty);
  };

  const handleQuit = () => {
    setShowQuitModal(true);
  };

  const handleQuitConfirm = async () => {
    if (window.electronAPI?.app?.quit) {
      await window.electronAPI.app.quit();
    }
  };

  const handleQuitCancel = () => {
    setShowQuitModal(false);
  };

  return (
    <div className="game-level-screen">
      <QuitModal isOpen={showQuitModal} onConfirm={handleQuitConfirm} onCancel={handleQuitCancel} />
      <button className="screen-quit-button" onClick={handleQuit} aria-label="Quit application">
        <span className="screen-quit-icon">⏹</span>
      </button>
      <div className="game-level-content">
        <h2 className="game-level-title">Select Difficulty</h2>
        <div className="game-level-options">
          <button
            className="game-level-button game-level-easy"
            onClick={() => handleLevelClick('easy')}
          >
            <div className="game-level-button-title">Easy</div>
            <div className="game-level-button-description">Numbers 1 - 10</div>
          </button>
          <button
            className="game-level-button game-level-medium"
            onClick={() => handleLevelClick('medium')}
          >
            <div className="game-level-button-title">Medium</div>
            <div className="game-level-button-description">Numbers 1 - 30</div>
          </button>
          <button
            className="game-level-button game-level-hard"
            onClick={() => handleLevelClick('hard')}
          >
            <div className="game-level-button-title">Hard</div>
            <div className="game-level-button-description">Numbers 1 - 100</div>
          </button>
        </div>
      </div>
    </div>
  );
}

