import { useState, useEffect } from 'react';
import { getGlobalConfig, setGlobalConfig, pickAvatarFile, saveAvatarFile, readAvatarFile, bufferToDataURL, type Character } from './config-browser';

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CharacterModal({ isOpen, onClose }: CharacterModalProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Character>({ id: '', name: '', avatar: '' });
  const [editFormAvatarPreview, setEditFormAvatarPreview] = useState<string | null>(null);
  const [editFormAvatarFile, setEditFormAvatarFile] = useState<Uint8Array | null>(null);
  const [newCharacter, setNewCharacter] = useState<Character>({ id: '', name: '', avatar: '' });
  const [newCharacterAvatarPreview, setNewCharacterAvatarPreview] = useState<string | null>(null);
  const [newCharacterAvatarFile, setNewCharacterAvatarFile] = useState<Uint8Array | null>(null);
  const [avatarPreviews, setAvatarPreviews] = useState<Record<string, string>>({});

  // Load characters when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCharacters();
    }
  }, [isOpen]);

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

  const saveCharacters = async (updatedCharacters: Character[]) => {
    setLoading(true);
    try {
      await setGlobalConfig('characters', updatedCharacters);
      setCharacters(updatedCharacters);
    } catch (error) {
      console.error('Failed to save characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickAvatarForNew = async () => {
    try {
      const result = await pickAvatarFile();
      if (result) {
        setNewCharacterAvatarFile(result.buffer);
        setNewCharacterAvatarPreview(bufferToDataURL(result.buffer));
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

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharacter.name.trim()) return;

    const uuid = generateUUID();
    let avatarPath = '';

    // Save avatar file if one was selected
    if (newCharacterAvatarFile) {
      try {
        avatarPath = await saveAvatarFile(uuid, newCharacterAvatarFile);
      } catch (error) {
        console.error('Failed to save avatar:', error);
        alert('Failed to save avatar file. Character will be created without avatar.');
      }
    }

    const character: Character = {
      id: uuid,
      name: newCharacter.name.trim(),
      avatar: avatarPath
    };

    const updatedCharacters = [...characters, character];
    await saveCharacters(updatedCharacters);
    
    // Reset form
    setNewCharacter({ id: '', name: '', avatar: '' });
    setNewCharacterAvatarFile(null);
    setNewCharacterAvatarPreview(null);
    
    // Update preview
    if (avatarPath && newCharacterAvatarFile) {
      setAvatarPreviews({ ...avatarPreviews, [uuid]: newCharacterAvatarPreview || '' });
    }
  };

  const handleStartEdit = (index: number) => {
    const character = characters[index];
    setEditingIndex(index);
    setEditForm({ ...character });
    setEditFormAvatarFile(null);
    setEditFormAvatarPreview(avatarPreviews[character.id] || null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm({ id: '', name: '', avatar: '' });
    setEditFormAvatarFile(null);
    setEditFormAvatarPreview(null);
  };

  const handleSaveEdit = async (index: number) => {
    if (!editForm.name.trim()) return;

    const existingCharacter = characters[index];
    let avatarPath = editForm.avatar;

    // Save new avatar file if one was selected
    if (editFormAvatarFile) {
      try {
        avatarPath = await saveAvatarFile(existingCharacter.id, editFormAvatarFile);
      } catch (error) {
        console.error('Failed to save avatar:', error);
        alert('Failed to save avatar file. Character will be updated without new avatar.');
        // Keep existing avatar path
        avatarPath = existingCharacter.avatar;
      }
    }

    const updatedCharacter: Character = {
      ...editForm,
      avatar: avatarPath
    };

    const updatedCharacters = [...characters];
    updatedCharacters[index] = updatedCharacter;
    await saveCharacters(updatedCharacters);
    
    setEditingIndex(null);
    setEditForm({ id: '', name: '', avatar: '' });
    setEditFormAvatarFile(null);
    setEditFormAvatarPreview(null);
    
    // Update preview if new avatar was saved
    if (editFormAvatarFile && editFormAvatarPreview) {
      setAvatarPreviews({ ...avatarPreviews, [existingCharacter.id]: editFormAvatarPreview });
    }
  };

  const handleDelete = async (index: number) => {
    if (window.confirm(`Are you sure you want to delete ${characters[index].name}?`)) {
      const updatedCharacters = characters.filter((_, i) => i !== index);
      await saveCharacters(updatedCharacters);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
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
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#333' }}>Manage Characters</h2>
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

        {/* Add New Character Form */}
        <form onSubmit={handleAddCharacter} style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '0.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>Add New Character</h3>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
            <input
              type="text"
              placeholder="Character name"
              value={newCharacter.name}
              onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
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
          {newCharacterAvatarPreview && (
            <div style={{ marginBottom: '0.5rem' }}>
              <img
                src={newCharacterAvatarPreview}
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
            Add Character
          </button>
        </form>

        {/* Characters List */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>Characters</h3>
          {characters.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No characters yet. Add one above!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {characters.map((character, index) => (
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
                      {(editFormAvatarPreview || avatarPreviews[character.id]) && (
                        <img
                          src={editFormAvatarPreview || avatarPreviews[character.id]}
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
                        {avatarPreviews[character.id] && (
                          <img
                            src={avatarPreviews[character.id]}
                            alt={`${character.name} avatar`}
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
                          <div style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.25rem' }}>{character.name}</div>
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

