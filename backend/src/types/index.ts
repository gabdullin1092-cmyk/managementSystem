// Базовые типы для пользователя
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

// Возможные статусы пользователя
export enum UserStatus {
  ACTIVE = 10,
  INACTIVE = 20
}

// Тип для создания нового пользователя (без id и timestamp полей)
export interface CreateUserRequest {
  name: string;
  address?: string;
  city?: string;
  birthday?: string;
  status?: UserStatus;
}

// Тип для обновления пользователя (все поля опциональные кроме id)
export interface UpdateUserRequest {
  name?: string;
  address?: string;
  city?: string;
  birthday?: string;
  status?: UserStatus;
}

// Типы для фильтрации и пагинации
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

// Ответы API
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

// Типы для операций базы данных
export interface DatabaseOperation {
  type: 'SELECT_ALL' | 'SELECT_BY_ID' | 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface DatabaseResult<T> {
  rows: T[];
}

export interface DatabaseInsertData extends Omit<User, 'id' | 'created_at' | 'updated_at'> {}

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

// Типы для компаний
export interface CompanyEmployee {
  userId: number;
  userName: string;
}

export interface Company {
  id: number;
  name: string;
  idn: string;
  address?: string;
  status: CompanyStatus;
  users: CompanyEmployee[];
  created_at: string;
  updated_at: string;
}

// Возможные статусы компании
export enum CompanyStatus {
  ACTIVE = 10,
  INACTIVE = 20
}

// Тип для создания новой компании
export interface CreateCompanyRequest {
  name: string;
  idn: string;
  address?: string;
  status?: CompanyStatus;
  users?: CompanyEmployee[];
}

// Тип для обновления компании
export interface UpdateCompanyRequest {
  name?: string;
  idn?: string;
  address?: string;
  status?: CompanyStatus;
  users?: CompanyEmployee[];
}

// Типы для фильтрации компаний
export interface CompanyFilters {
  name?: string;
  idn?: string;
  status?: CompanyStatus;
}

export interface PaginatedCompaniesResponse {
  companies: Company[];
  pagination: PaginationMeta;
}

export interface CompanyStatsResponse {
  total_companies: string;
  status_10_count: string;
  status_20_count: string;
  total_employees: string;
}

// Типы ошибок
export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

// Utility типы
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Константы
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Активный',
  [UserStatus.INACTIVE]: 'Неактивный'
};

export const VALID_USER_STATUSES = [UserStatus.ACTIVE, UserStatus.INACTIVE] as const;