const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Роуты
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);

// Корневой роут
app.get('/', (req, res) => {
    res.json({
        message: 'Node.js API Server',
        version: '1.0.0',
        endpoints: [
            'GET /api/users - Получить всех пользователей',
            'GET /api/users/stats - Статистика пользователей',
            'GET /api/users/:id - Получить пользователя по ID',
            'POST /api/users - Создать пользователя',
            'PUT /api/users/:id - Обновить пользователя',
            'DELETE /api/users/:id - Удалить пользователя',
            '',
            'GET /api/companies - Получить все компании',
            'GET /api/companies/stats - Статистика компаний',
            'GET /api/companies/:id - Получить компанию по ID',
            'POST /api/companies - Создать компанию',
            'PUT /api/companies/:id - Обновить компанию',
            'DELETE /api/companies/:id - Удалить компанию'
        ]
    });
});

// Обработчик несуществующих роутов
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Роут не найден'
    });
});

// Глобальный обработчик ошибок
app.use((error, req, res, next) => {
    console.error('Глобальная ошибка:', error);
    res.status(500).json({
        success: false,
        message: 'Внутренняя ошибка сервера'
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📝 API доступен по адресу: http://localhost:${PORT}`);
    console.log(`📚 Документация: http://localhost:${PORT}/`);
});