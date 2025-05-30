export interface User {
    id: string;
    email: string;
    name: string;
    first_name: string;
    last_name: string;
    info: string;
    phone: string;
    role: any;
    role_id: string;
    tenant_id: string;
    tenant: Tenant;
    avatar: string;
    status: string;
    last_login: string;
    department_id?: string;
    department?: Department;
    garage_id: string;
    garage?: { name: string, phone: string; address: string; latitude?: number; longitude?: number, openHous?: string; description?: string; }
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
    users: User[];
    departments?: Department[];
};

