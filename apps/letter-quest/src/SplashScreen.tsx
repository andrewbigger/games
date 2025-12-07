import { useEffect } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-cube-container">
        <div className="splash-cube">
          <div className="cube-face cube-front">?</div>
          <div className="cube-face cube-back">?</div>
          <div className="cube-face cube-right">?</div>
          <div className="cube-face cube-left">?</div>
          <div className="cube-face cube-top">?</div>
          <div className="cube-face cube-bottom">?</div>
        </div>
      </div>
    </div>
  );
}

