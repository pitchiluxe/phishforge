export interface LoginDto {
    email: string;
    password: string;
}
export interface RegisterDto {
    email: string;
    password: string;
    full_name: string;
    organization_name: string;
}
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        full_name?: string;
        role: string;
        organization_id: string;
    };
    access_token: string;
    refresh_token?: string;
}
export interface MFASetupResponse {
    qr_code: string;
    secret: string;
}
export interface ResetPasswordDto {
    email: string;
}
export interface UpdatePasswordDto {
    new_password: string;
    access_token: string;
}
