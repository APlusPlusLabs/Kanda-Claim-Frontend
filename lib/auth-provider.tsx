"use client";

import router from "next/router";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL

interface User {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: any;
  role_id: string;
  tenant_id: string;
  tenant: any;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    insuranceCompanyName?: string;
    tenantId?: string;
  }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  apiRequest: (url: string, method?: string, data?: any) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<String | null>(null);
  const [tenantId, setTenantId] = useState<String | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from session
  useEffect(() => {
    async function loadUser() {
      try {
        const sessionUser = sessionStorage.getItem("sessuza");
        if (sessionUser) {
          const parsedUser: User = JSON.parse(sessionUser);

          if (parsedUser.id && parsedUser.email && parsedUser.first_name) {
            setUser({
              id: parsedUser.id,
              email: parsedUser.email,
              phone: parsedUser.phone,
              first_name: parsedUser.first_name,
              last_name: parsedUser.last_name,
              name: `${parsedUser.first_name} ${parsedUser.last_name || ""}`.trim(),
              role: parsedUser.role,
              role_id: parsedUser.role_id,
              tenant: parsedUser.tenant,
              tenant_id: parsedUser.tenant_id,
              avatar: "/placeholder.svg?height=40&width=40",
            });
          }
        }
      } catch (error) {
        console.error("Error loading user from sessionStorage:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // Register
  async function register(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    insuranceCompanyName?: string;
    tenantId?: string;
  }) {
    try {
      const response = await fetch(`${API_URL}register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          tenantId: data.role !== "insurer" ? data.tenantId : undefined,
          insuranceCompanyName: data.role === "insurer" ? data.insuranceCompanyName : undefined,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("Register data", data);
        console.log("Register errorResponse", errorResponse);
        throw new Error(
          errorResponse.errors?.[0]?.message || "Registration failed"
        );
      }

      await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Login function
  async function login(data: { email: string; password: string }) {
    data
    try {
      const response = await fetch(`${API_URL}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("Login data", data);
        console.log("Login errorResponse", errorResponse);
        throw new Error(
          errorResponse.errors?.[0]?.message || "Login failed"
        );
      }

      const result = await response.json();
      sessionStorage.setItem("ottqen", result.token);
      const uzer = result.user
      setUser({
        id: uzer.id,
        email: uzer.email,
        phone: uzer.phone,
        first_name: uzer.first_name,
        last_name: uzer.last_name,
        name: `${uzer.first_name} ${uzer.last_name || ""}`.trim(),
        role: uzer.role,
        role_id: uzer.role_id,
        tenant: uzer.tenant,
        tenant_id: uzer.tenant_id,
        avatar: "/placeholder.svg?height=40&width=40",
      });
      setToken(JSON.stringify(result.token))
      setTenantId(JSON.stringify(uzer.tenant_id))
      sessionStorage.setItem("sessuza", JSON.stringify(result.user));
      sessionStorage.setItem("tenetIed", JSON.stringify(uzer.tenant_id));
      // Redirect based on role
      const rolename = uzer.role.name.toLowerCase()
      const roleurl = rolename === 'admin' ? 'insurer' : rolename
      window.location.assign(`/dashboard/${roleurl}`)
    } catch (error) {
      throw error;
    }
  }

  // Logout
  function logout() {
    sessionStorage.removeItem("ottqen");
    sessionStorage.removeItem("sessuza");
    setUser(null);
    window.location.href = "/login";
  }

  // API Request, this will be used to connect to any endpoint in our backend system
  async function apiRequest(url: string, method: string = "GET", data: any = null) {
    try {
      const token = sessionStorage.getItem("ottqen");
      const headers: HeadersInit = {
        // "Content-Type": "application/json",
       // "Content-Type": "multipart/form-data",
      };
      // Only set Content-Type for non-FormData payloads (e.g., JSON)
      if (!(data instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method,
        headers,
      };

      if (data) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorResponse = await response.json();
        if (response.status === 401) {
          logout();
        }
        throw new Error(errorResponse.message || "Request failed");
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  // loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout, apiRequest }}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth use
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}