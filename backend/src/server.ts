import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import companyRoutes from './routes/companies';

// Загрузка переменных окружения
dotenv.config();

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Интерфейс для ошибки
interface CustomError extends Error {
  status?: number;
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req: Request, res: Response, next: NextFunction): void => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Роуты
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);

// Корневой роут
app.get('/', (req: Request, res: Response): void => {
  res.json({
    message: 'Node.js API Server with TypeScript',
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
      'DELETE /api/companies/:id - Удалить компанию',
      'POST /api/companies/:id/employees - Добавить сотрудника',
      'DELETE /api/companies/:id/employees/:userId - Удалить сотрудника'
    ]
  });
});

// Обработчик несуществующих роутов
app.use('*', (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Роут не найден'
  });
});

// Глобальный обработчик ошибок
app.use((error: CustomError, req: Request, res: Response, next: NextFunction): void => {
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
app.listen(PORT, (): void => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📝 API документация доступна на http://localhost:${PORT}`);
});

// Обработка необработанных исключений
process.on('uncaughtException', (error: Error): void => {
  console.error('Необработанное исключение:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>): void => {
  console.error('Необработанное отклонение промиса:', reason);
  process.exit(1);
});

export default app;