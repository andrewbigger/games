import { useState, useEffect } from 'react';
import { getGlobalConfig, readAvatarFile, bufferToDataURL, type Player } from '@games/shared';
import { QuitModal } from './QuitModal';
import './PlayerSelectionScreen.css';

interface PlayerSelectionScreenProps {
  onPlayerSelect: (player: Player) => void;
}

export function PlayerSelectionScreen({ onPlayerSelect }: PlayerSelectionScreenProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [avatarPreviews, setAvatarPreviews] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showQuitModal, setShowQuitModal] = useState(false);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    try {
      const playersData = (await getGlobalConfig('players')) as Player[] | undefined;
      const loadedPlayers = playersData || [];
      setPlayers(loadedPlayers);

      // Load avatar previews
      const previews: Record<string, string> = {};
      for (const player of loadedPlayers) {
        if (player.avatar) {
          try {
            const buffer = await readAvatarFile(player.avatar);
            previews[player.id] = bufferToDataURL(buffer);
          } catch (error) {
            console.error(`Failed to load avatar for player ${player.id}:`, error);
          }
        }
      }
      setAvatarPreviews(previews);
    } catch (error) {
      console.error('Failed to load players:', error);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (player: Player) => {
    onPlayerSelect(player);
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
        <h2 className="player-selection-title">Choose Your Player</h2>
        {loading ? (
          <div className="player-selection-loading">Loading players...</div>
        ) : players.length === 0 ? (
          <div className="player-selection-empty">
            <p>No players available.</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
              Press Cmd+Shift+P to manage players
            </p>
          </div>
        ) : (
          <div className="player-avatars-row">
            {players.map((player, index) => (
              <div
                key={player.id || `player-${index}`}
                className="player-avatar-item"
                onClick={() => handlePlayerClick(player)}
              >
                <div className="player-avatar-container">
                  {avatarPreviews[player.id] ? (
                    <img
                      src={avatarPreviews[player.id]}
                      alt={player.name}
                      className="player-avatar-image"
                    />
                  ) : (
                    <div className="player-avatar-placeholder">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="player-avatar-name">{player.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

