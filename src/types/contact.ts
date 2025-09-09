export interface Contact {
  id?: string;
  salutation?: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Dr' | 'Prof';
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate?: string;
  email: string;
  phoneNumber?: string;
  creationDateTime?: string;
  lastUpdateDateTime?: string;
}

export interface PaginatedContacts {
  itemCount: number;
  hasMore: boolean;
  contacts: Contact[];
}

export interface ContactsQuery {
  lastName?: string;
  firstName?: string;
  lastUpdateBefore?: string;
  lastUpdateAfter?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'id' | 'lastName' | 'lastUpdateDateTime';
  sortOrder?: 'ascending' | 'descending';
}

export interface APIError {
  Exception: string;
  Code: string;
  TransactionId: string;
}