import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { 
  Plus, 
  DollarSign, 
  Calendar, 
  Tag, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Edit,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

const ExpenseTrackerPage: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loadedForKey, setLoadedForKey] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const categories = [
    { name: 'Food & Dining', icon: '🍽️', color: 'var(--barn-red)' },
    { name: 'Transportation', icon: '🚗', color: 'var(--farm-green)' },
    { name: 'Entertainment', icon: '🎬', color: 'var(--wheat-gold)' },
    { name: 'Education', icon: '📚', color: 'var(--soil-brown)' },
    { name: 'Shopping', icon: '🛍️', color: 'var(--light-brown)' },
    { name: 'Health', icon: '🏥', color: 'var(--barn-red)' },
    { name: 'Utilities', icon: '⚡', color: 'var(--farm-green)' },
    { name: 'Other', icon: '📦', color: 'var(--dark-brown)' },
  ];

  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: categories[0].name,
    description: '',
    type: 'expense' as 'income' | 'expense',
  });

  // Helpers
  const formatCurrency = (value: number): string => {
    try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value); } catch { return `₹${value.toFixed(2)}`; }
  };

  // Load expenses from backend
  useEffect(() => {
    const load = async () => {
      if (!user) { setExpenses([]); return; }
      const res = await api.get('/expenses');
      setExpenses(res.data || []);
      setLoadedForKey(user.id);
    };
    load().catch(() => setExpenses([]));
  }, [user]);

  // no local save; backend is source of truth

  // Filter expenses based on search and filter criteria
  useEffect(() => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(expense => expense.type === filterType);
    }

    setFilteredExpenses(filtered);
  }, [expenses, searchTerm, filterCategory, filterType]);

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: new Date().toISOString().split('T')[0],
      type: newExpense.type,
    };
    // Post to backend then refresh list
    console.log('📤 Posting expense:', expense);
    api.post('/expenses', expense).then(async (postRes) => {
      console.log('✅ Expense posted:', postRes.data);
      console.log('📥 Fetching all expenses...');
      const res = await api.get('/expenses');
      console.log('✅ Got expenses:', res.data);
      setExpenses(res.data || []);
      toast.success(`${newExpense.type === 'income' ? 'Income' : 'Expense'} added successfully!`);
    }).catch((err) => {
      console.error('❌ Failed to add expense:', err);
      console.error('Error details:', err.response?.data);
      toast.error('Failed to add expense. Please try again.');
      // fallback optimistic
      setExpenses([expense, ...expenses]);
    });
    // Update simple streaks (one transaction per day)
    try {
      const uid = user ? user.id : 'guest';
      const key = `streak:${uid}`;
      const raw = localStorage.getItem(key);
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      let data = raw ? JSON.parse(raw) : { lastDate: '', count: 0, best: 0 };
      if (data.lastDate === todayStr) {
        // already counted today
      } else {
        const last = data.lastDate ? new Date(data.lastDate) : null;
        const diffDays = last ? Math.floor((today.getTime() - last.getTime()) / (1000*60*60*24)) : null;
        if (diffDays === 1) {
          data.count = (data.count || 0) + 1;
        } else {
          data.count = 1; // reset streak
        }
        data.lastDate = todayStr;
        data.best = Math.max(data.best || 0, data.count);
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch {}
    setNewExpense({
      amount: '',
      category: categories[0].name,
      description: '',
      type: 'expense',
    });
    setShowAddForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    api.delete(`/expenses/${id}`).then(async () => {
      const res = await api.get('/expenses');
      setExpenses(res.data || []);
      toast.success('Expense deleted successfully!');
    }).catch((err) => {
      console.error('Failed to delete expense:', err);
      toast.error('Failed to delete expense. Please try again.');
      // fallback optimistic
      setExpenses(expenses.filter(expense => expense.id !== id));
    });
  };

  const getTotalExpenses = () => {
    return expenses
      .filter(expense => expense.type === 'expense')
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalIncome = () => {
    return expenses
      .filter(expense => expense.type === 'income')
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryTotals = () => {
    const totals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      if (expense.type === 'expense') {
        totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
      }
    });
    return totals;
  };

  const categoryTotals = getCategoryTotals();

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'n') { setShowAddForm(true); }
      if (e.key === '/' && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
        const el = document.querySelector<HTMLInputElement>('input[placeholder="Search transactions..."]');
        if (el) { e.preventDefault(); el.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Export CSV
  const exportCsv = () => {
    const header = ['id','date','type','amount','category','description'];
    const rows = expenses.map(x => [x.id, x.date, x.type, x.amount.toString(), x.category, x.description]);
    const csv = [header, ...rows].map(r => r.map(f => '"' + String(f).replace(/"/g,'""') + '"').join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="expense-tracker-page" style={{ minHeight: '100vh', position: 'relative' }}>
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
            💰 Expense Tracker
          </h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--dark-brown)',
            fontSize: '1.1rem',
            marginBottom: '2rem',
          }}>
            Track your income and expenses with our farm-themed interface
          </p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="translucent-card" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <TrendingUp size={30} color="var(--farm-green)" />
              <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--farm-green)' }}>
                Total Income
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--farm-green)' }}>
              {formatCurrency(getTotalIncome())}
            </div>
          </div>

          <div className="translucent-card" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <TrendingDown size={30} color="var(--barn-red)" />
              <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--barn-red)' }}>
                Total Expenses
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--barn-red)' }}>
              {formatCurrency(getTotalExpenses())}
            </div>
          </div>

          <div className="translucent-card" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <DollarSign size={30} color="var(--accent-brown)" />
              <span style={{ marginLeft: '0.5rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                Net Balance
              </span>
            </div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: getTotalIncome() - getTotalExpenses() >= 0 ? 'var(--farm-green)' : 'var(--barn-red)' 
            }}>
              {formatCurrency(getTotalIncome() - getTotalExpenses())}
            </div>
          </div>
        </motion.div>

        {/* Add Expense Button */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: '2rem' }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
            style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
          >
            <Plus size={20} style={{ marginRight: '0.5rem' }} />
            {showAddForm ? 'Cancel' : 'Add New Expense/Income'}
          </button>
        </motion.div>

        {/* Add Expense Form */}
        {showAddForm && (
          <motion.div
            className="translucent-card"
            style={{ marginBottom: '2rem' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              Add New Transaction
            </h3>

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
                  Type
                </label>
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value as 'income' | 'expense' })}
                  className="input-field"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--accent-brown)',
                  fontWeight: '500',
                }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="input-field"
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--accent-brown)',
                  fontWeight: '500',
                }}>
                  Category
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category.name} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--accent-brown)',
                  fontWeight: '500',
                }}>
                  Description
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="input-field"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                onClick={handleAddExpense}
                className="btn-primary"
                style={{ fontSize: '1rem', padding: '0.8rem 1.5rem' }}
              >
                Add Transaction
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          className="translucent-card"
          style={{ marginBottom: '2rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--accent-brown)' }}>Quick actions</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-secondary" onClick={() => setShowAddForm(true)}>New (N)</button>
              <button className="btn-secondary" onClick={exportCsv}>Export CSV</button>
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            alignItems: 'end',
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--accent-brown)',
                fontWeight: '500',
              }}>
                <Search size={16} style={{ marginRight: '0.5rem' }} />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field"
                placeholder="Search transactions..."
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--accent-brown)',
                fontWeight: '500',
              }}>
                <Filter size={16} style={{ marginRight: '0.5rem' }} />
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--accent-brown)',
                fontWeight: '500',
              }}>
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input-field"
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Category Breakdown */}
        {Object.keys(categoryTotals).length > 0 && (
          <motion.div
            className="translucent-card"
            style={{ marginBottom: '2rem' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--accent-brown)',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}>
              <PieChart size={24} style={{ marginRight: '0.5rem' }} />
              Category Breakdown
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}>
              {Object.entries(categoryTotals).map(([category, total]) => {
                const categoryInfo = categories.find(cat => cat.name === category);
                const percentage = (total / getTotalExpenses()) * 100;
                
                return (
                  <div key={category} style={{
                    background: 'rgba(244, 241, 232, 0.7)',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(210, 180, 140, 0.3)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                        {categoryInfo?.icon}
                      </span>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                        {category}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--barn-red)' }}>
                      {formatCurrency(total)}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--dark-brown)' }}>
                      {percentage.toFixed(1)}% of total expenses
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Expense List */}
        <motion.div
          className="translucent-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: 'var(--accent-brown)',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}>
            <BarChart3 size={24} style={{ marginRight: '0.5rem' }} />
            Recent Transactions
          </h3>

          {filteredExpenses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--dark-brown)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
              <p style={{ fontSize: '1.1rem' }}>
                {expenses.length === 0 
                  ? 'No transactions yet. Add your first expense or income!' 
                  : 'No transactions match your current filters.'}
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filteredExpenses.map((expense, index) => {
                const categoryInfo = categories.find(cat => cat.name === expense.category);
                
                return (
                  <motion.div
                    key={expense.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      background: 'rgba(244, 241, 232, 0.7)',
                      borderRadius: '12px',
                      border: '1px solid rgba(210, 180, 140, 0.3)',
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>
                        {categoryInfo?.icon}
                      </span>
                      <div>
                        <div style={{ fontWeight: 'bold', color: 'var(--accent-brown)' }}>
                          {expense.description}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--dark-brown)' }}>
                          {expense.category} • {new Date(expense.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: expense.type === 'income' ? 'var(--farm-green)' : 'var(--barn-red)',
                      }}>
                        {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                      </div>
                      
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        style={{
                          background: 'var(--barn-red)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete transaction"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExpenseTrackerPage;






