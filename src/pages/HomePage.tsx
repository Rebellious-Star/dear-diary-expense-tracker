import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api';
import { 
  DollarSign, 
  MessageSquare, 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  Users, 
  BarChart3,
  PiggyBank,
  Calculator,
  Target
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    // Fetch user count from backend if admin, otherwise show placeholder
    const fetchUserCount = async () => {
      if (user?.isAdmin) {
        try {
          const res = await api.get('/auth/users');
          setUserCount(res.data?.length || 0);
        } catch (err) {
          console.error('Failed to fetch user count:', err);
          setUserCount(0);
        }
      } else {
        // For non-admin users, show a placeholder count
        setUserCount(5); // Or fetch from a public endpoint if you create one
      }
    };
    fetchUserCount();
  }, [user]);

  const features = [
    {
      icon: DollarSign,
      title: 'Smart Expense Tracking',
      description: 'Track your daily expenses with intuitive categories and visual analytics.',
      color: 'var(--farm-green)',
    },
    {
      icon: MessageSquare,
      title: 'Community Forum',
      description: 'Connect with fellow students and get advice on financial management.',
      color: 'var(--barn-red)',
    },
    {
      icon: Lightbulb,
      title: 'AI-Powered Tips',
      description: 'Get personalized money-saving tips based on your spending patterns.',
      color: 'var(--wheat-gold)',
    },
    {
      icon: Shield,
      title: 'Safe Environment',
      description: 'Moderated community with strict content policies for student safety.',
      color: 'var(--soil-brown)',
    },
  ];

  const stats = [
    { number: String(userCount), label: 'Registered Users' },
    { number: 'Live', label: 'Forum & Tips' },
    { number: '100%', label: 'Free for Students' },
    { number: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="home-page" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Farm Background Animation */}
      <div className="farm-background"></div>
      
      {/* Animated Farm Elements */}
      <motion.div
        style={{ position: 'absolute', top: '15%', right: '10%', fontSize: '2.5rem', zIndex: 1, cursor: 'pointer' }}
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileTap={{ scale: 0.85, rotate: 20 }}
        whileHover={{ scale: 1.2 }}
      >
        🐥
      </motion.div>
      
      <motion.div
        style={{ position: 'absolute', top: '25%', left: '8%', fontSize: '2rem', zIndex: 1, cursor: 'pointer' }}
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileTap={{ scale: 0.9, rotate: 180 }}
        whileHover={{ scale: 1.3, rotate: 15 }}
      >
        🌻
      </motion.div>
      
      <motion.div
        style={{ position: 'absolute', bottom: '20%', right: '15%', fontSize: '2.2rem', zIndex: 1, cursor: 'pointer' }}
        animate={{ 
          y: [0, -10, 0],
          x: [0, 5, 0]
        }}
        transition={{ 
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileTap={{ scale: 0.8 }}
        whileHover={{ scale: 1.2, rotate: -10 }}
      >
        🌾
      </motion.div>
      
      <motion.div
        style={{ position: 'absolute', top: '40%', right: '5%', fontSize: '1.8rem', zIndex: 1, cursor: 'pointer' }}
        animate={{ 
          rotate: [0, -5, 5, 0],
          y: [0, -8, 0]
        }}
        transition={{ 
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileTap={{ scale: 0.9, y: 20 }}
        whileHover={{ scale: 1.3 }}
      >
        🐔
      </motion.div>
      
      <motion.div
        style={{ position: 'absolute', bottom: '30%', left: '12%', fontSize: '2rem', zIndex: 1, cursor: 'pointer' }}
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [0, 8, -8, 0]
        }}
        transition={{ 
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileTap={{ scale: 0.85, rotate: 360 }}
        whileHover={{ scale: 1.25 }}
      >
        🌻
      </motion.div>
      
      {/* Floating Farm Elements */}
      <motion.div
        className="floating-wheat"
        style={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          fontSize: '4rem',
          opacity: 0.2,
          zIndex: 1,
        }}
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 8,
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
          top: '15%',
          right: '8%',
          fontSize: '3rem',
          opacity: 0.15,
          zIndex: 1,
        }}
        animate={{
          x: [0, 30, 0],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          duration: 10,
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
          bottom: '10%',
          left: '3%',
          fontSize: '2.5rem',
          opacity: 0.2,
          zIndex: 1,
        }}
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🏚️
      </motion.div>

      <motion.div
        className="floating-cow"
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '5%',
          fontSize: '2rem',
          opacity: 0.18,
          zIndex: 1,
        }}
        animate={{
          x: [0, 25, 0],
          y: [0, -10, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🐄
      </motion.div>

      <Navbar />

      {/* Hero Section with GIF Background */}
      <section className="hero-section-with-gif">
        {/* Farm GIF Background */}
        <img 
          src="https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif" 
          alt="Farm background"
          className="hero-gif-background"
        />
        <div className="hero-gif-overlay"></div>
        
        <div className="hero-content" style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center',
        }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <motion.div
              style={{ marginBottom: '3rem' }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
            <motion.h1
              style={{
                fontSize: '3.5rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '1rem',
                fontFamily: 'var(--font-accent)',
                background: 'linear-gradient(135deg, var(--accent-brown) 0%, var(--farm-green) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Welcome to Dear Diary Expense Tracker
            </motion.h1>
            
            <motion.p
              style={{
                fontSize: '1.3rem',
                color: 'var(--dark-brown)',
                marginBottom: '2rem',
                lineHeight: 1.6,
                maxWidth: '800px',
                margin: '0 auto 2rem auto',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              The ultimate financial companion for students. Track expenses, connect with peers, 
              and learn smart money management in our friendly farm-themed community.
            </motion.p>

            <motion.div
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              {user ? (
                <Link to="/expenses" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  <DollarSign size={20} style={{ marginRight: '0.5rem' }} />
                  Start Tracking Expenses
                </Link>
              ) : (
                <Link to="/login" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                  Join Our Farm Community
                </Link>
              )}
              <Link to="/contact" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              marginBottom: '4rem',
            }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="translucent-card"
                style={{ textAlign: 'center', padding: '2rem 1rem' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'var(--farm-green)',
                    marginBottom: '0.5rem',
                  }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {stat.number}
                </motion.div>
                <div style={{ color: 'var(--accent-brown)', fontWeight: '500' }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        position: 'relative',
        zIndex: 10,
        padding: '4rem 2rem',
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            style={{ textAlign: 'center', marginBottom: '3rem' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginBottom: '1rem',
              fontFamily: 'var(--font-accent)',
            }}>
              Why Choose Our Farm?
            </h2>
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--dark-brown)',
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              We've built the perfect environment for students to manage their finances effectively.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="translucent-card"
                  style={{ textAlign: 'center' }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                >
                  <motion.div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${feature.color} 0%, rgba(255,255,255,0.2) 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem auto',
                      boxShadow: 'var(--medium-shadow)',
                    }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Icon size={40} color="white" />
                  </motion.div>
                  
                  <h3 style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: 'var(--accent-brown)',
                    marginBottom: '1rem',
                  }}>
                    {feature.title}
                  </h3>
                  
                  <p style={{
                    color: 'var(--dark-brown)',
                    lineHeight: 1.6,
                    fontSize: '1rem',
                  }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Background GIF */}
      <section style={{ 
        padding: '4rem 2rem',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden',
      }}>
        {/* Background GIF */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.1,
        }}>
          <img 
            src="https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" 
            alt="Wheat field"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(3px)',
            }}
          />
        </div>
        
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div
            className="translucent-card"
            style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: 'linear-gradient(135deg, rgba(154, 205, 50, 0.15) 0%, rgba(240, 230, 140, 0.15) 100%)',
              backdropFilter: 'blur(10px)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
          >
            <motion.div
              style={{ fontSize: '3rem', marginBottom: '1rem' }}
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🌾
            </motion.div>
            
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginBottom: '1rem',
              fontFamily: 'var(--font-accent)',
            }}>
              Ready to Start Your Financial Journey?
            </h2>
            
            <p style={{
              fontSize: '1.1rem',
              color: 'var(--dark-brown)',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
            }}>
              Join thousands of students who are already managing their expenses smarter with our platform.
            </p>

            <motion.div
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.6 }}
            >
              {user ? (
                <>
                  <Link to="/expenses" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                    <BarChart3 size={20} style={{ marginRight: '0.5rem' }} />
                    View Dashboard
                  </Link>
                  <Link to="/forum" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                    <Users size={20} style={{ marginRight: '0.5rem' }} />
                    Join Forum
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                    <PiggyBank size={20} style={{ marginRight: '0.5rem' }} />
                    Get Started Free
                  </Link>
                  <Link to="/tips" className="btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
                    <Target size={20} style={{ marginRight: '0.5rem' }} />
                    Learn Tips
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Floating Chat Bot */}
      <Link to="/tips">
        <motion.div
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            zIndex: 1000,
            cursor: 'pointer',
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5, type: "spring" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {/* Chat bubble with message */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '80px',
              right: '0',
              background: 'white',
              padding: '12px 16px',
              borderRadius: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              border: '2px solid var(--farm-green)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.3 }}
          >
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              color: 'var(--accent-brown)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Lightbulb size={18} color="var(--wheat-gold)" />
              Need guidance? 💡
            </div>
            {/* Speech bubble arrow */}
            <div style={{
              position: 'absolute',
              bottom: '-8px',
              right: '20px',
              width: '0',
              height: '0',
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid white',
            }}></div>
          </motion.div>

          {/* Bot icon */}
          <motion.div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--farm-green) 0%, var(--wheat-gold) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              boxShadow: '0 4px 20px rgba(154, 205, 50, 0.4)',
              border: '3px solid white',
            }}
            animate={{ 
              y: [0, -10, 0],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            🤖
          </motion.div>
        </motion.div>
      </Link>

      {/* Footer */}
      <footer style={{
        background: 'rgba(139, 69, 19, 0.1)',
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(210, 180, 140, 0.3)',
        position: 'relative',
        zIndex: 10,
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ color: 'var(--dark-brown)', marginBottom: '1rem' }}>
            © 2024 Dear Diary Expense Tracker. Made with 🌾 for students.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{ color: 'var(--accent-brown)', textDecoration: 'none' }}>
              Contact Us
            </Link>
            <Link to="/tips" style={{ color: 'var(--accent-brown)', textDecoration: 'none' }}>
              Financial Tips
            </Link>
            <Link to="/forum" style={{ color: 'var(--accent-brown)', textDecoration: 'none' }}>
              Community
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;





