export interface AdminUser {
    id: string;
    roleId: string | null;
    permissions: string[];
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface VerifyOtpInput {
    email: string;
    otp: string;
}
