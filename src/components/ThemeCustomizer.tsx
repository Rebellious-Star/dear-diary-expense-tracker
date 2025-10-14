import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Palette, RotateCcw, Settings, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { backgroundImage, currentTheme, setBackgroundImage, setCurrentTheme, themePresets, resetTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Debug: Log theme presets
  console.log('ThemeCustomizer - Theme Presets:', themePresets);
  console.log('ThemeCustomizer - Current Theme:', currentTheme);
  console.log('ThemeCustomizer - Is Open:', isOpen);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    // Validate file size (max 3MB for better performance)
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image size should be less than 3MB for optimal performance');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Create an image to compress if needed
      const img = new Image();
      img.onload = () => {
        // If image is too large, compress it
        if (img.width > 1920 || img.height > 1080) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDim = 1920;
          
          if (width > height && width > maxDim) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else if (height > maxDim) {
            width = (width * maxDim) / height;
            height = maxDim;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with compression
          const compressedResult = canvas.toDataURL('image/jpeg', 0.85);
          setPreviewImage(compressedResult);
          setBackgroundImage(compressedResult);
          toast.success('Background image uploaded and optimized!');
        } else {
          setPreviewImage(result);
          setBackgroundImage(result);
          toast.success('Background image uploaded successfully!');
        }
      };
      img.src = result;
    };
    reader.onerror = () => {
      toast.error('Failed to upload image');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = () => {
    setBackgroundImage(null);
    setPreviewImage(null);
    toast.success('Background image removed');
  };

  const handleThemeSelect = (themeName: string) => {
    setCurrentTheme(themeName);
    toast.success(`Theme changed to ${themeName}`);
  };

  const handleResetTheme = () => {
    resetTheme();
    setPreviewImage(null);
    toast.success('Theme reset to default');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Customizer Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '90vh',
              background: 'var(--primary-beige)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              zIndex: 1000,
              overflowY: 'auto',
              padding: '2.5rem',
              borderRadius: '20px',
              border: '3px solid var(--light-brown)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: 'bold', 
                color: 'var(--accent-brown)',
                fontFamily: 'var(--font-accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Settings size={28} />
                Theme Customizer
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 69, 19, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={24} color="var(--accent-brown)" />
              </button>
            </div>

            {/* Top Section: Background Upload and Color Preview */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '2rem',
              marginBottom: '2rem' 
            }}>
              {/* Background Image Section */}
              <section>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: 'var(--accent-brown)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Upload size={20} />
                  Custom Background
                </h3>

              <div className="translucent-card" style={{ padding: '1.5rem' }}>
                {(backgroundImage || previewImage) ? (
                  <div>
                    <div style={{
                      width: '100%',
                      height: '150px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                      border: '2px solid var(--light-brown)',
                    }}>
                      <img
                        src={backgroundImage || previewImage || ''}
                        alt="Background preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                    <button
                      onClick={handleRemoveBackground}
                      className="btn-secondary"
                      style={{ width: '100%' }}
                    >
                      <X size={16} style={{ marginRight: '0.5rem' }} />
                      Remove Background
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                      style={{ width: '100%' }}
                    >
                      <Upload size={16} style={{ marginRight: '0.5rem' }} />
                      Upload Background Image
                    </button>
                    <p style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.85rem', 
                      color: 'var(--dark-brown)',
                      textAlign: 'center',
                    }}>
                      Max size: 3MB • Formats: JPG, PNG, GIF
                      <br />
                      <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        Large images will be auto-optimized
                      </span>
                    </p>
                  </div>
                )}
              </div>
              </section>

              {/* Color Preview Section */}
              <section>
                <h3 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold', 
                  color: 'var(--accent-brown)',
                  marginBottom: '1rem',
                }}>
                  Current Colors
                </h3>

                <div className="translucent-card" style={{ padding: '1rem' }}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '0.75rem',
                  }}>
                    {[
                      { name: 'Primary', var: '--primary-beige' },
                      { name: 'Accent', var: '--accent-brown' },
                      { name: 'Green', var: '--farm-green' },
                      { name: 'Brown', var: '--light-brown' },
                      { name: 'Red', var: '--barn-red' },
                      { name: 'Gold', var: '--wheat-gold' },
                    ].map((color) => (
                      <div key={color.name} style={{ textAlign: 'center' }}>
                        <div style={{
                          width: '100%',
                          height: '40px',
                          background: `var(${color.var})`,
                          borderRadius: '8px',
                          border: '2px solid var(--light-brown)',
                          marginBottom: '0.25rem',
                        }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--dark-brown)' }}>
                          {color.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Theme Presets Section */}
            <section style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                color: 'var(--accent-brown)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Palette size={20} />
                Theme Presets
              </h3>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '1rem' 
              }}>
                {themePresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleThemeSelect(preset.name)}
                    className="translucent-card"
                    style={{
                      padding: '1.5rem',
                      cursor: 'pointer',
                      border: currentTheme === preset.name 
                        ? '3px solid var(--farm-green)' 
                        : '2px solid var(--light-brown)',
                      background: currentTheme === preset.name
                        ? 'rgba(154, 205, 50, 0.15)'
                        : 'rgba(244, 241, 232, 0.9)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      minHeight: '120px',
                    }}
                  >
                    {currentTheme === preset.name && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <Check size={20} color="var(--farm-green)" />
                      </div>
                    )}
                    <span style={{ fontSize: '2.5rem' }}>{preset.icon}</span>
                    <span style={{ 
                      fontWeight: currentTheme === preset.name ? 'bold' : '600',
                      color: 'var(--accent-brown)',
                      textAlign: 'center',
                    }}>
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            {/* Reset Button */}
            <button
              onClick={handleResetTheme}
              className="btn-secondary"
              style={{ width: '100%', marginTop: '1rem' }}
            >
              <RotateCcw size={16} style={{ marginRight: '0.5rem' }} />
              Reset to Default Theme
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThemeCustomizer;
