import { useState, useEffect } from 'react';
import { Contact } from '../types/contact';
import { contactApi } from '../services/contactApi';

interface ContactFormProps {
  contact?: Contact;
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

export const ContactForm = ({ contact, onSave, onCancel }: ContactFormProps) => {
  const [formData, setFormData] = useState({
    salutation: '',
    firstName: '',
    middleName: '',
    lastName: '',
    birthDate: '',
    email: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setFormData({
        salutation: contact.salutation || '',
        firstName: contact.firstName,
        middleName: contact.middleName || '',
        lastName: contact.lastName,
        birthDate: contact.birthDate || '',
        email: contact.email,
        phoneNumber: contact.phoneNumber || ''
      });
    }
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const contactData = {
        ...formData,
        salutation: formData.salutation || undefined,
        middleName: formData.middleName || undefined,
        birthDate: formData.birthDate || undefined,
        phoneNumber: formData.phoneNumber || undefined
      } as Contact;

      let savedContact: Contact;
      
      if (contact?.id) {
        savedContact = await contactApi.updateContact(contact.id, { ...contactData, id: contact.id });
      } else {
        savedContact = await contactApi.createContact(contactData);
      }
      
      onSave(savedContact);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form">
      <div className="form-header">
        <h2>{contact?.id ? 'Edit Contact' : 'Create New Contact'}</h2>
        <button onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>

      {error && <div className="error">Error: {error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="salutation">Salutation</label>
            <select
              id="salutation"
              name="salutation"
              value={formData.salutation}
              onChange={handleChange}
            >
              <option value="">Select...</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Miss">Miss</option>
              <option value="Dr">Dr</option>
              <option value="Prof">Prof</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="middleName">Middle Name</label>
            <input
              type="text"
              id="middleName"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              maxLength={100}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="birthDate">Birth Date</label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : contact?.id ? 'Update Contact' : 'Create Contact'}
          </button>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};