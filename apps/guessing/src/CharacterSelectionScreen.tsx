import { useState, useEffect } from 'react';
import { getGlobalConfig, readAvatarFile, bufferToDataURL, type Character } from '@games/shared';
import { QuitModal } from './QuitModal';
import './PlayerSelectionScreen.css';

interface CharacterSelectionScreenProps {
  selectedPlayer: { id: string; name: string; avatar: string };
  onCharacterSelect: (character: Character) => void;
}

export function CharacterSelectionScreen({ selectedPlayer: _selectedPlayer, onCharacterSelect }: CharacterSelectionScreenProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [avatarPreviews, setAvatarPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const charactersData = (await getGlobalConfig('characters')) as Character[] | undefined;
      const loadedCharacters = charactersData || [];
      setCharacters(loadedCharacters);

      // Load avatar previews
      const previews: Record<string, string> = {};
      for (const character of loadedCharacters) {
        if (character.avatar) {
          try {
            const buffer = await readAvatarFile(character.avatar);
            previews[character.id] = bufferToDataURL(buffer);
          } catch (error) {
            console.error(`Failed to load avatar for character ${character.id}:`, error);
          }
        }
      }
      setAvatarPreviews(previews);
    } catch (error) {
      console.error('Failed to load characters:', error);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCharacterClick = (character: Character) => {
    onCharacterSelect(character);
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
    <div className="player-selection-screen">
      <QuitModal isOpen={showQuitModal} onConfirm={handleQuitConfirm} onCancel={handleQuitCancel} />
      <button className="screen-quit-button" onClick={handleQuit} aria-label="Quit application">
        <span className="screen-quit-icon">⏹</span>
      </button>
      <div className="player-selection-content">
        <h2 className="player-selection-title">Choose Character</h2>
        {loading ? (
          <div className="player-selection-loading">Loading characters...</div>
        ) : characters.length === 0 ? (
          <div className="player-selection-empty">
            <p>No characters available.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
              Press Cmd+Shift+C to manage characters
            </p>
          </div>
        ) : (
          <div className="player-avatars-row">
            {characters.map((character, index) => (
              <div
                key={character.id || `character-${index}`}
                className="player-avatar-item"
                onClick={() => handleCharacterClick(character)}
              >
                <div className="player-avatar-container">
                  {avatarPreviews[character.id] ? (
                    <img
                      src={avatarPreviews[character.id]}
                      alt={character.name}
                      className="player-avatar-image"
                    />
                  ) : (
                    <div className="player-avatar-placeholder">
                      {character.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="player-avatar-name">{character.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

