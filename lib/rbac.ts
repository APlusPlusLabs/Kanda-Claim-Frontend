// Role-Based Access Control (RBAC) system

export type Permission =
  | "view:claims"
  | "create:claims"
  | "edit:claims"
  | "delete:claims"
  | "approve:claims"
  | "reject:claims"
  | "view:users"
  | "create:users"
  | "edit:users"
  | "delete:users"
  | "view:analytics"
  | "view:documents"
  | "upload:documents"
  | "delete:documents"
  | "view:assessments"
  | "create:assessments"
  | "edit:assessments"
  | "view:garages"
  | "manage:garages"
  | "view:settings"
  | "edit:settings"

export type Role = "admin" | "manager" | "agent" | "assessor" | "readonly"

// Define permissions for each role
const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "view:claims",
    "create:claims",
    "edit:claims",
    "delete:claims",
    "approve:claims",
    "reject:claims",
    "view:users",
    "create:users",
    "edit:users",
    "delete:users",
    "view:analytics",
    "view:documents",
    "upload:documents",
    "delete:documents",
    "view:assessments",
    "create:assessments",
    "edit:assessments",
    "view:garages",
    "manage:garages",
    "view:settings",
    "edit:settings",
  ],
  manager: [
    "view:claims",
    "create:claims",
    "edit:claims",
    "approve:claims",
    "reject:claims",
    "view:users",
    "view:analytics",
    "view:documents",
    "upload:documents",
    "view:assessments",
    "create:assessments",
    "edit:assessments",
    "view:garages",
    "manage:garages",
    "view:settings",
  ],
  agent: [
    "view:claims",
    "create:claims",
    "edit:claims",
    "view:documents",
    "upload:documents",
    "view:assessments",
    "view:garages",
  ],
  assessor: [
    "view:claims",
    "view:documents",
    "upload:documents",
    "view:assessments",
    "create:assessments",
    "edit:assessments",
    "view:garages",
  ],
  readonly: ["view:claims", "view:documents", "view:assessments", "view:garages", "view:analytics"],
}

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission)
}

// Get all permissions for a role
export function getPermissionsForRole(role: Role): Permission[] {
  return rolePermissions[role]
}

// Get all roles that have a specific permission
export function getRolesWithPermission(permission: Permission): Role[] {
  return Object.entries(rolePermissions)
    .filter(([_, permissions]) => permissions.includes(permission))
    .map(([role]) => role as Role)
}

// Check if a user has access to a specific feature
export function checkAccess(role: Role, requiredPermission: Permission): boolean {
  return hasPermission(role, requiredPermission)
}
