import React, { createContext, useContext, useState, useEffect } from "react";
import Cookie from "js-cookie";
import axiosInstance from "../axiosConfig";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    name: null,
    email: null,
    phoneNumber: null,
    image: null,
    role: null,
    isActive: null,
    channelId: localStorage.getItem("channelId") || null,
  });

  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId, role) => {
    try {
      const token = Cookie.get("token");
      if (!token || !role) return;

      const endpoint =
        role === "superadmin" ? `/superadmin/${userId}` : `/admin/me`;

      const response = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.data;

      if (!userData.isActive) {
        logout();
        return;
      }

      setUser((prev) => ({
        id: userData._id || userId,
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        image: userData.image?.url || "",
        role: userData.role || role,
        isActive: userData.isActive,

        // ✅ preserve channelId if backend doesn't send it
        channelId:
          userData.channelId !== undefined && userData.channelId !== null
            ? userData.channelId
            : prev.channelId,
      }));
    } catch (error) {
      console.error("Fetch user error:", error);
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
        const { id, role } = jwtDecode(token);
        await fetchUserData(id, role);
      } catch (error) {
        Cookie.remove("token");
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = async (email, password) => {
    let response;

    try {
      response = await axiosInstance.post("/superadmin/login", {
        email,
        password,
      });
    } catch {
      response = await axiosInstance.post("/admin/login", {
        email,
        password,
      });
    }

    const { token, data } = response.data;
    Cookie.set("token", token, { expires: 1 });

    setUser({
      id: data._id,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      image: data.image?.url || "",
      role: data.role,
      isActive: data.isActive,
      channelId: data.channelId || localStorage.getItem("channelId") || null,
    });

    return response.data;
  };

  const logout = () => {
    Cookie.remove("token");
    localStorage.removeItem("channelId");

    setUser({
      id: null,
      name: null,
      email: null,
      phoneNumber: null,
      image: null,
      role: null,
      isActive: null,
      channelId: null,
    });
  };

  const setChannelId = (channelId) => {
    localStorage.setItem("channelId", channelId);

    setUser((prev) => ({
      ...prev,
      channelId,
    }));
  };

  const updateUser = (updatedFields) => {
  setUser((prev) => ({
    ...prev,
    ...updatedFields,
  }));
};


  const value = {
    user,
    loading,
    login,
    logout,
    setChannelId,
    updateUser,
    isAuthenticated: !!user?.id,
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
