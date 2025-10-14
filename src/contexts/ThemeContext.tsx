import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primaryBeige: string;
  secondaryBeige: string;
  accentBrown: string;
  lightBrown: string;
  darkBrown: string;
  farmGreen: string;
  barnRed: string;
  wheatGold: string;
  soilBrown: string;
}

interface ThemePreset {
  name: string;
  colors: ThemeColors;
  icon: string;
}

interface ThemeContextType {
  backgroundImage: string | null;
  currentTheme: string;
  customColors: ThemeColors | null;
  setBackgroundImage: (image: string | null) => void;
  setCurrentTheme: (theme: string) => void;
  setCustomColors: (colors: ThemeColors | null) => void;
  themePresets: ThemePreset[];
  resetTheme: () => void;
}

const defaultColors: ThemeColors = {
  primaryBeige: '#f4f1e8',
  secondaryBeige: '#e8dcc0',
  accentBrown: '#8b4513',
  lightBrown: '#d2b48c',
  darkBrown: '#654321',
  farmGreen: '#9acd32',
  barnRed: '#cd5c5c',
  wheatGold: '#f0e68c',
  soilBrown: '#8b7355',
};

const themePresets: ThemePreset[] = [
  {
    name: 'Classic Farm',
    icon: '🌾',
    colors: defaultColors,
  },
  {
    name: 'Sunset Farm',
    icon: '🌅',
    colors: {
      primaryBeige: '#ffe4c4',
      secondaryBeige: '#ffd4a3',
      accentBrown: '#d2691e',
      lightBrown: '#deb887',
      darkBrown: '#8b4513',
      farmGreen: '#ff8c00',
      barnRed: '#ff6347',
      wheatGold: '#ffa500',
      soilBrown: '#cd853f',
    },
  },
  {
    name: 'Forest Farm',
    icon: '🌲',
    colors: {
      primaryBeige: '#e8f5e9',
      secondaryBeige: '#c8e6c9',
      accentBrown: '#4e342e',
      lightBrown: '#8d6e63',
      darkBrown: '#3e2723',
      farmGreen: '#2e7d32',
      barnRed: '#c62828',
      wheatGold: '#f9a825',
      soilBrown: '#5d4037',
    },
  },
  {
    name: 'Lavender Farm',
    icon: '💜',
    colors: {
      primaryBeige: '#f3e5f5',
      secondaryBeige: '#e1bee7',
      accentBrown: '#6a1b9a',
      lightBrown: '#ba68c8',
      darkBrown: '#4a148c',
      farmGreen: '#7b1fa2',
      barnRed: '#c2185b',
      wheatGold: '#ffd54f',
      soilBrown: '#8e24aa',
    },
  },
  {
    name: 'Ocean Farm',
    icon: '🌊',
    colors: {
      primaryBeige: '#e0f7fa',
      secondaryBeige: '#b2ebf2',
      accentBrown: '#006064',
      lightBrown: '#4dd0e1',
      darkBrown: '#00363a',
      farmGreen: '#00897b',
      barnRed: '#e53935',
      wheatGold: '#ffd54f',
      soilBrown: '#00695c',
    },
  },
  {
    name: 'Autumn Farm',
    icon: '🍂',
    colors: {
      primaryBeige: '#fff3e0',
      secondaryBeige: '#ffe0b2',
      accentBrown: '#bf360c',
      lightBrown: '#ff8a65',
      darkBrown: '#8d3a00',
      farmGreen: '#ef6c00',
      barnRed: '#d84315',
      wheatGold: '#ffb74d',
      soilBrown: '#e64a19',
    },
  },
  {
    name: 'Midnight Farm',
    icon: '🌙',
    colors: {
      primaryBeige: '#263238',
      secondaryBeige: '#37474f',
      accentBrown: '#cfd8dc',
      lightBrown: '#90a4ae',
      darkBrown: '#eceff1',
      farmGreen: '#66bb6a',
      barnRed: '#ef5350',
      wheatGold: '#ffee58',
      soilBrown: '#78909c',
    },
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [backgroundImage, setBackgroundImageState] = useState<string | null>(null);
  const [currentTheme, setCurrentThemeState] = useState<string>('Classic Farm');
  const [customColors, setCustomColorsState] = useState<ThemeColors | null>(null);

  // Load saved theme from localStorage
  useEffect(() => {
    try {
      const savedBg = localStorage.getItem('theme-background');
      const savedTheme = localStorage.getItem('theme-preset');
      const savedColors = localStorage.getItem('theme-custom-colors');

      if (savedBg) setBackgroundImageState(savedBg);
      if (savedTheme) setCurrentThemeState(savedTheme);
      if (savedColors) setCustomColorsState(JSON.parse(savedColors));
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error);
    }
  }, []);

  // Apply theme colors to CSS variables with requestAnimationFrame for smooth updates
  useEffect(() => {
    const colors = customColors || themePresets.find(p => p.name === currentTheme)?.colors || defaultColors;
    
    // Use requestAnimationFrame to batch DOM updates and prevent layout thrashing
    requestAnimationFrame(() => {
      const root = document.documentElement;
      root.style.setProperty('--primary-beige', colors.primaryBeige);
      root.style.setProperty('--secondary-beige', colors.secondaryBeige);
      root.style.setProperty('--accent-brown', colors.accentBrown);
      root.style.setProperty('--light-brown', colors.lightBrown);
      root.style.setProperty('--dark-brown', colors.darkBrown);
      root.style.setProperty('--farm-green', colors.farmGreen);
      root.style.setProperty('--barn-red', colors.barnRed);
      root.style.setProperty('--wheat-gold', colors.wheatGold);
      root.style.setProperty('--soil-brown', colors.soilBrown);
    });
  }, [currentTheme, customColors]);

  const setBackgroundImage = (image: string | null) => {
    setBackgroundImageState(image);
    if (image) {
      localStorage.setItem('theme-background', image);
    } else {
      localStorage.removeItem('theme-background');
    }
  };

  const setCurrentTheme = (theme: string) => {
    setCurrentThemeState(theme);
    localStorage.setItem('theme-preset', theme);
    setCustomColorsState(null);
    localStorage.removeItem('theme-custom-colors');
  };

  const setCustomColors = (colors: ThemeColors | null) => {
    setCustomColorsState(colors);
    if (colors) {
      localStorage.setItem('theme-custom-colors', JSON.stringify(colors));
    } else {
      localStorage.removeItem('theme-custom-colors');
    }
  };

  const resetTheme = () => {
    setBackgroundImageState(null);
    setCurrentThemeState('Classic Farm');
    setCustomColorsState(null);
    localStorage.removeItem('theme-background');
    localStorage.removeItem('theme-preset');
    localStorage.removeItem('theme-custom-colors');
  };

  return (
    <ThemeContext.Provider
      value={{
        backgroundImage,
        currentTheme,
        customColors,
        setBackgroundImage,
        setCurrentTheme,
        setCustomColors,
        themePresets,
        resetTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
