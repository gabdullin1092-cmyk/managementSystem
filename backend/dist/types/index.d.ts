export interface User {
    id: number;
    name: string;
    address?: string;
    city?: string;
    birthday?: string;
    status: UserStatus;
    created_at: string;
    updated_at: string;
}
export declare enum UserStatus {
    ACTIVE = 10,
    INACTIVE = 20
}
export interface CreateUserRequest {
    name: string;
    address?: string;
    city?: string;
    birthday?: string;
    status?: UserStatus;
}
export interface UpdateUserRequest {
    name?: string;
    address?: string;
    city?: string;
    birthday?: string;
    status?: UserStatus;
}
export interface UserFilters {
    name?: string;
    city?: string;
    status?: UserStatus;
}
export interface PaginationParams {
    page: number;
    limit: number;
}
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
export interface PaginatedUsersResponse {
    users: User[];
    pagination: PaginationMeta;
}
export interface UserStatsResponse {
    total_users: string;
    status_10_count: string;
    status_20_count: string;
    unique_cities: string;
}
export interface DatabaseOperation {
    type: 'SELECT_ALL' | 'SELECT_BY_ID' | 'INSERT' | 'UPDATE' | 'DELETE';
}
export interface DatabaseResult<T> {
    rows: T[];
}
export interface DatabaseInsertData extends Omit<User, 'id' | 'created_at' | 'updated_at'> {
}
export interface DatabaseUpdateData {
    id: number;
    updates: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
}
export interface DatabaseSelectByIdData {
    id: number;
}
export interface DatabaseDeleteData {
    id: number;
}
export interface ApiError extends Error {
    statusCode?: number;
    code?: string;
}
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export declare const USER_STATUS_LABELS: Record<UserStatus, string>;
export declare const VALID_USER_STATUSES: readonly [UserStatus.ACTIVE, UserStatus.INACTIVE];
//# sourceMappingURL=index.d.ts.map