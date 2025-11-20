import { useState } from 'react';
import { greet, DEFAULT_GAME_CONFIG, type GameConfig } from '@games/shared';
import './App.css';

function App() {
  const [config, setConfig] = useState<GameConfig>(DEFAULT_GAME_CONFIG);

  return (
    <div className="app">
      <header className="app-header">
        <h1>{config.title}</h1>
        <p>{greet('Player')} Welcome to the Guessing Game!</p>
        <div className="game-info">
          <p>Version: {config.version}</p>
          <p>Dimensions: {config.width} x {config.height}</p>
        </div>
        <p className="shared-lib-note">
          This component imports from <code>@games/shared</code> to demonstrate workspace linking.
        </p>
      </header>
    </div>
  );
}

export default App;

