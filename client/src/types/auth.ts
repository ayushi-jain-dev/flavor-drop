export type UserRole = 'CUSTOMER' | 'ADMIN' | 'RESTAURANT_OWNER' | 'DELIVERY_PARTNER';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};
