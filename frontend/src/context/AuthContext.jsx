/*
CONTEXT: AuthContext
FILE: context/AuthContext.jsx
FUNGSI:
- Menangani autentikasi client-side: menyimpan token, mengambil profil, login/register/logout
- Menyediakan hook `useAuth` untuk komponen lain
DIGUNAKAN OLEH:
App.jsx, halaman auth, dan komponen yang butuh data user
JIKA INGIN MENGUBAH:
- Perhatikan handling token di localStorage dan interceptor API
=================================
*/
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await authService.getProfile();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // If unauthorized, clear token
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    await fetchProfile();
  };

  const register = async (username, email, password) => {
    return await authService.register(username, email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    refreshProfile: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
