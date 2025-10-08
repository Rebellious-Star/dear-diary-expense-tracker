import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Wheat } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, register, requestOtp, verifyOtp, requestResetOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCooldownMs, setOtpCooldownMs] = useState<number | undefined>(undefined);
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | undefined>(undefined);
  const [showForgot, setShowForgot] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleRequestOtp = async () => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Enter a valid email first.');
        return;
      }
      // Basic pre-checks to avoid sending OTP for unusable inputs
      if (username.trim().length < 3) {
        toast.error('Choose a username (min 3 chars) before requesting OTP.');
        return;
      }
      // Backend will validate email/username uniqueness during registration
      const res = await requestOtp(email);
      if (!res.success) {
        if (res.cooldownMs) {
          toast.error(`Please wait ${Math.ceil(res.cooldownMs / 1000)}s before resending.`);
          setOtpCooldownMs(res.cooldownMs);
          setOtpExpiresAt(res.expiresAt);
        } else {
          toast.error(res.errorMessage || 'Could not send OTP.');
        }
        return;
      }
      setOtpSent(true);
      setOtpVerified(false);
      setOtpCooldownMs(res.cooldownMs);
      setOtpExpiresAt(res.expiresAt);
      if (res.emailSent === false && res.errorMessage) {
        toast.error(`OTP generated but email failed: ${res.errorMessage}`);
      } else {
        toast.success('OTP sent to your email.');
      }
    } catch (e) {
      toast.error('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!otp || otp.length < 6) {
        toast.error('Enter the 6-digit OTP.');
        return;
      }
      const ok = await verifyOtp(email, otp);
      if (ok) {
        setOtpVerified(true);
        toast.success('Email verified.');
      } else {
        toast.error('Invalid or expired OTP.');
      }
    } catch (e) {
      toast.error('OTP verification failed.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // simple client-side validations
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters.');
        return;
      }
      if (!isLogin && username.trim().length < 3) {
        toast.error('Username must be at least 3 characters.');
        return;
      }
      let success = false;
      if (isLogin) {
        success = await login(email, password);
        if (success) {
          toast.success('Welcome back to the farm! 🌾');
          navigate('/expenses');
        } else {
          toast.error('Invalid email or password.');
        }
      } else {
        // Backend will validate email/username uniqueness
        // OTP verification is optional (can be enforced later)
        success = await register(email, password, username);
        if (success) {
          toast.success('Welcome to Dear Diary Expense Tracker! 🌾');
          navigate('/expenses');
        } else {
          toast.error('Registration failed. Email or username may already exist.');
        }
      }
    } catch (error: any) {
      console.error('Login/Register error:', error);
      const errMsg = error?.response?.data?.error || error?.message || 'Something went wrong';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Farm Background Animation */}
      <div className="farm-background"></div>
      
      {/* Floating Farm Elements */}
      <motion.div
        className="floating-wheat"
        style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          fontSize: '3rem',
          opacity: 0.3,
          zIndex: 1,
        }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🌾
      </motion.div>

      <motion.div
        className="floating-tractor"
        style={{
          position: 'absolute',
          top: '20%',
          right: '15%',
          fontSize: '2.5rem',
          opacity: 0.2,
          zIndex: 1,
        }}
        animate={{
          x: [0, 20, 0],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🚜
      </motion.div>

      <motion.div
        className="floating-barn"
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          fontSize: '2rem',
          opacity: 0.25,
          zIndex: 1,
        }}
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🏚️
      </motion.div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '2rem',
        zIndex: 10,
        position: 'relative',
      }}>
        <motion.div
          className="translucent-card"
          style={{
            width: '100%',
            maxWidth: '450px',
            padding: '3rem',
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Header */}
          <motion.div
            style={{ textAlign: 'center', marginBottom: '2rem' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🌾
            </motion.div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginBottom: '0.5rem',
              fontFamily: 'var(--font-accent)',
            }}>
              Dear Diary Expense Tracker
            </h1>
            <p style={{
              color: 'var(--dark-brown)',
              fontSize: '1rem',
              opacity: 0.8,
            }}>
              {isLogin ? 'Welcome back to the farm!' : 'Join our farming community!'}
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {isLogin && (
              <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForgot(!showForgot)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-brown)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {showForgot ? 'Close forgot password' : 'Forgot password?'}
                </button>
              </div>
            )}

            {isLogin && showForgot && (
              <motion.div
                className="translucent-card"
                style={{ padding: '1rem', marginBottom: '1rem' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div>
                    <label className="form-label">Email for reset</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field"
                      placeholder="Enter your registered email"
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn-secondary" onClick={async () => {
                      const res = await requestResetOtp(email);
                      if (res.success) {
                        toast.success(res.emailSent ? 'Reset code sent!' : 'Reset code generated.');
                        setOtpExpiresAt(res.expiresAt);
                      } else {
                        toast.error('Failed to send reset code.');
                      }
                    }}>Send reset code</button>
                    {otpExpiresAt && (
                      <span style={{ alignSelf: 'center', color: 'var(--dark-brown)', opacity: 0.8 }}>
                        Code expires in {Math.max(0, Math.ceil(((otpExpiresAt || 0) - Date.now()) / 1000))}s
                      </span>
                    )}
                  </div>
                  <div>
                    <label className="form-label">Enter code</label>
                    <input type="text" className="input-field" value={resetCode} onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit code" />
                  </div>
                  <div>
                    <label className="form-label">New password</label>
                    <input type="password" className="input-field" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="New password" />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button type="button" className="btn-primary" onClick={async () => {
                      if (newPass.length < 6) { toast.error('Password min 6 chars'); return; }
                      const ok = await resetPassword(email, resetCode, newPass);
                      if (ok) { toast.success('Password reset. You can sign in now.'); setShowForgot(false); setResetCode(''); setNewPass(''); }
                      else { toast.error('Invalid code or expired.'); }
                    }}>Reset password</button>
                  </div>
                </div>
              </motion.div>
            )}
            {!isLogin && (
              <motion.div
                style={{ marginBottom: '1.5rem' }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--accent-brown)',
                  fontWeight: '500',
                }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={20}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--light-brown)',
                    }}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                    placeholder="Enter your username"
                    required={!isLogin}
                    style={{ paddingLeft: '45px' }}
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              style={{ marginBottom: '1.5rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--accent-brown)',
                fontWeight: '500',
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--light-brown)',
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="Enter your email"
                  required
                  style={{ paddingLeft: '45px' }}
                />
              </div>
            </motion.div>

            <motion.div
              style={{ marginBottom: '2rem' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--accent-brown)',
                fontWeight: '500',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={20}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--light-brown)',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Enter your password"
                  required
                  style={{ paddingLeft: '45px', paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--light-brown)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </motion.div>

            {!isLogin && (
              <motion.div
                style={{ marginBottom: '1rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    style={{ flexShrink: 0 }}
                  >
                    {otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                  {otpExpiresAt && (
                    <span style={{ alignSelf: 'center', color: 'var(--dark-brown)', opacity: 0.8 }}>
                      OTP expires in {Math.max(0, Math.ceil(((otpExpiresAt || 0) - Date.now()) / 1000))}s
                    </span>
                  )}
                </div>
              </motion.div>
            )}

            {!isLogin && otpSent && (
              <motion.div
                style={{ marginBottom: '1.5rem' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--accent-brown)',
                  fontWeight: '500',
                }}>
                  Enter OTP
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field"
                    placeholder="6-digit OTP"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleVerifyOtp}
                    disabled={loading || otpVerified}
                    style={{ flexShrink: 0 }}
                  >
                    {otpVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1.1rem',
                padding: '1rem',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
              ) : (
                <>
                  <Wheat size={20} />
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle Form */}
          <motion.div
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p style={{ color: 'var(--dark-brown)', marginBottom: '1rem' }}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="btn-secondary"
              style={{
                fontSize: '1rem',
                padding: '0.8rem 1.5rem',
              }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            style={{ textAlign: 'center', marginTop: '2rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              to="/"
              style={{
                color: 'var(--accent-brown)',
                textDecoration: 'none',
                fontSize: '0.9rem',
                opacity: 0.8,
              }}
            >
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
