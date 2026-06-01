'use client';

import { createContext, ReactNode, useContext } from 'react';

type RoleType = 'admin' | 'sales' | 'marketing';

export type UserType = {
  _id?: string;
  name: string;
  email: string;
  role: RoleType;
  employeeId?: string;
  department?: string;
  avatar?: string;
} | null;

type UserContextType = {
  user: UserType;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export default function UserProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: UserType;
}) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};