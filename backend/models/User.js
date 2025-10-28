const { query } = require('../config/database');

class User {
    // Получить всех пользователей с пагинацией и фильтрацией
    static async getAll(page = 1, limit = 10, filters = {}) {
        try {
            const result = await query({ type: 'SELECT_ALL' });
            let users = result.rows;

            // Применяем фильтры
            if (filters.city) {
                users = users.filter(user => 
                    user.city && user.city.toLowerCase().includes(filters.city.toLowerCase())
                );
            }

            if (filters.status) {
                users = users.filter(user => user.status === Number(filters.status));
            }

            if (filters.name) {
                users = users.filter(user => 
                    user.name && user.name.toLowerCase().includes(filters.name.toLowerCase())
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
            throw new Error(`Ошибка при получении пользователей: ${error.message}`);
        }
    }

    // Получить пользователя по ID
    static async getById(id) {
        try {
            const result = await query({ type: 'SELECT_BY_ID' }, { id: Number(id) });
            if (result.rows.length === 0) {
                throw new Error('Пользователь не найден');
            }
            return result.rows[0];
        } catch (error) {
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

            const result = await query({ type: 'INSERT' }, {
                name,
                address,
                city,
                birthday,
                status: Number(status)
            });

            return result.rows[0];
        } catch (error) {
            throw new Error(`Ошибка при создании пользователя: ${error.message}`);
        }
    }

    // Обновить пользователя
    static async update(id, userData) {
        try {
            const { name, address, city, birthday, status } = userData;

            // Проверяем существование пользователя
            await User.getById(id);

            // Валидация статуса
            if (status && ![10, 20].includes(Number(status))) {
                throw new Error('Статус должен быть 10 или 20');
            }

            // Подготавливаем обновления (только поля, которые переданы)
            const updates = {};
            if (name !== undefined) updates.name = name;
            if (address !== undefined) updates.address = address;
            if (city !== undefined) updates.city = city;
            if (birthday !== undefined) updates.birthday = birthday;
            if (status !== undefined) updates.status = Number(status);

            const result = await query({ type: 'UPDATE' }, {
                id: Number(id),
                updates
            });

            return result.rows[0];
        } catch (error) {
            throw new Error(`Ошибка при обновлении пользователя: ${error.message}`);
        }
    }

    // Удалить пользователя
    static async delete(id) {
        try {
            // Проверяем существование пользователя
            await User.getById(id);

            const result = await query({ type: 'DELETE' }, { id: Number(id) });
            return result.rows[0];
        } catch (error) {
            throw new Error(`Ошибка при удалении пользователя: ${error.message}`);
        }
    }

    // Получить статистику по пользователям
    static async getStatistics() {
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
            throw new Error(`Ошибка при получении статистики: ${error.message}`);
        }
    }
}

module.exports = User;