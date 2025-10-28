interface User {
    id: number;
    name: string;
    address?: string;
    city?: string;
    birthday?: string;
    status: 10 | 20;
    created_at: string;
    updated_at: string;
}
interface UserFilters {
    name?: string;
    city?: string;
    status?: 10 | 20;
}
interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
}
interface PaginatedUsersResponse {
    users: User[];
    pagination: PaginationMeta;
}
interface UserStatsResponse {
    total_users: string;
    status_10_count: string;
    status_20_count: string;
    unique_cities: string;
}
declare class UserModel {
    static getAll(page?: number, limit?: number, filters?: UserFilters): Promise<PaginatedUsersResponse>;
    static getById(id: number): Promise<User>;
    static create(userData: {
        name: string;
        address?: string;
        city?: string;
        birthday?: string;
        status?: 10 | 20;
    }): Promise<User>;
    static update(id: number, userData: {
        name?: string;
        address?: string;
        city?: string;
        birthday?: string;
        status?: 10 | 20;
    }): Promise<User>;
    static delete(id: number): Promise<User>;
    static getStatistics(): Promise<UserStatsResponse>;
}
export default UserModel;
export { User, UserFilters, PaginatedUsersResponse, UserStatsResponse };
//# sourceMappingURL=User.d.ts.map