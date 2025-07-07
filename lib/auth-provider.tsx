"use client";

import router from "next/router";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "./types/users";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL
const WEB_URL = process.env.NEXT_PUBLIC_APP_WEB_URL


interface AuthContextType {
  user: User;
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
  webRequest: (url: string, method?: string, data?: any) => Promise<any>;
  apiPOST: (data: any, url: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | any>();
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
              status: parsedUser.status,
              last_login: parsedUser.last_login,
              department_id: parsedUser.department_id,
              department: parsedUser.department,
              garage_id: parsedUser.garage_id,
              garage: parsedUser.garage,
              vehicles: parsedUser.vehicles
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
  async function login(data: { email: string; password: string; redirect?: true; }) {
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
        status: uzer.status,
        last_login: uzer.last_login,
        department_id: uzer.department_id,
        department: uzer.department,
        garage_id: uzer.garage_id,
        garage: uzer.garage,
        vehicles: uzer.vehicles,
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
    window.location.assign('/');
  }
  //api POST
  async function apiPOST(data: any, urlpath: string) {
    const tenant_id = sessionStorage.getItem('tenetIed') || null
    try {
      // const response = await fetch(`https://cors-anywhere.herokuapp.com/${API_URL}${urlpath}`, {
      const response = await fetch(`${API_URL}${urlpath}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          tenant_id: data.tenant_id ? data.tenant_id : tenant_id,
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.log("API POST data", data);
        console.log("API POST errorResponse", errorResponse);
        throw new Error(
          errorResponse.errors?.[0]?.message || "API POSR failed"
        );
      }

      await response.json();
    } catch (error) {
      throw error;
    }
  }

  // API Request, this will be used to connect to any endpoint in our backend system

  async function apiRequest(url: string, method: string = "GET", data: any = null) {
    try {
      const headers: HeadersInit = {}
      const options: RequestInit = {
        method,
        headers: {} as Record<string, string>,
        // Add credentials to handle cookies and auth headers properly
        credentials: 'include',
        // Enable CORS mode explicitly
        mode: 'cors'
      };

      if (data) {
        if (data instanceof FormData) {
          options.body = data;
        } else {
          headers["Content-Type"] = "application/json";
          options.body = JSON.stringify(data);
        }
      }
      options.headers = headers
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }

      return await response.text();
    } catch (error: any) {
      console.error("API request error:", error);
      throw error;
    }
  };
  // Web Request, this will be used to connect to any endpoint in our backend system
  async function webRequest(url: string, method: string = "GET", data: any = null) {
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
      headers["X-CSRF-TOKEN"] = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "";
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
    <AuthContext.Provider value={{ user, register, login, logout, apiRequest, webRequest, apiPOST }}>
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