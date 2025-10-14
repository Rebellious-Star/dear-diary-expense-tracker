import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ExpenseTrackerPage from './pages/ExpenseTrackerPage';
import ForumPage from './pages/ForumPage';
import TipsPage from './pages/TipsPage';
import ContactPage from './pages/ContactPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './pages/AdminPage';
import CustomBackground from './components/CustomBackground';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CustomBackground />
        <div className="App">
          <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#f4f1e8',
              color: '#8b4513',
              border: '1px solid #d2b48c',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/expenses" 
            element={
              <ProtectedRoute>
                <ExpenseTrackerPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/forum" 
            element={
              <ProtectedRoute>
                <ForumPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tips" 
            element={
              <ProtectedRoute>
                <TipsPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/contact" element={<ContactPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;









