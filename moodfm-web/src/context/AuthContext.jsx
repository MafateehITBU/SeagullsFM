import React, { createContext, useContext, useState, useEffect } from "react";
import Cookie from "js-cookie";
import axiosInstance from "../axiosConfig";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    name: null,
    email: null,
    phoneNumber: null,
    image: null,
    isActive: null,
  });
  const [loading, setLoading] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);

  // Detect user interaction once
  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true);
      window.removeEventListener("click", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    return () => window.removeEventListener("click", handleInteraction);
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const token = Cookie.get("token");
      if (!token) return;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axiosInstance.get("/user/me", config);

      const userData = response.data.data;

      if (!userData.isActive) {
        // If user is not active, logout and redirect or show message
        logout();
        toast.error("Your account is deactivated. Please contact support.");
        return;
      }

      setUser({
        id: userData._id || userId,
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        image: userData.image?.url || "",
        isActive: userData.isActive,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      logout();
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      const token = Cookie.get("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const { id } = decoded;

        await fetchUserData(id);
      } catch (error) {
        console.error("Error initializing user:", error);
        Cookie.remove("token");
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [userInteracted]);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/user/login", {
        email,
        password,
      });

      const token = response.data.token;

      if (!token || typeof token !== "string") {
        throw new Error("Invalid token received");
      }

      Cookie.set("token", token, { expires: 1 });

      const decoded = jwtDecode(token);
      const { id } = decoded;

      await fetchUserData(id);

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    Cookie.remove("token");
    setUser({
      id: null,
      name: null,
      email: null,
      phoneNumber: null,
      image: null,
      isActive: null,
    });
  };

  const register = async (name, email, password, phone, channelId) => {
    try {
      const response = await axiosInstance.post("/user/register", {
        name,
        email,
        password,
        phoneNumber: phone,
        channelId: channelId,
      });

      const token = response.data.token;

      if (!token || typeof token !== "string") {
        throw new Error("Invalid token received");
      }

      Cookie.set("token", token, { expires: 1 });

      const decoded = jwtDecode(token);
      const { id } = decoded;

      await fetchUserData(id);

      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user?.id,
    updateUser: (newUserData) => {
      setUser((prev) => ({
        ...prev,
        ...newUserData,
      }));
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
