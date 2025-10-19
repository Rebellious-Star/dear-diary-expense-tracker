import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Lock, 
  Palette, 
  Database, 
  Download, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  Mail,
  Shield,
  Moon,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

interface UserSettings {
  notifications: boolean;
  soundEffects: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  currency: string;
  language: string;
}

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentTheme, resetTheme } = useTheme();
  
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    soundEffects: true,
    emailNotifications: false,
    darkMode: false,
    currency: 'USD',
    language: 'en',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load settings from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(`settings:${user?.id}`);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      // Check dark mode from DOM
      const isDark = document.documentElement.classList.contains('dark');
      setSettings(prev => ({ ...prev, darkMode: isDark }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [user?.id]);

  // Save settings to localStorage
  const saveSettings = (newSettings: UserSettings) => {
    try {
      localStorage.setItem(`settings:${user?.id}`, JSON.stringify(newSettings));
      setSettings(newSettings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleToggleSetting = (key: keyof UserSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    
    // Handle dark mode toggle
    if (key === 'darkMode') {
      const root = document.documentElement;
      root.classList.toggle('dark');
      try { 
        localStorage.setItem('theme', newSettings.darkMode ? 'dark' : 'light'); 
      } catch {}
    }
    
    saveSettings(newSettings);
  };

  const handleCurrencyChange = (currency: string) => {
    const newSettings = { ...settings, currency };
    saveSettings(newSettings);
  };

  const handleLanguageChange = (language: string) => {
    const newSettings = { ...settings, language };
    saveSettings(newSettings);
  };

  const handlePasswordChange = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // In a real app, this would call an API
    toast.success('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleExportData = () => {
    try {
      const expenses = localStorage.getItem(`expenses:${user?.id}`) || '[]';
      const userData = {
        user: user,
        expenses: JSON.parse(expenses),
        settings: settings,
        exportDate: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dear-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your expense data? This action cannot be undone!')) {
      try {
        localStorage.removeItem(`expenses:${user?.id}`);
        toast.success('All expense data cleared');
      } catch (error) {
        toast.error('Failed to clear data');
      }
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone!')) {
      if (window.confirm('This is your final warning. Are you absolutely sure?')) {
        // In a real app, this would call an API
        toast.success('Account deletion requested. Logging out...');
        setTimeout(() => {
          logout();
        }, 2000);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--primary-beige) 0%, var(--secondary-beige) 100%)' }}>
      <Navbar />
      
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
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
            <SettingsIcon size={40} />
            Settings
          </h1>
          <p style={{
            fontSize: '1.2rem',
            color: 'var(--dark-brown)',
            maxWidth: '700px',
            margin: '0 auto',
          }}>
            Manage your account, preferences, and application settings
          </p>
        </motion.div>

        {/* Account Information Section */}
        <motion.section
          className="translucent-card"
          style={{ marginBottom: '2rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
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
            <User size={28} />
            Account Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(210, 180, 140, 0.1)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <User size={18} color="var(--accent-brown)" />
                <span style={{ fontWeight: 'bold', color: 'var(--accent-brown)' }}>Username</span>
              </div>
              <p style={{ fontSize: '1.1rem', color: 'var(--dark-brown)' }}>{user?.username}</p>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(210, 180, 140, 0.1)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Mail size={18} color="var(--accent-brown)" />
                <span style={{ fontWeight: 'bold', color: 'var(--accent-brown)' }}>Email</span>
              </div>
              <p style={{ fontSize: '1.1rem', color: 'var(--dark-brown)' }}>{user?.email}</p>
            </div>

            {user?.isAdmin && (
              <div style={{ padding: '1rem', background: 'rgba(154, 205, 50, 0.2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Shield size={18} color="var(--farm-green)" />
                  <span style={{ fontWeight: 'bold', color: 'var(--farm-green)' }}>Role</span>
                </div>
                <p style={{ fontSize: '1.1rem', color: 'var(--farm-green)', fontWeight: 'bold' }}>Administrator</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* Preferences Section */}
        <motion.section
          className="translucent-card"
          style={{ marginBottom: '2rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
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
            <Bell size={28} />
            Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Dark Mode Toggle */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(210, 180, 140, 0.1)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {settings.darkMode ? <Moon size={24} color="var(--accent-brown)" /> : <Sun size={24} color="var(--accent-brown)" />}
                <div>
                  <p style={{ fontWeight: 'bold', color: 'var(--accent-brown)', marginBottom: '0.25rem' }}>
                    Dark Mode
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--dark-brown)', opacity: 0.8 }}>
                    Switch between light and dark themes
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting('darkMode')}
                className={settings.darkMode ? 'btn-primary' : 'btn-secondary'}
                style={{ minWidth: '80px' }}
              >
                {settings.darkMode ? 'On' : 'Off'}
              </button>
            </div>

            {/* Notifications Toggle */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(210, 180, 140, 0.1)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Bell size={24} color="var(--accent-brown)" />
                <div>
                  <p style={{ fontWeight: 'bold', color: 'var(--accent-brown)', marginBottom: '0.25rem' }}>
                    Push Notifications
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--dark-brown)', opacity: 0.8 }}>
                    Receive notifications for important updates
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting('notifications')}
                className={settings.notifications ? 'btn-primary' : 'btn-secondary'}
                style={{ minWidth: '80px' }}
              >
                {settings.notifications ? 'On' : 'Off'}
              </button>
            </div>

            {/* Sound Effects Toggle */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(210, 180, 140, 0.1)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {settings.soundEffects ? <Volume2 size={24} color="var(--accent-brown)" /> : <VolumeX size={24} color="var(--accent-brown)" />}
                <div>
                  <p style={{ fontWeight: 'bold', color: 'var(--accent-brown)', marginBottom: '0.25rem' }}>
                    Sound Effects
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--dark-brown)', opacity: 0.8 }}>
                    Play sounds for actions and notifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting('soundEffects')}
                className={settings.soundEffects ? 'btn-primary' : 'btn-secondary'}
                style={{ minWidth: '80px' }}
              >
                {settings.soundEffects ? 'On' : 'Off'}
              </button>
            </div>

            {/* Email Notifications Toggle */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(210, 180, 140, 0.1)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Mail size={24} color="var(--accent-brown)" />
                <div>
                  <p style={{ fontWeight: 'bold', color: 'var(--accent-brown)', marginBottom: '0.25rem' }}>
                    Email Notifications
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--dark-brown)', opacity: 0.8 }}>
                    Receive expense summaries via email
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting('emailNotifications')}
                className={settings.emailNotifications ? 'btn-primary' : 'btn-secondary'}
                style={{ minWidth: '80px' }}
              >
                {settings.emailNotifications ? 'On' : 'Off'}
              </button>
            </div>

            {/* Currency Selection */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1rem',
              background: 'rgba(210, 180, 140, 0.1)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Palette size={24} color="var(--accent-brown)" />
                <div>
                  <p style={{ fontWeight: 'bold', color: 'var(--accent-brown)', marginBottom: '0.25rem' }}>
                    Currency
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--dark-brown)', opacity: 0.8 }}>
                    Select your preferred currency
                  </p>
                </div>
              </div>
              <select
                value={settings.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid var(--light-brown)',
                  background: 'var(--primary-beige)',
                  color: 'var(--accent-brown)',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Security Section */}
        <motion.section
          className="translucent-card"
          style={{ marginBottom: '2rem' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
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
            <Lock size={28} />
            Security
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(210, 180, 140, 0.1)', borderRadius: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--accent-brown)', marginBottom: '0.5rem' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    paddingRight: '3rem',
                    borderRadius: '8px',
                    border: '2px solid var(--light-brown)',
                    background: 'var(--primary-beige)',
                    color: 'var(--accent-brown)',
                    fontSize: '1rem',
                  }}
                  placeholder="Enter current password"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--accent-brown)',
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'rgba(210, 180, 140, 0.1)', borderRadius: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--accent-brown)', marginBottom: '0.5rem' }}>
                New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid var(--light-brown)',
                  background: 'var(--primary-beige)',
                  color: 'var(--accent-brown)',
                  fontSize: '1rem',
                }}
                placeholder="Enter new password"
              />
            </div>

            <div style={{ padding: '1rem', background: 'rgba(210, 180, 140, 0.1)', borderRadius: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', color: 'var(--accent-brown)', marginBottom: '0.5rem' }}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '2px solid var(--light-brown)',
                  background: 'var(--primary-beige)',
                  color: 'var(--accent-brown)',
                  fontSize: '1rem',
                }}
                placeholder="Confirm new password"
              />
            </div>

            <button
              onClick={handlePasswordChange}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
            >
              <Save size={20} />
              Change Password
            </button>
          </div>
        </motion.section>

        {/* Data Management Section */}
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
            <Database size={28} />
            Data Management
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button
              onClick={handleExportData}
              className="btn-primary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                padding: '1rem',
                width: '100%',
              }}
            >
              <Download size={20} />
              Export All Data
            </button>

            <button
              onClick={handleClearData}
              className="btn-secondary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.5rem', 
                padding: '1rem',
                width: '100%',
              }}
            >
              <Trash2 size={20} />
              Clear All Expense Data
            </button>

            <div style={{ 
              padding: '1rem', 
              background: 'rgba(205, 92, 92, 0.1)', 
              borderRadius: '12px',
              border: '2px solid var(--barn-red)',
            }}>
              <p style={{ 
                fontWeight: 'bold', 
                color: 'var(--barn-red)', 
                marginBottom: '1rem',
                fontSize: '1.1rem',
              }}>
                Danger Zone
              </p>
              <p style={{ 
                fontSize: '0.95rem', 
                color: 'var(--dark-brown)', 
                marginBottom: '1rem',
                lineHeight: '1.5',
              }}>
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={handleDeleteAccount}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  padding: '1rem',
                  width: '100%',
                  background: 'var(--barn-red)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b94a4a';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--barn-red)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Trash2 size={20} />
                Delete Account Permanently
              </button>
            </div>
          </div>
        </motion.section>

        {/* Current Theme Info */}
        <motion.section
          className="translucent-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h3 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            color: 'var(--accent-brown)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <Palette size={28} />
            Current Theme
          </h3>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1rem',
            background: 'rgba(210, 180, 140, 0.1)',
            borderRadius: '12px',
          }}>
            <div>
              <p style={{ fontWeight: 'bold', color: 'var(--accent-brown)', fontSize: '1.2rem' }}>
                {currentTheme}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--dark-brown)', opacity: 0.8, marginTop: '0.25rem' }}>
                Visit the Themes page to customize your experience
              </p>
            </div>
            <button
              onClick={resetTheme}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Palette size={18} />
              Reset Theme
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SettingsPage;
