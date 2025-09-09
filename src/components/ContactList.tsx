import { useState, useEffect } from 'react';
import { Contact, ContactsQuery } from '../types/contact';
import { contactApi } from '../services/contactApi';

interface ContactListProps {
  onSelectContact: (contact: Contact) => void;
  onCreateContact: () => void;
  refreshTrigger?: number;
}

export const ContactList = ({ onSelectContact, onCreateContact, refreshTrigger }: ContactListProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<ContactsQuery>({
    limit: 200,
    offset: 0,
    sortBy: 'id',
    sortOrder: 'ascending'
  });
  const [hasMore, setHasMore] = useState(false);

  const loadContacts = async (resetList = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentQuery = resetList ? { ...query, offset: 0 } : query;
      const response = await contactApi.getContacts(currentQuery);
      
      if (resetList) {
        setContacts(response.contacts);
      } else {
        setContacts(prev => [...prev, ...response.contacts]);
      }
      
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts(true);
  }, [query.firstName, query.lastName, query.sortBy, query.sortOrder, refreshTrigger]);

  const handleSearch = (field: 'firstName' | 'lastName', value: string) => {
    setQuery(prev => ({ ...prev, [field]: value || undefined, offset: 0 }));
  };

  const loadMore = () => {
    setQuery(prev => ({ ...prev, offset: (prev.offset || 0) + (prev.limit || 200) }));
  };

  useEffect(() => {
    if (query.offset && query.offset > 0) {
      loadContacts(false);
    }
  }, [query.offset]);


  if (loading && contacts.length === 0) {
    return <div className="loading">Loading contacts...</div>;
  }

  return (
    <div className="contact-list">
      <div className="contact-list-header">
        <h2>Contacts</h2>
        <button onClick={onCreateContact} className="btn-primary">
          Add New Contact
        </button>
      </div>

      <div className="search-filters">
        <input
          type="text"
          placeholder="Search by first name..."
          onChange={(e) => handleSearch('firstName', e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by last name..."
          onChange={(e) => handleSearch('lastName', e.target.value)}
        />
        <select
          value={query.sortBy}
          onChange={(e) => setQuery(prev => ({ 
            ...prev, 
            sortBy: e.target.value as 'id' | 'lastName' | 'lastUpdateDateTime'
          }))}
        >
          <option value="id">Sort by ID</option>
          <option value="lastName">Sort by Last Name</option>
          <option value="lastUpdateDateTime">Sort by Last Updated</option>
        </select>
        <select
          value={query.sortOrder}
          onChange={(e) => setQuery(prev => ({ 
            ...prev, 
            sortOrder: e.target.value as 'ascending' | 'descending'
          }))}
        >
          <option value="ascending">Ascending</option>
          <option value="descending">Descending</option>
        </select>
      </div>

      {error && <div className="error">Error: {error}</div>}

      <div className="contacts-table-container">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Birth Date</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr 
                key={contact.id}
                className="contact-row"
                onClick={() => onSelectContact(contact)}
              >
                <td className="contact-name">
                  {contact.salutation && `${contact.salutation} `}
                  {contact.firstName}
                  {contact.middleName && ` ${contact.middleName}`}
                  {` ${contact.lastName}`}
                </td>
                <td className="contact-email">{contact.email}</td>
                <td className="contact-phone">{contact.phoneNumber || '-'}</td>
                <td className="contact-birth-date">
                  {contact.birthDate ? new Date(contact.birthDate).toISOString().split('T')[0] : '-'}
                </td>
                <td className="contact-updated">
                  {contact.lastUpdateDateTime ? 
                    new Date(contact.lastUpdateDateTime).toLocaleString('sv-SE', { 
                      timeZone: 'Europe/Paris'
                    }).replace(' ', ' ').slice(0, 16) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {contacts.length === 0 && !loading && (
          <div className="no-contacts">No contacts found</div>
        )}
      </div>

      {hasMore && (
        <div className="load-more">
          <button onClick={loadMore} disabled={loading} className="btn-secondary">
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};