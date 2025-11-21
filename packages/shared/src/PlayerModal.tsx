import { useState, useEffect } from 'react';
import { getGlobalConfig, setGlobalConfig, pickAvatarFile, saveAvatarFile, readAvatarFile, bufferToDataURL, type Player } from './config-browser';

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PlayerModal({ isOpen, onClose }: PlayerModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Player>({ id: '', name: '', avatar: '' });
  const [editFormAvatarPreview, setEditFormAvatarPreview] = useState<string | null>(null);
  const [editFormAvatarFile, setEditFormAvatarFile] = useState<Uint8Array | null>(null);
  const [newPlayer, setNewPlayer] = useState<Player>({ id: '', name: '', avatar: '' });
  const [newPlayerAvatarPreview, setNewPlayerAvatarPreview] = useState<string | null>(null);
  const [newPlayerAvatarFile, setNewPlayerAvatarFile] = useState<Uint8Array | null>(null);
  const [avatarPreviews, setAvatarPreviews] = useState<Record<string, string>>({});

  // Load players when modal opens
  useEffect(() => {
    if (isOpen) {
      loadPlayers();
    }
  }, [isOpen]);

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

  const savePlayers = async (updatedPlayers: Player[]) => {
    setLoading(true);
    try {
      await setGlobalConfig('players', updatedPlayers);
      setPlayers(updatedPlayers);
    } catch (error) {
      console.error('Failed to save players:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatarForNew = async () => {
    try {
      const result = await pickAvatarFile();
      if (result) {
        setNewPlayerAvatarFile(result.buffer);
        setNewPlayerAvatarPreview(bufferToDataURL(result.buffer));
      }
    } catch (error) {
      console.error('Failed to pick avatar file:', error);
      alert('Failed to pick avatar file. Please try again.');
    }
  };

  const handlePickAvatarForEdit = async () => {
    try {
      const result = await pickAvatarFile();
      if (result) {
        setEditFormAvatarFile(result.buffer);
        setEditFormAvatarPreview(bufferToDataURL(result.buffer));
      }
    } catch (error) {
      console.error('Failed to pick avatar file:', error);
      alert('Failed to pick avatar file. Please try again.');
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.name.trim()) return;

    const uuid = generateUUID();
    let avatarPath = '';

    // Save avatar file if one was selected
    if (newPlayerAvatarFile) {
      try {
        avatarPath = await saveAvatarFile(uuid, newPlayerAvatarFile);
      } catch (error) {
        console.error('Failed to save avatar:', error);
        alert('Failed to save avatar file. Player will be created without avatar.');
      }
    }

    const player: Player = {
      id: uuid,
      name: newPlayer.name.trim(),
      avatar: avatarPath
    };

    const updatedPlayers = [...players, player];
    await savePlayers(updatedPlayers);
    
    // Reset form
    setNewPlayer({ id: '', name: '', avatar: '' });
    setNewPlayerAvatarFile(null);
    setNewPlayerAvatarPreview(null);
    
    // Update preview
    if (avatarPath && newPlayerAvatarFile) {
      setAvatarPreviews({ ...avatarPreviews, [uuid]: newPlayerAvatarPreview || '' });
    }
  };

  const handleStartEdit = (index: number) => {
    const player = players[index];
    setEditingIndex(index);
    setEditForm({ ...player });
    setEditFormAvatarFile(null);
    setEditFormAvatarPreview(avatarPreviews[player.id] || null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ id: '', name: '', avatar: '' });
    setEditFormAvatarFile(null);
    setEditFormAvatarPreview(null);
  };

  const handleSaveEdit = async (index: number) => {
    if (!editForm.name.trim()) return;

    const existingPlayer = players[index];
    let avatarPath = editForm.avatar;

    // Save new avatar file if one was selected
    if (editFormAvatarFile) {
      try {
        avatarPath = await saveAvatarFile(existingPlayer.id, editFormAvatarFile);
      } catch (error) {
        console.error('Failed to save avatar:', error);
        alert('Failed to save avatar file. Player will be updated without new avatar.');
        // Keep existing avatar path
        avatarPath = existingPlayer.avatar;
      }
    }

    const updatedPlayer: Player = {
      ...editForm,
      avatar: avatarPath
    };

    const updatedPlayers = [...players];
    updatedPlayers[index] = updatedPlayer;
    await savePlayers(updatedPlayers);
    
    setEditingIndex(null);
    setEditForm({ id: '', name: '', avatar: '' });
    setEditFormAvatarFile(null);
    setEditFormAvatarPreview(null);
    
    // Update preview if new avatar was saved
    if (editFormAvatarFile && editFormAvatarPreview) {
      setAvatarPreviews({ ...avatarPreviews, [existingPlayer.id]: editFormAvatarPreview });
    }
  };

  const handleDelete = async (index: number) => {
    if (window.confirm(`Are you sure you want to delete ${players[index].name}?`)) {
      const updatedPlayers = players.filter((_, i) => i !== index);
      await savePlayers(updatedPlayers);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isOpen ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 1000,
        backdropFilter: isOpen ? 'blur(4px)' : 'none',
        paddingRight: '2rem',
        transition: 'background-color 0.3s ease-in-out',
        pointerEvents: isOpen ? 'auto' : 'none',
        visibility: isOpen ? 'visible' : 'hidden',
        opacity: isOpen ? 1 : 0,
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-in-out',
          marginLeft: 'auto',
          marginRight: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Manage Players</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
              padding: '0.25rem 0.5rem',
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading && <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>Loading...</div>}

        {/* Add New Player Form */}
        <form onSubmit={handleAddPlayer} style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '0.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>Add New Player</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
            <input
              type="text"
              placeholder="Player name"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '0.25rem',
                fontSize: '1rem',
              }}
              required
            />
            <button
              type="button"
              onClick={handlePickAvatarForNew}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
              }}
            >
              Choose Avatar
            </button>
          </div>
          {newPlayerAvatarPreview && (
            <div style={{ marginBottom: '0.5rem' }}>
              <img
                src={newPlayerAvatarPreview}
                alt="Avatar preview"
                style={{
                  width: '64px',
                  height: '64px',
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  border: '2px solid #ddd',
                }}
              />
            </div>
          )}
          <button
            type="submit"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Add Player
          </button>
        </form>

        {/* Players List */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>Players</h3>
          {players.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No players yet. Add one above!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {players.map((player, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '0.5rem',
                    border: '1px solid #e0e0e0',
                  }}
                >
                  {editingIndex === index ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder="Name"
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: '1px solid #ddd',
                            borderRadius: '0.25rem',
                            fontSize: '1rem',
                          }}
                        />
                        <button
                          type="button"
                          onClick={handlePickAvatarForEdit}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Choose Avatar
                        </button>
                      </div>
                      {(editFormAvatarPreview || avatarPreviews[player.id]) && (
                        <img
                          src={editFormAvatarPreview || avatarPreviews[player.id]}
                          alt="Avatar preview"
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'cover',
                            borderRadius: '0.5rem',
                            border: '2px solid #ddd',
                          }}
                        />
                      )}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleSaveEdit(index)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#48bb78',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#999',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        {avatarPreviews[player.id] && (
                          <img
                            src={avatarPreviews[player.id]}
                            alt={`${player.name} avatar`}
                            style={{
                              width: '48px',
                              height: '48px',
                              objectFit: 'cover',
                              borderRadius: '0.5rem',
                              border: '2px solid #ddd',
                            }}
                          />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>{player.name}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartEdit(index)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#f56565',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

