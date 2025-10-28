import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// API функции для работы с пользователями
export const userAPI = {
  // Получить всех пользователей
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value && value !== '')
      ),
    });
    
    const response = await api.get(`/users?${params}`);
    return response.data;
  },

  // Получить пользователя по ID
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Создать пользователя
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Обновить пользователя
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Удалить пользователя
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Получить статистику
  getStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

export default api;