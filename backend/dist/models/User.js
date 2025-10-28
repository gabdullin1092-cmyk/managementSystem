"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
class UserModel {
    // Получить всех пользователей с пагинацией и фильтрацией
    static async getAll(page = 1, limit = 10, filters = {}) {
        try {
            const result = await (0, database_1.query)({ type: 'SELECT_ALL' });
            let users = result.rows;
            // Применяем фильтры
            if (filters.city) {
                users = users.filter(user => user.city && user.city.toLowerCase().includes(filters.city.toLowerCase()));
            }
            if (filters.status) {
                users = users.filter(user => user.status === Number(filters.status));
            }
            if (filters.name) {
                users = users.filter(user => user.name && user.name.toLowerCase().includes(filters.name.toLowerCase()));
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
        }
        catch (error) {
            throw new Error(`Ошибка при получении пользователей: ${error.message}`);
        }
    }
    // Получить пользователя по ID
    static async getById(id) {
        try {
            const result = await (0, database_1.query)({ type: 'SELECT_BY_ID' }, { id: Number(id) });
            if (result.rows.length === 0) {
                throw new Error('Пользователь не найден');
            }
            const user = result.rows[0];
            if (!user) {
                throw new Error('Пользователь не найден');
            }
            return user;
        }
        catch (error) {
            throw new Error(`Ошибка при получении пользователя: ${error.message}`);
        }
    }
    // Создать нового пользователя
    static async create(userData) {
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
            const result = await (0, database_1.query)({ type: 'INSERT' }, {
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
        }
        catch (error) {
            throw new Error(`Ошибка при создании пользователя: ${error.message}`);
        }
    }
    // Обновить пользователя
    static async update(id, userData) {
        try {
            const { name, address, city, birthday, status } = userData;
            // Проверяем существование пользователя
            await UserModel.getById(id);
            // Валидация статуса
            if (status && ![10, 20].includes(Number(status))) {
                throw new Error('Статус должен быть 10 или 20');
            }
            // Подготавливаем обновления (только поля, которые переданы)
            const updates = {};
            if (name !== undefined)
                updates.name = name;
            if (address !== undefined)
                updates.address = address;
            if (city !== undefined)
                updates.city = city;
            if (birthday !== undefined)
                updates.birthday = birthday;
            if (status !== undefined)
                updates.status = Number(status);
            const result = await (0, database_1.query)({ type: 'UPDATE' }, {
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
        }
        catch (error) {
            throw new Error(`Ошибка при обновлении пользователя: ${error.message}`);
        }
    }
    // Удалить пользователя
    static async delete(id) {
        try {
            // Проверяем существование пользователя
            await UserModel.getById(id);
            const result = await (0, database_1.query)({ type: 'DELETE' }, { id: Number(id) });
            if (result.rows.length === 0) {
                throw new Error('Не удалось удалить пользователя');
            }
            const deletedUser = result.rows[0];
            if (!deletedUser) {
                throw new Error('Не удалось удалить пользователя');
            }
            return deletedUser;
        }
        catch (error) {
            throw new Error(`Ошибка при удалении пользователя: ${error.message}`);
        }
    }
    // Получить статистику по пользователям
    static async getStatistics() {
        try {
            const result = await (0, database_1.query)({ type: 'SELECT_ALL' });
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
        }
        catch (error) {
            throw new Error(`Ошибка при получении статистики: ${error.message}`);
        }
    }
}
exports.default = UserModel;
//# sourceMappingURL=User.js.map