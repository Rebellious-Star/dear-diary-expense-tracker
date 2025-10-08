import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  Users,
  Instagram,
  Linkedin,
  Github,
  Heart,
  Star,
  Award,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  timestamp: string;
  replied?: boolean;
  replyText?: string;
}

const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [adminReplies, setAdminReplies] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    const load = async () => {
      if (!user?.isAdmin) return;
      const res = await api.get('/messages');
      setMessages(res.data || []);
    };
    load().catch(() => {});
  }, [user]);

  // Live-sync messages via storage events (for admin viewing while users submit)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'contactMessages' && e.newValue) {
        try { setMessages(JSON.parse(e.newValue)); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    const payload = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      timestamp: new Date().toISOString(),
    };
    api.post('/messages', payload).then(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }).catch(() => toast.error('Failed to send. Try again.'));
  };

  const handleAdminReply = async (id: string) => {
    const text = adminReplies[id];
    if (!text?.trim()) {
      toast.error('Enter a reply message');
      return;
    }
    const message = (messages as any).find((m: any) => m._id === id || m.id === id);
    if (!message) return;

    // Attempt to send reply via EmailJS
    try {
      const w = window as any;
      if (w && w.emailjs && typeof w.emailjs.send === 'function') {
        if (typeof w.emailjs.init === 'function') {
          const publicKey = (process.env.REACT_APP_EMAILJS_PUBLIC_KEY as string) || 'erbkC2RmaMPXfGCE2';
          if (publicKey) {
            try { w.emailjs.init({ publicKey }); } catch { w.emailjs.init(publicKey); }
          }
        }
        const serviceId = (process.env.REACT_APP_EMAILJS_SERVICE_ID as string) || 'service_xg9cwnq';
        // Prefer a dedicated reply template if provided; otherwise reuse OTP template as a fallback
        const templateId = (process.env.REACT_APP_EMAILJS_REPLY_TEMPLATE_ID as string) || (process.env.REACT_APP_EMAILJS_TEMPLATE_ID as string) || 'template_7bndh9q';
        const params: any = {
          // Generic fields many templates accept
          to_email: message.email,
          email: message.email,
          subject: `Dear Diary Support Reply: ${message.subject || 'Your message'}`,
          message: text,
          reply_to: 'dhruveloper2005@gmail.com',
          // Fallback mappings if using the OTP template
          passcode: text,
          time: new Date().toLocaleString(),
        };
        await w.emailjs.send(serviceId, templateId, params);
        toast.success('Reply emailed to user');
      } else {
        toast.error('Email service unavailable');
      }
    } catch (err: any) {
      toast.error(err?.text || err?.message || 'Failed to send email');
    }

    try {
      await api.post(`/messages/${id}/reply`, { text });
      const res = await api.get('/messages');
      setMessages(res.data || []);
    } catch {}
    setAdminReplies(prev => ({ ...prev, [id]: '' }));
  };

  const socialLinks = [
    {
      name: 'Discord',
      icon: Users,
      url: 'https://discord.gg/3ZKNp27XHr',
      color: '#5865F2',
      description: 'Join our community server for support and discussions'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://www.instagram.com/deardiary_production?igsh=MWgybDEwcjI2bDc5Zg==',
      color: '#E4405F',
      description: 'Follow us for tips and updates'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: 'https://linkedin.com/company/dhruv-pandey-91a333312',
      color: '#0A66C2',
      description: 'Professional networking and career tips'
    },
    {
      name: 'GitHub',
      icon: Github,
      url: 'https://github.com/Rebellious-Star',
      color: '#333333',
      description: 'Open source contributions and development'
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Us',
      details: 'dhruveloper2005@gmail.com',
      description: 'Get help with your account or technical issues',
      action: 'mailto: dhruveloper2005@gmail.com'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      details: 'Available 24/7',
      description: 'Chat with our support team instantly',
      action: '#'
    },
    {
      icon: Users,
      title: 'Discord Community',
      details: 'Join our server',
      description: 'Connect with other students and get peer support',
      action: 'https://discord.gg/3ZKNp27XHr'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      details: '+91 9234154895',
      description: 'Call us for urgent issues (Mon-Fri, 9AM-6PM IST)',
      action: 'tel:+919234154895'
    },
  ];

  const teamMembers = [
    {
      name: 'Dhruv Pandey',
      role: 'Leader',
      image: '👩‍💼',
      description: 'Worked on front-end and team management'
    },
    {
      name: 'Amrit Acharya',
      role: '2nd member',
      image: '👨‍💻',
      description: 'Worked on back-end development'
    },
    {
      name: 'Ruchi Pasayat',
      role: '3rd member',
      image: '👩‍🎓',
      description: 'Worked on front-end and presentation'
    },
  ];

  return (
    <div className="contact-page" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Farm Background Animation */}
      <div className="farm-background"></div>
      
      {/* Floating Farm Elements */}
      <motion.div
        className="floating-wheat"
        style={{
          position: 'absolute',
          top: '5%',
          left: '5%',
          fontSize: '3rem',
          opacity: 0.15,
          zIndex: 1,
        }}
        animate={{
          y: [0, -20, 0],
          rotate: [0, 8, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🌾
      </motion.div>

      <motion.div
        className="floating-barn"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          fontSize: '2.5rem',
          opacity: 0.15,
          zIndex: 1,
        }}
        animate={{
          y: [0, -15, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        🏚️
      </motion.div>

      <Navbar />

      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '2rem',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Header */}
        <motion.div
          style={{ marginBottom: '3rem' }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)',
            marginBottom: '1rem',
            fontFamily: 'var(--font-accent)',
            textAlign: 'center',
          }}>
            📞 Contact Us
          </h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--dark-brown)',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem auto',
          }}>
            We're here to help! Reach out to us through any of the channels below. 
            Our team is committed to supporting students on their financial journey.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {contactInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={info.title}
                className="translucent-card"
                style={{ textAlign: 'center', cursor: 'pointer' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => window.open(info.action, '_blank')}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--farm-green) 0%, var(--wheat-gold) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  boxShadow: 'var(--medium-shadow)',
                }}>
                  <Icon size={30} color="white" />
                </div>
                
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--accent-brown)',
                  marginBottom: '0.5rem',
                }}>
                  {info.title}
                </h3>
                
                <p style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'var(--farm-green)',
                  marginBottom: '0.5rem',
                }}>
                  {info.details}
                </p>
                
                <p style={{
                  color: 'var(--dark-brown)',
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                }}>
                  {info.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          className="translucent-card"
          style={{ marginBottom: '3rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Send size={24} style={{ marginRight: '0.5rem' }} />
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--accent-brown)',
                  fontWeight: '500',
                }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--accent-brown)',
                  fontWeight: '500',
                }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--accent-brown)',
                fontWeight: '500',
              }}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="input-field"
                placeholder="What's this about?"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--accent-brown)',
                fontWeight: '500',
              }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Tell us how we can help you..."
                rows={5}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
              >
                <Send size={20} style={{ marginRight: '0.5rem' }} />
                Send Message
              </button>
            </div>
          </form>
        </motion.div>

        {/* Admin Console for Messages */}
        {user?.isAdmin && (
          <motion.div
            className="translucent-card"
            style={{ marginBottom: '3rem', border: '2px dashed var(--farm-green)' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginBottom: '1rem',
            }}>
              Incoming Messages
            </h2>

            {messages.length === 0 ? (
              <div style={{ color: 'var(--dark-brown)' }}>No messages yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((m) => (
                  <div key={m.id} style={{
                    background: 'rgba(244, 241, 232, 0.7)',
                    border: '1px solid rgba(210, 180, 140, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ color: 'var(--accent-brown)', fontWeight: 600 }}>
                        {m.name} • {m.email}
                      </div>
                      <div style={{ color: 'var(--dark-brown)', fontSize: '0.85rem' }}>
                        {new Date(m.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {m.subject && (
                      <div style={{ color: 'var(--dark-brown)', marginBottom: '0.25rem' }}>
                        Subject: {m.subject}
                      </div>
                    )}
                    <div style={{ color: 'var(--dark-brown)', whiteSpace: 'pre-wrap', marginBottom: '0.5rem' }}>
                      {m.message}
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <textarea
                        value={adminReplies[m.id] || ''}
                        onChange={(e) => setAdminReplies(prev => ({ ...prev, [m.id]: e.target.value }))}
                        className="input-field"
                        placeholder={m.replied ? 'Reply sent' : 'Type your reply...'}
                        rows={3}
                        disabled={false}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn-primary"
                          onClick={() => handleAdminReply(m.id)}
                        >
                          Send Reply
                        </button>
                        <a
                          className="btn-secondary"
                          href={`mailto:${m.email}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Email
                        </a>
                      </div>
                      {m.replied && m.replyText && (
                        <div style={{ marginTop: '0.5rem', color: 'var(--farm-green)' }}>
                          Last reply: {m.replyText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Social Media */}
        <motion.div
          style={{ marginBottom: '3rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Users size={24} style={{ marginRight: '0.5rem' }} />
            Follow Us
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="translucent-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    padding: '1rem',
                    transition: 'all 0.3s ease',
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${social.color}15`;
                    e.currentTarget.style.borderColor = social.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(244, 241, 232, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(210, 180, 140, 0.4)';
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: social.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                  }}>
                    <Icon size={20} color="white" />
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      color: 'var(--accent-brown)',
                      marginBottom: '0.2rem',
                    }}>
                      {social.name}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--dark-brown)',
                      lineHeight: 1.3,
                    }}>
                      {social.description}
                    </div>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          style={{ marginBottom: '3rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Award size={24} style={{ marginRight: '0.5rem' }} />
            Meet Our Team
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
          }}>
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="translucent-card"
                style={{ textAlign: 'center' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '1rem',
                }}>
                  {member.image}
                </div>
                
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--accent-brown)',
                  marginBottom: '0.5rem',
                }}>
                  {member.name}
                </h3>
                
                <p style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'var(--farm-green)',
                  marginBottom: '0.5rem',
                }}>
                  {member.role}
                </p>
                
                <p style={{
                  color: 'var(--dark-brown)',
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                }}>
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="translucent-card"
          style={{ marginBottom: '3rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Clock size={24} style={{ marginRight: '0.5rem' }} />
            Frequently Asked Questions
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '0.5rem',
              }}>
                How do I reset my password?
              </h3>
              <p style={{
                color: 'var(--dark-brown)',
                fontSize: '0.9rem',
                lineHeight: 1.4,
              }}>
                Contact our support team.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '0.5rem',
              }}>
                Is my expense data secure?
              </h3>
              <p style={{
                color: 'var(--dark-brown)',
                fontSize: '0.9rem',
                lineHeight: 1.4,
              }}>
                Yes! We use high-level encryption and never share your personal data.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '0.5rem',
              }}>
                Can I export my expense data?
              </h3>
              <p style={{
                color: 'var(--dark-brown)',
                fontSize: '0.9rem',
                lineHeight: 1.4,
              }}>
                Yes, you can export your data from the expense tracker.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '0.5rem',
              }}>
                How do I appeal a forum ban?
              </h3>
              <p style={{
                color: 'var(--dark-brown)',
                fontSize: '0.9rem',
                lineHeight: 1.4,
              }}>
                Join our Discord server and contact the moderation team for appeals.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer Message */}
        <motion.div
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <div style={{
            fontSize: '1.1rem',
            color: 'var(--dark-brown)',
            marginBottom: '1rem',
            lineHeight: 1.6,
          }}>
            <Heart size={20} style={{ marginRight: '0.5rem', color: 'var(--barn-red)' }} />
            We're passionate about helping students achieve financial success. 
            Don't hesitate to reach out - we're here to support you every step of the way!
          </div>
          
          <div style={{
            fontSize: '0.9rem',
            color: 'var(--dark-brown)',
            opacity: 0.8,
          }}>
            © 2024 Dear Diary Expense Tracker. Made with 🌾 for students worldwide.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
