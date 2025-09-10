import { Contact, PaginatedContacts, ContactsQuery } from '../types/contact';

const API_BASE_URL = 'https://apigw-be-apigateway.apps.itz-zmhpfy.infra01-lb.fra02.techzone.ibm.com/gateway/ContactManagementAPI/1.0.0';

class ContactAPI {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.Exception || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  }

  async getContacts(query: ContactsQuery = {}): Promise<PaginatedContacts> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const url = `${API_BASE_URL}/contacts${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<PaginatedContacts>(response);
  }

  async getContact(contactId: string): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<Contact>(response);
  }

  async createContact(contact: Omit<Contact, 'id' | 'creationDateTime' | 'lastUpdateDateTime'>): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(contact),
    });

    return this.handleResponse<Contact>(response);
  }

  async updateContact(contactId: string, contact: Contact): Promise<Contact> {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(contact),
    });

    return this.handleResponse<Contact>(response);
  }

  async deleteContact(contactId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<void>(response);
  }
}

export const contactApi = new ContactAPI();