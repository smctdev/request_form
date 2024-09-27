import React, { createContext, useState, ReactNode, useContext } from 'react';

interface UserContextType {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
  branchCode: string | null;
  contact: string | null;
  signature: string | null;
  updateUser: (userId: string, firstName: string, lastName: string, email: string, role: string, branchCode: string, contact: string, signature: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [branchCode, setBranchCode] = useState<string | null>(null);
  const [contact, setContact] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const updateUser = (
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string,
    branchCode: string,
    contact: string,
    signature: string
  ) => {
    setUserId(userId);
    setFirstName(firstName);
    setLastName(lastName);
    setEmail(email);
    setRole(role);
    setBranchCode(branchCode);
    setContact(contact);
    setSignature(signature);
  };

  return (
    <UserContext.Provider value={{ userId, firstName, lastName, email, role, branchCode, contact, signature, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 
