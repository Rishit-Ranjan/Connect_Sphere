import { createContext, useContext, useEffect, useState } from "react";
import { getSavedState, saveState } from "../mockData";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() =>
    getSavedState("current_user", null)
  );

  useEffect(() => {
    saveState("current_user", currentUser);
  }, [currentUser]);

  const login = (user) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        login,
        logout,
        isAuthenticated: !!currentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}