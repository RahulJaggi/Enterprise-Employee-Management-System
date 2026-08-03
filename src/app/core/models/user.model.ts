export type UserRole = 'Admin' | 'HR' | 'Manager';

export interface User {
  username: string;
  email: string;
  role: UserRole;
  token: string;
}
