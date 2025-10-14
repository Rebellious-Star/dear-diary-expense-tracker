import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Palette, RotateCcw, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const ThemePage: React.FC = () => {
  const { backgroundImage, currentTheme, setBackgroundImage, setCurrentTheme, themePresets, resetTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary-beige) 0%, var(--secondary-beige) 100%)' }}>
      <Navbar />
      
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '2rem' }}
        >
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)',
            fontFamily: 'var(--font-accent)',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
          }}>
            <Sparkles size={40} />
            Theme Customization
            <Sparkles size={40} />
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--dark-brown)',
            maxWidth: '700px',
            margin: '0 auto',
          }}>
            Personalize your experience with custom backgrounds and beautiful color themes
          </p>
        </motion.div>

        {/* Top Section: Background Upload and Color Preview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem',
          marginBottom: '3rem' 
        }}>
          {/* Background Image Section */}
          <motion.section
            className="translucent-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: 'var(--accent-brown)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <ImageIcon size={24} />
              Custom Background
            </h3>

            <div style={{ padding: '1rem' }}>
              {(backgroundImage || previewImage) ? (
                <div>
                  <div style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    border: '3px solid var(--light-brown)',
                    boxShadow: 'var(--medium-shadow)',
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
                    <Upload size={16} style={{ marginRight: '0.5rem' }} />
                    Remove Background
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '100%',
                    height: '200px',
                    borderRadius: '12px',
                    border: '3px dashed var(--light-brown)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    background: 'rgba(210, 180, 140, 0.1)',
                    cursor: 'pointer',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={48} color="var(--light-brown)" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--dark-brown)', fontSize: '1.1rem', fontWeight: '600' }}>
                      Click to upload background
                    </p>
                  </div>
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
                    marginTop: '0.75rem', 
                    fontSize: '0.9rem', 
                    color: 'var(--dark-brown)',
                    textAlign: 'center',
                  }}>
                    Max size: 3MB • Formats: JPG, PNG, GIF
                    <br />
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                      Large images will be auto-optimized
                    </span>
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Color Preview Section */}
          <motion.section
            className="translucent-card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: 'var(--accent-brown)',
              marginBottom: '1.5rem',
            }}>
              Current Colors
            </h3>

            <div style={{ padding: '1rem' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '1rem',
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
                      height: '60px',
                      background: `var(${color.var})`,
                      borderRadius: '12px',
                      border: '3px solid var(--light-brown)',
                      marginBottom: '0.5rem',
                      boxShadow: 'var(--soft-shadow)',
                    }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--dark-brown)', fontWeight: '600' }}>
                      {color.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>

        {/* Theme Presets Section */}
        <motion.section
          className="translucent-card"
          style={{ marginBottom: '2rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h3 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: 'var(--accent-brown)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <Palette size={28} />
            Theme Presets
          </h3>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {themePresets.map((preset, index) => (
              <motion.button
                key={preset.name}
                onClick={() => handleThemeSelect(preset.name)}
                className="translucent-card"
                style={{
                  padding: '2rem 1rem',
                  cursor: 'pointer',
                  border: currentTheme === preset.name 
                    ? '4px solid var(--farm-green)' 
                    : '3px solid var(--light-brown)',
                  background: currentTheme === preset.name
                    ? 'rgba(154, 205, 50, 0.2)'
                    : 'rgba(244, 241, 232, 0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1rem',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  minHeight: '150px',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentTheme === preset.name && (
                  <motion.div 
                    style={{ position: 'absolute', top: '15px', right: '15px' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500 }}
                  >
                    <Check size={24} color="var(--farm-green)" strokeWidth={3} />
                  </motion.div>
                )}
                <span style={{ fontSize: '3.5rem' }}>{preset.icon}</span>
                <span style={{ 
                  fontWeight: currentTheme === preset.name ? 'bold' : '600',
                  color: 'var(--accent-brown)',
                  textAlign: 'center',
                  fontSize: '1.1rem',
                }}>
                  {preset.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Reset Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <button
            onClick={handleResetTheme}
            className="btn-secondary"
            style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
          >
            <RotateCcw size={20} style={{ marginRight: '0.75rem' }} />
            Reset to Default Theme
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ThemePage;
