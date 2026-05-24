export type UserRole = 'admin' | 'superadmin';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
}
