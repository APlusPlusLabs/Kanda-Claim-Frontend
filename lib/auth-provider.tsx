"use client";

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
    setUserFromSession: (userData: User) => void;
   // updateUser: ()
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | any>();
    const [token, setToken] = useState<String | null>(null);
    const [tenantId, setTenantId] = useState<String | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper function to set user from session data
    const setUserFromSession = (userData: User) => {
        setUser({
            id: userData.id,
            email: userData.email,
            phone: userData.phone,
            first_name: userData.first_name,
            last_name: userData.last_name,
            name: `${userData.first_name} ${userData.last_name || ""}`.trim(),
            role: userData.role,
            role_id: userData.role_id,
            tenant: userData.tenant,
            tenant_id: userData.tenant_id,
            avatar: "/placeholder.svg?height=40&width=40",
            status: userData.status,
            last_login: userData.last_login,
            department_id: userData.department_id,
            department: userData.department,
            garage_id: userData.garage_id,
            garage: userData.garage,
            vehicles: userData.vehicles
        });
    }

    // Load user from session
    useEffect(() => {
        async function loadUser() {
            try {
                const sessionUser = sessionStorage.getItem("sessuza");
                const sessionToken = sessionStorage.getItem("ottqen");
                const sessionTenantId = sessionStorage.getItem("tenetIed");

                if (sessionUser && sessionToken) {
                    const parsedUser: User = JSON.parse(sessionUser);

                    if (parsedUser.id && parsedUser.email && parsedUser.first_name) {
                        setUserFromSession(parsedUser);
                        setToken(sessionToken);
                        if (sessionTenantId) {
                            setTenantId(sessionTenantId);
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading user from sessionStorage:", error);
                // Clear corrupted session data
                sessionStorage.removeItem("sessuza");
                sessionStorage.removeItem("ottqen");
                sessionStorage.removeItem("tenetIed");
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
                    errorResponse.error || errorResponse.errors || "Registration failed"
                );
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Login
    async function login(data: { email: string; password: string }) {
        try {
            const response = await fetch(`${API_URL}login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                console.log("Login data", data);
                console.log("Login errorResponse", result);

                // Handle activation needed case
                if (response.status === 403 && result.needs_activation) {
                    throw {
                        needs_activation: true,
                        email: result.email || data.email,
                        message: result.error || "Account activation required"
                    };
                }

                throw new Error(result.error || "Login failed");
            }

            // Successful login - store user data
            sessionStorage.setItem("ottqen", result.token);
            const uzer = result.user;

            setUserFromSession(uzer);
            setToken(result.token);
            setTenantId(uzer.tenant_id);

            sessionStorage.setItem("sessuza", JSON.stringify(uzer));
            sessionStorage.setItem("tenetIed", JSON.stringify(uzer.tenant_id));

            // Redirect based on role
            const rolename = uzer.role.name.toLowerCase();
            const roleurl = rolename === 'admin' ? 'insurer' : rolename;
            window.location.assign(`/dashboard/${roleurl}`);
        } catch (error) {
            throw error;
        }
    }

    // Logout
    function logout() {
        sessionStorage.removeItem("ottqen");
        sessionStorage.removeItem("sessuza");
        sessionStorage.removeItem("tenetIed");
        setUser(null);
        setToken(null);
        setTenantId(null);
        window.location.assign('/');
    }

    // API Request
    //   async function apiRequest(url: string, method: string = "GET", data: any = null) {
    //     try {
    //       const sessionToken = sessionStorage.getItem("ottqen");
    //       const headers: HeadersInit = {
    //         'Accept': 'application/json',
    //       };

    //       // Add authorization header if token exists
    //       if (sessionToken) {
    //         headers["Authorization"] = `Bearer ${sessionToken}`;
    //       }

    //       const options: RequestInit = {
    //         method,
    //         headers,
    //         credentials: 'include',
    //         mode: 'cors'
    //       };

    //       if (data) {
    //         if (data instanceof FormData) {
    //           options.body = data;
    //           // Don't set Content-Type for FormData, let browser handle it
    //         } else {
    //           headers["Content-Type"] = "application/json";
    //           options.body = JSON.stringify(data);
    //         }
    //       }

    //       const response = await fetch(url, options);

    //       if (!response.ok) {
    //         // Handle unauthorized responses
    //         if (response.status === 401) {
    //           logout();
    //           throw new Error("Session expired. Please login again.");
    //         }

    //         const errorResponse = await response.json();
    //         console.log("API request error for data:", data);
    //         console.log("API errorResponse:", errorResponse);

    //         throw new Error(
    //           errorResponse.error || 
    //           errorResponse.message || 
    //           errorResponse.errors || 
    //           `Request failed with status ${response.status}`
    //         );
    //       }

    //       // Check if the response is JSON
    //       const contentType = response.headers.get("content-type");
    //       if (contentType && contentType.includes("application/json")) {
    //         return await response.json();
    //       }

    //       return await response.text();
    //     } catch (error: any) {
    //       console.error("API request error:", error);
    //       throw error;
    //     }
    //   }
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
                //   throw new Error(`HTTP error! Status: ${response.status}`);
                const errorResponse = await response.json();
                console.log("request error for data", data);
                console.log("request errorResponse", errorResponse);
                throw new Error(
                    errorResponse.error || errorResponse.errors || "request failed"
                );
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
    // API POST (keeping for backward compatibility)
    async function apiPOST(data: any, urlpath: string) {
        const tenant_id = sessionStorage.getItem('tenetIed') || null;
        try {
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
                    errorResponse.errors?.[0]?.message || "API POST failed"
                );
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }

    // Web Request
    async function webRequest(url: string, method: string = "GET", data: any = null) {
        try {
            const sessionToken = sessionStorage.getItem("ottqen");
            const headers: HeadersInit = {};

            // Only set Content-Type for non-FormData payloads
            if (!(data instanceof FormData)) {
                headers["Content-Type"] = "application/json";
            }

            if (sessionToken) {
                headers["Authorization"] = `Bearer ${sessionToken}`;
            }

            // Add CSRF token if available
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
            if (csrfToken) {
                headers["X-CSRF-TOKEN"] = csrfToken;
            }

            const config: RequestInit = {
                method,
                headers,
            };

            if (data) {
                config.body = data instanceof FormData ? data : JSON.stringify(data);
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
    const updateUser = (updaterFunction: (arg0: any) => any) => {
        setUser((prevUser: any) => {
            const updatedUser = typeof updaterFunction === 'function'
                ? updaterFunction(prevUser)
                : updaterFunction;
            sessionStorage.setItem("sessuza", JSON.stringify(updatedUser));
            return updatedUser;
        });
    };
    // Loading state
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{
            user,
            register,
            login,
            logout,
            apiRequest,
            webRequest,
            apiPOST,
            setUserFromSession,
           // updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Auth hook
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}