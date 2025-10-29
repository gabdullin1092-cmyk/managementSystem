// Базовые типы пользователя
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

// Тип для создания нового пользователя
export interface CreateUserData {
  name: string;
  address?: string;
  city?: string;
  birthday?: string;
  status?: UserStatus;
}

// Тип для обновления пользователя
export interface UpdateUserData {
  name?: string;
  address?: string;
  city?: string;
  birthday?: string;
  status?: UserStatus;
}

// Типы для фильтрации
export interface UserFilters {
  name?: string;
  city?: string;
  status?: UserStatus | '';
}

// Типы для пагинации
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

// API Response типы
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

// Типы для компонентов
export interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export interface UserListProps {
  onEditUser: (user: User) => void;
}

export interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

// Типы для формы
export interface UserFormValues {
  name: string;
  address: string;
  city: string;
  birthday: string; // Для форм всегда строка (может быть пустая)
  status: UserStatus;
}

// Типы для ошибок
export interface ApiError {
  message: string;
  status?: number;
}

// Utility типы
export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;
export type UserFormTouched = Partial<Record<keyof UserFormValues, boolean>>;

// Константы
export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'Активный',
  [UserStatus.INACTIVE]: 'Неактивный'
};

export const VALID_USER_STATUSES = [UserStatus.ACTIVE, UserStatus.INACTIVE] as const;

// Типы для React Query
export interface UseUsersQueryParams {
  page?: number;
  limit?: number;
  filters?: UserFilters;
}

// Типы для мутаций
export interface CreateUserMutationData {
  userData: CreateUserData;
}

export interface UpdateUserMutationData {
  id: number;
  userData: UpdateUserData;
}

export interface DeleteUserMutationData {
  id: number;
}

// ============================================
// Типы для компаний
// ============================================

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
export interface CreateCompanyData {
  name: string;
  idn: string;
  address?: string;
  status?: CompanyStatus;
  users?: CompanyEmployee[];
}

// Тип для обновления компании
export interface UpdateCompanyData {
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
  status?: CompanyStatus | '';
}

// API Response типы для компаний
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

// Типы для компонентов компаний
export interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
}

export interface CompanyListProps {
  onEditCompany: (company: Company) => void;
}

export interface CompanyFormProps {
  company?: Company;
  onSuccess: () => void;
  onCancel: () => void;
}

// Типы для формы компании
export interface CompanyFormValues {
  name: string;
  idn: string;
  address: string;
  status: CompanyStatus;
  users: CompanyEmployee[];
}

// Константы для компаний
export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  [CompanyStatus.ACTIVE]: 'Активная',
  [CompanyStatus.INACTIVE]: 'Неактивная'
};

export const VALID_COMPANY_STATUSES = [CompanyStatus.ACTIVE, CompanyStatus.INACTIVE] as const;
