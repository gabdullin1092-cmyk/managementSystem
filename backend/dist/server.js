"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const users_1 = __importDefault(require("./routes/users"));
// Загрузка переменных окружения
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Логирование запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Роуты
app.use('/api/users', users_1.default);
// Корневой роут
app.get('/', (req, res) => {
    res.json({
        message: 'Node.js API Server with TypeScript',
        version: '1.0.0',
        endpoints: [
            'GET /api/users - Получить всех пользователей',
            'GET /api/users/stats - Статистика пользователей',
            'GET /api/users/:id - Получить пользователя по ID',
            'POST /api/users - Создать пользователя',
            'PUT /api/users/:id - Обновить пользователя',
            'DELETE /api/users/:id - Удалить пользователя'
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
    const status = error.status || 500;
    const message = error.message || 'Внутренняя ошибка сервера';
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});
// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`📝 API документация доступна на http://localhost:${PORT}`);
});
// Обработка необработанных исключений
process.on('uncaughtException', (error) => {
    console.error('Необработанное исключение:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Необработанное отклонение промиса:', reason);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map