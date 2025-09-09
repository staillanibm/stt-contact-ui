import { useState, useEffect } from 'react';
import { Contact } from './types/contact';
import { ContactList } from './components/ContactList';
import { ContactForm } from './components/ContactForm';
import { ContactDetail } from './components/ContactDetail';
import { contactApi } from './services/contactApi';
import './App.css';

type AppView = 'list' | 'form' | 'detail';

function App() {
  const [view, setView] = useState<AppView>('list');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('contact-api-key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setTempApiKey(savedApiKey);
      contactApi.setApiKey(savedApiKey);
    }
    setIsInitialized(true);
  }, []);

  const handleApiKeySubmit = () => {
    setApiKey(tempApiKey);
    contactApi.setApiKey(tempApiKey);
    
    // Save to localStorage
    if (tempApiKey) {
      localStorage.setItem('contact-api-key', tempApiKey);
    } else {
      localStorage.removeItem('contact-api-key');
    }
    
    setRefreshTrigger(prev => prev + 1);
  };

  const handleApiKeyClear = () => {
    setApiKey('');
    setTempApiKey('');
    contactApi.setApiKey('');
    localStorage.removeItem('contact-api-key');
    setRefreshTrigger(prev => prev + 1);
  };

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
    <div className="app">
      <header className="app-header">
        <h1>Contact Management System</h1>
        <div className="api-key-section">
          <label htmlFor="apiKey">API Key:</label>
          <input
            type="password"
            id="apiKey"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="Enter API key (optional for now)"
            onKeyPress={(e) => e.key === 'Enter' && handleApiKeySubmit()}
          />
          <button 
            onClick={handleApiKeySubmit}
            className="api-key-submit"
          >
            Set Key
          </button>
          {apiKey && (
            <>
              <span className="api-key-status">✓ Key set</span>
              <button 
                onClick={handleApiKeyClear}
                className="api-key-clear"
              >
                Clear
              </button>
            </>
          )}
        </div>
      </header>

      <main className="app-main">
        {!isInitialized ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}

export default App;