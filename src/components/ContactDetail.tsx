import { useState, useEffect } from 'react';
import { Contact } from '../types/contact';
import { contactApi } from '../services/contactApi';

interface ContactDetailProps {
  contactId: string;
  onEdit: (contact: Contact) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const ContactDetail = ({ contactId, onEdit, onDelete, onClose }: ContactDetailProps) => {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContact = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const contactData = await contactApi.getContact(contactId);
        setContact(contactData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contact');
      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, [contactId]);

  const handleDelete = async () => {
    if (!contact?.id) return;
    
    if (!confirm(`Are you sure you want to delete ${contact.firstName} ${contact.lastName}?`)) {
      return;
    }

    try {
      await contactApi.deleteContact(contact.id);
      onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('sv-SE', { 
      timeZone: 'Europe/Paris'
    }).replace(' ', ' ').slice(0, 16);
  };

  if (loading) {
    return <div className="loading">Loading contact details...</div>;
  }

  if (error) {
    return (
      <div className="contact-detail">
        <div className="error">Error: {error}</div>
        <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="contact-detail">
        <div className="error">Contact not found</div>
        <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    );
  }

  return (
    <div className="contact-detail">
      <div className="detail-header">
        <h2>Contact Details</h2>
        <div className="detail-actions">
          <button onClick={() => onEdit(contact)} className="btn-primary">
            Edit
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Delete
          </button>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h3>Personal Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Name:</label>
              <span>
                {contact.salutation && `${contact.salutation} `}
                {contact.firstName}
                {contact.middleName && ` ${contact.middleName}`}
                {` ${contact.lastName}`}
              </span>
            </div>

            <div className="detail-item">
              <label>Email:</label>
              <span>{contact.email}</span>
            </div>

            {contact.phoneNumber && (
              <div className="detail-item">
                <label>Phone:</label>
                <span>{contact.phoneNumber}</span>
              </div>
            )}

            {contact.birthDate && (
              <div className="detail-item">
                <label>Birth Date:</label>
                <span>{formatDate(contact.birthDate)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="detail-section">
          <h3>System Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>ID:</label>
              <span className="monospace">{contact.id}</span>
            </div>

            <div className="detail-item">
              <label>Created:</label>
              <span>{formatDateTime(contact.creationDateTime)}</span>
            </div>

            <div className="detail-item">
              <label>Last Updated:</label>
              <span>{formatDateTime(contact.lastUpdateDateTime)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};