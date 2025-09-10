import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Contact } from './types/contact';
import { ContactList } from './components/ContactList';
import { ContactForm } from './components/ContactForm';
import { ContactDetail } from './components/ContactDetail';
import { LoginScreen } from './components/LoginScreen';
import { UserProfile } from './components/UserProfile';
import TokenInfo from './pages/TokenInfo';
import { contactApi } from './services/contactApi';
import { useAuth } from './auth/AuthContext';
import './App.css';

type AppView = 'list' | 'form' | 'detail';

function App() {
  const { isAuthenticated, isLoading, getAccessToken } = useAuth();
  const [view, setView] = useState<AppView>('list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Update access token when authentication state changes
  useEffect(() => {
    const token = getAccessToken();
    console.log('🔑 Setting access token:', token ? `${token.substring(0, 50)}...` : 'null');
    contactApi.setAccessToken(token);
  }, [isAuthenticated, getAccessToken]);


  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setView('detail');
  };

  const handleCreateContact = () => {
    setEditingContact(null);
    setView('form');
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setView('form');
  };

  const handleSaveContact = () => {
    setView('list');
    setEditingContact(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteContact = () => {
    setView('list');
    setSelectedContact(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setView('list');
    setEditingContact(null);
    setSelectedContact(null);
  };

  return (
    <Router>
      <Routes>
        {/* Callback route - handled by AuthProvider */}
        
        {/* Loading state */}
        {isLoading && (
          <Route path="*" element={
            <div className="app">
              <div className="loading">Loading...</div>
            </div>
          } />
        )}
        
        {/* Not authenticated - show login */}
        {!isAuthenticated && !isLoading && (
          <Route path="*" element={<LoginScreen />} />
        )}
        
        {/* Authenticated routes */}
        {isAuthenticated && (
          <>
            <Route path="/tokens" element={
              <div className="app">
                <header className="app-header">
                  <h1>Contact Management System</h1>
                  <UserProfile />
                </header>
                <main className="app-main">
                  <TokenInfo />
                </main>
              </div>
            } />
            
            <Route path="/" element={
              <div className="app">
                <header className="app-header">
                  <h1>Contact Management System</h1>
                  <UserProfile />
                </header>
                <main className="app-main">
                  {view === 'list' && (
                    <ContactList
                      onSelectContact={handleSelectContact}
                      onCreateContact={handleCreateContact}
                      refreshTrigger={refreshTrigger}
                    />
                  )}
                  {view === 'form' && (
                    <ContactForm
                      contact={editingContact || undefined}
                      onSave={handleSaveContact}
                      onCancel={handleCancel}
                    />
                  )}
                  {view === 'detail' && selectedContact && (
                    <ContactDetail
                      contactId={selectedContact.id!}
                      onEdit={handleEditContact}
                      onDelete={handleDeleteContact}
                      onClose={handleCancel}
                    />
                  )}
                </main>
              </div>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;