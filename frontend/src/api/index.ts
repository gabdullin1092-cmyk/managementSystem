import axios, { AxiosResponse } from 'axios';
import {
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  ApiResponse,
  PaginatedUsersResponse,
  UserStatsResponse,
  Company,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyFilters,
  PaginatedCompaniesResponse,
  CompanyStatsResponse,
  CompanyEmployee
} from '@/types';

// Создаем экземпляр axios с базовой конфигурацией
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

// Интерсептор для обработки ошибок
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// API функции для работы с пользователями
export const userAPI = {
  // Получить всех пользователей
  getUsers: async (
    page: number = 1, 
    limit: number = 10, 
    filters: UserFilters = {}
  ): Promise<ApiResponse<PaginatedUsersResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Добавляем фильтры только если они не пустые
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response: AxiosResponse<ApiResponse<PaginatedUsersResponse>> = 
      await api.get(`/users?${params}`);
    return response.data;
  },

  // Получить пользователя по ID
  getUser: async (id: number): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = 
      await api.get(`/users/${id}`);
    return response.data;
  },

  // Создать пользователя
  createUser: async (userData: CreateUserData): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = 
      await api.post('/users', userData);
    return response.data;
  },

  // Обновить пользователя
  updateUser: async (
    id: number, 
    userData: UpdateUserData
  ): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = 
      await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Удалить пользователя
  deleteUser: async (id: number): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = 
      await api.delete(`/users/${id}`);
    return response.data;
  },

  // Получить статистику
  getStats: async (): Promise<ApiResponse<UserStatsResponse>> => {
    const response: AxiosResponse<ApiResponse<UserStatsResponse>> = 
      await api.get('/users/stats');
    return response.data;
  },
};

// API функции для работы с компаниями
export const companyAPI = {
  // Получить все компании
  getCompanies: async (
    page: number = 1,
    limit: number = 10,
    filters: CompanyFilters = {}
  ): Promise<ApiResponse<PaginatedCompaniesResponse>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Добавляем фильтры только если они не пустые
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<ApiResponse<PaginatedCompaniesResponse>> =
      await api.get(`/companies?${params}`);
    return response.data;
  },

  // Получить компанию по ID
  getCompany: async (id: number): Promise<ApiResponse<Company>> => {
    const response: AxiosResponse<ApiResponse<Company>> =
      await api.get(`/companies/${id}`);
    return response.data;
  },

  // Создать компанию
  createCompany: async (companyData: CreateCompanyData): Promise<ApiResponse<Company>> => {
    const response: AxiosResponse<ApiResponse<Company>> =
      await api.post('/companies', companyData);
    return response.data;
  },

  // Обновить компанию
  updateCompany: async (
    id: number,
    companyData: UpdateCompanyData
  ): Promise<ApiResponse<Company>> => {
    const response: AxiosResponse<ApiResponse<Company>> =
      await api.put(`/companies/${id}`, companyData);
    return response.data;
  },

  // Удалить компанию
  deleteCompany: async (id: number): Promise<ApiResponse<Company>> => {
    const response: AxiosResponse<ApiResponse<Company>> =
      await api.delete(`/companies/${id}`);
    return response.data;
  },

  // Получить статистику компаний
  getStats: async (): Promise<ApiResponse<CompanyStatsResponse>> => {
    const response: AxiosResponse<ApiResponse<CompanyStatsResponse>> =
      await api.get('/companies/stats');
    return response.data;
  },

  // Добавить сотрудника в компанию
  addEmployee: async (
    companyId: number,
    employee: CompanyEmployee
  ): Promise<ApiResponse<Company>> => {
    const response: AxiosResponse<ApiResponse<Company>> =
      await api.post(`/companies/${companyId}/employees`, employee);
    return response.data;
  },

  // Удалить сотрудника из компании
  removeEmployee: async (
    companyId: number,
    userId: number
  ): Promise<ApiResponse<Company>> => {
    const response: AxiosResponse<ApiResponse<Company>> =
      await api.delete(`/companies/${companyId}/employees/${userId}`);
    return response.data;
  },
};

// Экспорт дополнительных utility функций
export const apiUtils = {
  // Обработка ошибок API
  getErrorMessage: (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message || 'Произошла ошибка';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Неизвестная ошибка';
  },

  // Проверка успешности ответа
  isSuccessResponse: <T>(response: ApiResponse<T>): boolean => {
    return response.success === true;
  },

  // Извлечение данных из ответа с проверкой
  extractData: <T>(response: ApiResponse<T>): T => {
    if (!apiUtils.isSuccessResponse(response)) {
      throw new Error(response.message || 'API вернул неуспешный ответ');
    }
    return response.data;
  }
};

export default api;