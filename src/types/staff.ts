export interface Role {
    id: string;
    name: string;
    description?: string;
}

export interface Staff {
    id: string;
    name: string;
    email: string;
    status: "ACTIVE" | "INACTIVE";
    roleId: string | null;
    role?: Role;
    createdAt: string;
}

export interface CreateStaffInput {
    name: string;
    email: string;
    password: string;
    roleId: string;
}

export interface UpdateStaffInput {
    name?: string;
    email?: string;
    roleId?: string;
}
