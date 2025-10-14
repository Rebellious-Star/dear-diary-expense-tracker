import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const CustomBackground: React.FC = () => {
  const { backgroundImage } = useTheme();

  // Memoize the background style to prevent unnecessary re-renders
  const backgroundStyle = useMemo(() => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -2,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    willChange: 'opacity',
    transform: 'translateZ(0)', // Hardware acceleration
  }), [backgroundImage]);

  // Memoize the overlay style
  const overlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(244, 241, 232, 0.85) 0%, rgba(232, 220, 192, 0.88) 100%)',
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)', // Safari support
    willChange: 'opacity',
    transform: 'translateZ(0)', // Hardware acceleration
  }), []);

  if (!backgroundImage) {
    return null;
  }

  return (
    <div style={backgroundStyle}>
      {/* Translucent overlay to maintain elegance and readability */}
      <div style={overlayStyle} />
    </div>
  );
};

export default React.memo(CustomBackground);
