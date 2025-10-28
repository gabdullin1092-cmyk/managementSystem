import { query } from '../config/database';

// Интерфейсы для типизации
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

class UserModel {
  // Получить всех пользователей с пагинацией и фильтрацией
  static async getAll(page: number = 1, limit: number = 10, filters: UserFilters = {}): Promise<PaginatedUsersResponse> {
    try {
      const result = await query({ type: 'SELECT_ALL' });
      let users = result.rows;

      // Применяем фильтры
      if (filters.city) {
        users = users.filter(user => 
          user.city && user.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }

      if (filters.status) {
        users = users.filter(user => user.status === Number(filters.status));
      }

      if (filters.name) {
        users = users.filter(user => 
          user.name && user.name.toLowerCase().includes(filters.name!.toLowerCase())
        );
      }

      // Сортируем по ID в порядке убывания
      users.sort((a, b) => b.id - a.id);

      // Применяем пагинацию
      const totalCount = users.length;
      const offset = (page - 1) * limit;
      const paginatedUsers = users.slice(offset, offset + limit);

      return {
        users: paginatedUsers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Ошибка при получении пользователей: ${(error as Error).message}`);
    }
  }

  // Получить пользователя по ID
  static async getById(id: number): Promise<User> {
    try {
      const result = await query({ type: 'SELECT_BY_ID' }, { id: Number(id) });
      if (result.rows.length === 0) {
        throw new Error('Пользователь не найден');
      }
      
      const user = result.rows[0];
      if (!user) {
        throw new Error('Пользователь не найден');
      }
      
      return user;
    } catch (error) {
      throw new Error(`Ошибка при получении пользователя: ${(error as Error).message}`);
    }
  }

  // Создать нового пользователя
  static async create(userData: {
    name: string;
    address?: string;
    city?: string;
    birthday?: string;
    status?: 10 | 20;
  }): Promise<User> {
    try {
      const { name, address, city, birthday, status = 10 } = userData;

      // Валидация обязательных полей
      if (!name) {
        throw new Error('Имя пользователя обязательно');
      }

      // Валидация статуса
      if (status && ![10, 20].includes(Number(status))) {
        throw new Error('Статус должен быть 10 или 20');
      }

      const result = await query({ type: 'INSERT' }, {
        name,
        address,
        city,
        birthday,
        status: Number(status)
      });

      if (result.rows.length === 0) {
        throw new Error('Не удалось создать пользователя');
      }
      
      const newUser = result.rows[0];
      if (!newUser) {
        throw new Error('Не удалось создать пользователя');
      }
      
      return newUser;
    } catch (error) {
      throw new Error(`Ошибка при создании пользователя: ${(error as Error).message}`);
    }
  }

  // Обновить пользователя
  static async update(id: number, userData: {
    name?: string;
    address?: string;
    city?: string;
    birthday?: string;
    status?: 10 | 20;
  }): Promise<User> {
    try {
      const { name, address, city, birthday, status } = userData;

      // Проверяем существование пользователя
      await UserModel.getById(id);

      // Валидация статуса
      if (status && ![10, 20].includes(Number(status))) {
        throw new Error('Статус должен быть 10 или 20');
      }

      // Подготавливаем обновления (только поля, которые переданы)
      const updates: Partial<User> = {};
      if (name !== undefined) updates.name = name;
      if (address !== undefined) updates.address = address;
      if (city !== undefined) updates.city = city;
      if (birthday !== undefined) updates.birthday = birthday;
      if (status !== undefined) updates.status = Number(status) as 10 | 20;

      const result = await query({ type: 'UPDATE' }, {
        id: Number(id),
        updates
      });

      if (result.rows.length === 0) {
        throw new Error('Не удалось обновить пользователя');
      }
      
      const updatedUser = result.rows[0];
      if (!updatedUser) {
        throw new Error('Не удалось обновить пользователя');
      }
      
      return updatedUser;
    } catch (error) {
      throw new Error(`Ошибка при обновлении пользователя: ${(error as Error).message}`);
    }
  }

  // Удалить пользователя
  static async delete(id: number): Promise<User> {
    try {
      // Проверяем существование пользователя
      await UserModel.getById(id);

      const result = await query({ type: 'DELETE' }, { id: Number(id) });
      if (result.rows.length === 0) {
        throw new Error('Не удалось удалить пользователя');
      }
      const deletedUser = result.rows[0];
      if (!deletedUser) {
        throw new Error('Не удалось удалить пользователя');
      }
      return deletedUser;
    } catch (error) {
      throw new Error(`Ошибка при удалении пользователя: ${(error as Error).message}`);
    }
  }

  // Получить статистику по пользователям
  static async getStatistics(): Promise<UserStatsResponse> {
    try {
      const result = await query({ type: 'SELECT_ALL' });
      const users = result.rows;
      
      const totalUsers = users.length;
      const status10Count = users.filter(user => user.status === 10).length;
      const status20Count = users.filter(user => user.status === 20).length;
      const uniqueCities = [...new Set(users.map(user => user.city).filter(Boolean))].length;
      
      return {
        total_users: totalUsers.toString(),
        status_10_count: status10Count.toString(),
        status_20_count: status20Count.toString(),
        unique_cities: uniqueCities.toString()
      };
    } catch (error) {
      throw new Error(`Ошибка при получении статистики: ${(error as Error).message}`);
    }
  }
}

export default UserModel;
export { User, UserFilters, PaginatedUsersResponse, UserStatsResponse };