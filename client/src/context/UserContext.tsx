import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
} from "react";
import axios from "axios";

interface UserContextType {
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
  branchCode: string | null;
  contact: string | null;
  signature: string | null;
  isAuthenticated: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  updateUser: (
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    role: string,
    branchCode: string,
    contact: string,
    signature: string
  ) => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [branchCode, setBranchCode] = useState<string | null>(null);
  const [contact, setContact] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchUserProfile = async () => {
      if (!token) {
        setUserId(null);
        setLoading(false); // Ensure loading is set to false
        return;
      }
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 200) {
          setUserId(response.data.data.id);
          setFirstName(response.data.data.firstName);
          setLastName(response.data.data.lastName);
          setEmail(response.data.data.email);
          setRole(response.data.data.role);
          setBranchCode(response.data.data.branchCode);
          setContact(response.data.data.contact);
          setSignature(response.data.data.signature);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserProfile();
  }, []);
  
  return (
    <UserContext.Provider
      value={{
        setIsAuthenticated,
        setLoading,
        isAuthenticated,
        userId,
        firstName,
        lastName,
        email,
        role,
        branchCode,
        contact,
        signature,
        updateUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default UserContext;
