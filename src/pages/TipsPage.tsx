import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  Lightbulb, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Target,
  PiggyBank,
  Calculator,
  BookOpen,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ExpenseData {
  totalExpenses: number;
  totalIncome: number;
  categories: { [key: string]: number };
  recentExpenses: Array<{
    amount: number;
    category: string;
    description: string;
    date: string;
  }>;
}

const TipsPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load expense data from per-user localStorage
  useEffect(() => {
    const key = user ? `expenses:${user.id}` : 'expenses:guest';
    const savedExpenses = localStorage.getItem(key);
    if (savedExpenses) {
      const expenses = JSON.parse(savedExpenses);
      
      const totalExpenses = expenses
        .filter((expense: any) => expense.type === 'expense')
        .reduce((total: number, expense: any) => total + expense.amount, 0);
      
      const totalIncome = expenses
        .filter((expense: any) => expense.type === 'income')
        .reduce((total: number, expense: any) => total + expense.amount, 0);
      
      const categories: { [key: string]: number } = {};
      expenses.forEach((expense: any) => {
        if (expense.type === 'expense') {
          categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
        }
      });
      
      const recentExpenses = expenses
        .filter((expense: any) => expense.type === 'expense')
        .slice(0, 10)
        .map((expense: any) => ({
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
        }));
      
      setExpenseData({
        totalExpenses,
        totalIncome,
        categories,
        recentExpenses,
      });
    }
  }, [user]);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      text: expenseData && expenseData.totalExpenses > 0 
        ? `Hello! I'm your personal financial advisor. I can see you've tracked $${expenseData.totalExpenses.toFixed(2)} in expenses. How can I help you manage your finances better today?`
        : `Hello! I'm your personal financial advisor. I can help you with money-saving tips and financial advice. What would you like to know about managing your expenses?`,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, [expenseData]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getPersonalizedTips = (): string[] => {
    if (!expenseData || expenseData.totalExpenses === 0) {
      return [
        "Start tracking your daily expenses to identify spending patterns",
        "Create a monthly budget and stick to it",
        "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
        "Cook meals at home instead of eating out frequently",
        "Look for student discounts and deals",
        "Set up automatic savings transfers",
        "Use cash for discretionary spending to limit overspending",
        "Track your subscriptions and cancel unused ones",
        "Buy generic brands for basic items",
        "Use public transportation or carpool when possible"
      ];
    }

    const tips: string[] = [];
    const netBalance = expenseData.totalIncome - expenseData.totalExpenses;
    const topCategory = Object.entries(expenseData.categories)
      .sort(([,a], [,b]) => b - a)[0];

    if (netBalance < 0) {
      tips.push("Your expenses exceed your income. Consider reducing discretionary spending.");
      tips.push("Focus on increasing your income through part-time work or freelancing.");
    }

    if (topCategory) {
      tips.push(`Your highest expense category is ${topCategory[0]} ($${topCategory[1].toFixed(2)}). Look for ways to reduce this spending.`);
    }

    if (expenseData.categories['Food & Dining'] > expenseData.totalExpenses * 0.3) {
      tips.push("You're spending over 30% on food. Try meal planning and cooking at home more often.");
    }

    if (expenseData.categories['Entertainment'] > expenseData.totalExpenses * 0.2) {
      tips.push("Consider reducing entertainment expenses and look for free activities.");
    }

    tips.push("Set aside 20% of your income for emergency savings.");
    tips.push("Review your expenses weekly to stay on track with your budget.");
    tips.push("Use apps to find discounts and coupons for your regular purchases.");

    return tips;
  };

  const simulateWhatIf = (category: string, reductionPercent: number): string => {
    if (!expenseData) return 'Add expenses to simulate changes.';
    const spent = expenseData.categories[category] || 0;
    const saved = (spent * reductionPercent) / 100;
    const newNet = expenseData.totalIncome - (expenseData.totalExpenses - saved);
    return `If you cut ${category} by ${reductionPercent}%, you could save about ₹${saved.toFixed(0)} monthly and your projected net balance becomes ₹${newNet.toFixed(0)}.`;
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Personalized tips based on expense data
    if (message.includes('tip') || message.includes('advice') || message.includes('help')) {
      const tips = getPersonalizedTips();
      return `Here are some personalized tips for you:\n\n${tips.slice(0, 5).map((tip, index) => `${index + 1}. ${tip}`).join('\n')}\n\nWould you like more specific advice on any category?`;
    }

    // Budget advice
    if (message.includes('budget') || message.includes('budgeting')) {
      return `Creating a budget is essential! Here's a simple approach:\n\n• Track all income sources\n• List all expenses by category\n• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings\n• Review and adjust monthly\n\nWould you like help creating a specific budget plan?`;
    }

    // Saving money
    if (message.includes('save') || message.includes('saving')) {
      return `Great question! Here are effective saving strategies:\n\n• Pay yourself first - save before spending\n• Set up automatic transfers to savings\n• Use the envelope method for discretionary spending\n• Look for student discounts everywhere\n• Cook at home and pack lunches\n\nWhat's your biggest challenge with saving?`;
    }

    // Expense tracking
    if (message.includes('track') || message.includes('tracking') || message.includes('expense')) {
      return `Expense tracking is crucial for financial success:\n\n• Record every expense, no matter how small\n• Categorize expenses for better analysis\n• Review spending patterns weekly\n• Set spending limits for each category\n• Use apps or spreadsheets for convenience\n\nAre you currently tracking your expenses regularly?`;
    }

    // Debt management
    if (message.includes('debt') || message.includes('loan') || message.includes('credit')) {
      return `Managing debt effectively:\n\n• Pay more than minimum payments when possible\n• Focus on high-interest debt first\n• Consider debt consolidation if beneficial\n• Avoid taking on new debt\n• Build an emergency fund to prevent future debt\n\nWhat type of debt are you dealing with?`;
    }

    // Investment advice
    if (message.includes('invest') || message.includes('investment') || message.includes('stocks')) {
      return `Investment basics for students:\n\n• Start with low-cost index funds\n• Consider Roth IRA for long-term growth\n• Don't invest money you need in the short term\n• Diversify your portfolio\n• Start small and increase over time\n• Focus on learning before investing large amounts\n\nAre you looking to start investing?`;
    }

    // Emergency fund
    if (message.includes('emergency') || message.includes('emergency fund')) {
      return `Emergency funds are your financial safety net:\n\n• Aim for 3-6 months of expenses\n• Start with $500-1000 as a beginner goal\n• Keep in a high-yield savings account\n• Only use for true emergencies\n• Replenish after using\n\nHow much do you currently have saved for emergencies?`;
    }

    // General financial health
    if (message.includes('financial health') || message.includes('financial wellness')) {
      return `Financial health indicators:\n\n• Positive net worth\n• Emergency fund in place\n• Living below your means\n• No high-interest debt\n• Regular savings contributions\n• Insurance coverage\n\nWhich area would you like to focus on improving?`;
    }

    // Default response
    // What-if simulation parser: e.g., "what if i reduce food & dining by 10%"
    const m = message.match(/reduce\s+(.+?)\s+by\s+(\d+)%/);
    if (m && expenseData) {
      const cat = m[1].trim().replace(/category|spend|expense/gi,'').trim();
      const pct = parseInt(m[2], 10);
      // find best category match
      const cats = Object.keys(expenseData.categories);
      const found = cats.find(c => c.toLowerCase() === cat.toLowerCase()) || cats.find(c => c.toLowerCase().includes(cat.toLowerCase()));
      if (found) return simulateWhatIf(found, pct);
    }
    return `I'm here to help with your financial questions! I can provide advice on:\n\n• Budgeting and expense tracking\n• Saving strategies\n• Debt management\n• Investment basics\n• Emergency fund planning\n• Financial goal setting\n\nTry a what-if: "Reduce Food & Dining by 10%"`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Give me personalized tips",
    "How do I create a budget?",
    "What are good saving strategies?",
    "How much should I save?",
    "Help with debt management",
    "Investment advice for students"
  ];

  return (
    <div className="tips-page" style={{ minHeight: '100vh', position: 'relative' }}>
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
          style={{ marginBottom: '2rem' }}
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
            💡 Financial Tips & AI Advisor
          </h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--dark-brown)',
            fontSize: '1.1rem',
            marginBottom: '2rem',
          }}>
            Get personalized financial advice based on your spending patterns
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: '2rem',
          height: '70vh',
        }}>
          {/* Chat Interface */}
          <motion.div
            className="translucent-card"
            style={{ display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {/* Chat Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              borderBottom: '1px solid rgba(210, 180, 140, 0.3)',
              marginBottom: '1rem',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--farm-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
              }}>
                <Bot size={20} color="white" />
              </div>
              <div>
                <h3 style={{
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: 'var(--accent-brown)',
                  margin: 0,
                }}>
                  Financial Advisor Bot
                </h3>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--dark-brown)',
                  margin: 0,
                }}>
                  Online • Ready to help
                </p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 1rem',
              marginBottom: '1rem',
            }}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.8rem 1rem',
                    borderRadius: '18px',
                    background: message.sender === 'user' 
                      ? 'var(--farm-green)' 
                      : 'rgba(244, 241, 232, 0.8)',
                    color: message.sender === 'user' 
                      ? 'white' 
                      : 'var(--dark-brown)',
                    border: message.sender === 'bot' 
                      ? '1px solid rgba(210, 180, 140, 0.3)' 
                      : 'none',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                  }}>
                    {message.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div style={{
                    padding: '0.8rem 1rem',
                    borderRadius: '18px',
                    background: 'rgba(244, 241, 232, 0.8)',
                    border: '1px solid rgba(210, 180, 140, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.2rem',
                    }}>
                      <motion.div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-brown)',
                        }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-brown)',
                        }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--accent-brown)',
                        }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--dark-brown)' }}>
                      Bot is typing...
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--dark-brown)',
                marginBottom: '0.5rem',
                fontWeight: '500',
              }}>
                Quick questions:
              </p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}>
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    style={{
                      background: 'rgba(154, 205, 50, 0.1)',
                      border: '1px solid var(--farm-green)',
                      borderRadius: '20px',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.8rem',
                      color: 'var(--accent-brown)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--farm-green)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(154, 205, 50, 0.1)';
                      e.currentTarget.style.color = 'var(--accent-brown)';
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              padding: '0 1rem',
            }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field"
                placeholder="Ask me anything about finances..."
                style={{ flex: 1 }}
              />
              <button
                onClick={handleSendMessage}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.8rem',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>

          {/* Financial Overview */}
          <motion.div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Financial Summary */}
            <div className="translucent-card">
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
              }}>
                <DollarSign size={20} style={{ marginRight: '0.5rem' }} />
                Your Financial Overview
              </h3>
              
              {expenseData && expenseData.totalExpenses > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    background: 'rgba(154, 205, 50, 0.1)',
                    borderRadius: '8px',
                  }}>
                    <span style={{ color: 'var(--dark-brown)' }}>Total Income</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--farm-green)' }}>
                      ${expenseData.totalIncome.toFixed(2)}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    background: 'rgba(205, 92, 92, 0.1)',
                    borderRadius: '8px',
                  }}>
                    <span style={{ color: 'var(--dark-brown)' }}>Total Expenses</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--barn-red)' }}>
                      ${expenseData.totalExpenses.toFixed(2)}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem',
                    background: expenseData.totalIncome - expenseData.totalExpenses >= 0 
                      ? 'rgba(154, 205, 50, 0.1)' 
                      : 'rgba(205, 92, 92, 0.1)',
                    borderRadius: '8px',
                  }}>
                    <span style={{ color: 'var(--dark-brown)' }}>Net Balance</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: expenseData.totalIncome - expenseData.totalExpenses >= 0 
                        ? 'var(--farm-green)' 
                        : 'var(--barn-red)' 
                    }}>
                      ${(expenseData.totalIncome - expenseData.totalExpenses).toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--dark-brown)',
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
                  <p>Start tracking your expenses to see personalized insights!</p>
                </div>
              )}
            </div>

            {/* Top Categories */}
            {expenseData && Object.keys(expenseData.categories).length > 0 && (
              <div className="translucent-card">
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                  color: 'var(--accent-brown)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <Target size={20} style={{ marginRight: '0.5rem' }} />
                  Top Spending Categories
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(expenseData.categories)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, amount]) => {
                      const percentage = (amount / expenseData.totalExpenses) * 100;
                      return (
                        <div key={category} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem',
                          background: 'rgba(244, 241, 232, 0.5)',
                          borderRadius: '6px',
                        }}>
                          <span style={{ fontSize: '0.9rem', color: 'var(--dark-brown)' }}>
                            {category}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                              ${amount.toFixed(2)}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--dark-brown)' }}>
                              ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="translucent-card">
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: 'var(--accent-brown)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
              }}>
                <Star size={20} style={{ marginRight: '0.5rem' }} />
                Quick Tips
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {getPersonalizedTips().slice(0, 3).map((tip, index) => (
                  <div key={index} style={{
                    padding: '0.8rem',
                    background: 'rgba(240, 230, 140, 0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(240, 230, 140, 0.4)',
                    fontSize: '0.9rem',
                    color: 'var(--dark-brown)',
                    lineHeight: 1.4,
                  }}>
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TipsPage;







