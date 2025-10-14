import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Home, DollarSign, MessageSquare, Lightbulb, Mail, LogOut, User, Moon, Sun, Palette } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/expenses', label: 'Expenses', icon: DollarSign },
    { path: '/forum', label: 'Forum', icon: MessageSquare },
    { path: '/tips', label: 'Tips', icon: Lightbulb },
    { path: '/themes', label: 'Themes', icon: Palette },
    { path: '/contact', label: 'Contact', icon: Mail },
  ];

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch {}
  };

  const isDarkActive = () => document.documentElement.classList.contains('dark');

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link to="/" style={{ 
            textDecoration: 'none', 
            color: 'var(--accent-brown)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            fontFamily: 'var(--font-accent)'
          }}>
            🌾 Dear Diary Expense Tracker
          </Link>
        </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      textDecoration: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '20px',
                      transition: 'all 0.3s ease',
                      background: isActive ? 'var(--farm-green)' : 'transparent',
                      color: isActive ? 'white' : 'var(--accent-brown)',
                    }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <button
            onClick={toggleTheme}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.8rem' }}
            title="Toggle dark mode"
          >
            {isDarkActive() ? <Sun size={16} /> : <Moon size={16} />}
            {isDarkActive() ? 'Light' : 'Dark'}
          </button>

            {user?.isAdmin && (
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '20px' }}
              >
                <User size={18} /> Admin
              </Link>
            )}
            {user && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'var(--accent-brown)',
                fontSize: '0.9rem'
              }}>
                <User size={16} />
                <span>{user.username}</span>
              </div>
              <button
                onClick={logout}
                className="btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem'
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;







