import { createContext, useContext, useEffect, useState } from "react";

// Create the Context
const UserAuthContext = createContext({
  user: null,
  token: null,
  login: (userData, authToken) => {},
  logout: () => {},
  updateProfilePicture: (newImageUrl) => {},
  isAuthenticated: false,
});

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user and token from sessionStorage on app start
  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");
      const storedToken = sessionStorage.getItem("token");
      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Clear invalid data
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    }
  }, []);

  // Login Function
  const login = (userData, authToken) => {
    console.log('Login called with:', { userData, authToken });
    if (!userData || !authToken) {
      console.error('Invalid login data');
      return;
    }

    // Ensure we have all required user data
    const userToStore = {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      profilePicture: userData.profilePicture,
      phone: userData.phone,
      address: userData.address,
      description: userData.description,
    };

    setUser(userToStore);
    setToken(authToken);
    setIsAuthenticated(true);

    // Store in sessionStorage
    sessionStorage.setItem("user", JSON.stringify(userToStore));
    sessionStorage.setItem("token", authToken);
    
    // Also store in localStorage for persistence
    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("token", authToken);
  };

  // Logout Function
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    
    // Clear from both storages
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Update Profile Picture Function
  const updateProfilePicture = (newImageUrl) => {
    if (user) {
      const updatedUser = { ...user, profilePicture: newImageUrl };
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <UserAuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        logout, 
        updateProfilePicture,
        isAuthenticated 
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};

// ✅ Custom Hook to use UserAuthContext
export const useUserAuth = () => useContext(UserAuthContext);

export default UserAuthContext;
