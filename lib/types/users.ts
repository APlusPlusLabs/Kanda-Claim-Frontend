import { Garage } from "./claims";

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
    garage?: Garage
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
    garages?: Garage[];
    email: string,
    phone: string,
    address: string,
    website: string,
    contact_person: any,
    description: string,
    min_amount_multisignature: number
};

