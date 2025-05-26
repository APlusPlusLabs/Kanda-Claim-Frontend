export interface User {
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
    status: string;
    last_login: string;
    department_id?: string;
    department?: Department;
}
export interface Role {
    id: string;
    name: string;
    tenant_id: string;
};
export interface Department {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
};

export interface Tenant {
    id: string;
    name: string;
};

