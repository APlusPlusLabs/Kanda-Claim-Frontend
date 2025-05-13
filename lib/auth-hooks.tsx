"use client"

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    role_id: string;
    tenant_id: string;
}
export function useAuth() {
    async function register(data: any) {
        const response = await fetch(API_URL + "register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const errorResponse = await response.json();
            console.log('Register data', data);
            console.log('Register errorResponse', errorResponse);

            throw new Error(errorResponse.errors?.[0]?.message || "Registration failed " + errorResponse)
        }

        return response.json()
    }
    async function login(data: any) {
        const response = await fetch(API_URL + "login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })

        if (!response.ok) {
            const errorResponse = await response.json();
            console.log('login data', data);
            console.log('login errorResponse', errorResponse);

            throw new Error(errorResponse.errors?.[0]?.message || "login failed " + errorResponse)
        }
        const result = await response.json();

        sessionStorage.setItem('ottqen', result.token);
        sessionStorage.setItem('sessuza', JSON.stringify(result.user));

        return response
    }

    async function apiRequest(url: string, method: string = 'GET', data: any = null) {
        const token = sessionStorage.getItem('authToken');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
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
            throw new Error(errorResponse.message || 'Request failed');
        }

        return response.json();
    }

    async function user() {
        const sessionUser = sessionStorage.getItem('sessuza');
        // setUser(JSON.parse(sessionUser))
        if (sessionUser) {
            const uss = JSON.parse(sessionUser)
         //   const user = ({ id: uss.id, role_id: uss.role_id, tenant_id: uss.tenant_id, first_name: uss.first_name, last_name: uss.last_name, phone: uss.phone, email: uss.email, })
            const parsedUser: User = JSON.parse(sessionUser);
            return parsedUser
        }
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Cant Retrieve User Info, Login again!');
    }
    return { register, login, user }
}