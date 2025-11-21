import { useState, useEffect } from 'react';
import { readAvatarFile, bufferToDataURL, type Player, type Character } from '@games/shared';
import './VersusScreen.css';

interface VersusScreenProps {
  selectedPlayer: Player;
  selectedCharacter: Character;
  onComplete: () => void;
}

export function VersusScreen({ selectedPlayer, selectedCharacter, onComplete }: VersusScreenProps) {
  const [playerAvatar, setPlayerAvatar] = useState<string | null>(null);
  const [characterAvatar, setCharacterAvatar] = useState<string | null>(null);
  const [showPlayerAvatar, setShowPlayerAvatar] = useState(false);
  const [showVsHeading, setShowVsHeading] = useState(false);
  const [showCharacterAvatar, setShowCharacterAvatar] = useState(false);

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

  // Sequence animations
  useEffect(() => {
    // Player avatar animates in from top-left (0.5s delay)
    const timer1 = setTimeout(() => {
      setShowPlayerAvatar(true);
    }, 500);

    // "Vs." heading appears (1s delay)
    const timer2 = setTimeout(() => {
      setShowVsHeading(true);
    }, 1000);

    // Character avatar animates in from bottom-right (1.5s delay)
    const timer3 = setTimeout(() => {
      setShowCharacterAvatar(true);
    }, 1500);

    // Transition to game screen 3 seconds after character avatar animation completes (1.5s + 3s = 4.5s)
    const timer4 = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="versus-screen">
      {/* Player avatar - top left */}
      <div className={`versus-player-avatar ${showPlayerAvatar ? 'visible' : ''}`}>
        <div className="versus-avatar-container">
          {playerAvatar ? (
            <img src={playerAvatar} alt={selectedPlayer.name} className="versus-avatar-image" />
          ) : (
            <div className="versus-avatar-placeholder">
              {selectedPlayer.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="versus-avatar-name">{selectedPlayer.name}</div>
      </div>

      {/* Vs. heading - center */}
      {showVsHeading && (
        <div className="versus-heading">
          <h1>Vs.</h1>
        </div>
      )}

      {/* Character avatar - bottom right */}
      <div className={`versus-character-avatar ${showCharacterAvatar ? 'visible' : ''}`}>
        <div className="versus-avatar-container">
          {characterAvatar ? (
            <img src={characterAvatar} alt={selectedCharacter.name} className="versus-avatar-image" />
          ) : (
            <div className="versus-avatar-placeholder">
              {selectedCharacter.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="versus-avatar-name">{selectedCharacter.name}</div>
      </div>
    </div>
  );
}

