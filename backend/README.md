# Node.js Backend API

Быстрый бэкенд на Node.js с PostgreSQL для управления пользователями.

## Возможности

- CRUD операции для таблицы users
- Пагинация и фильтрация данных
- Валидация данных
- Статистика пользователей
- REST API с JSON ответами

## Структура таблицы users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    birthday DATE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER CHECK (status IN (10, 20)) DEFAULT 10
);
```

## Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных
Скопируйте `.env.example` в `.env` и настройте подключение к PostgreSQL:
```bash
copy .env.example .env
```

Отредактируйте `.env` файл с вашими настройками базы данных.

### 3. Инициализация базы данных
```bash
npm run init-db
```

### 4. Запуск сервера
```bash
# Для разработки (с автоперезагрузкой)
npm run dev

# Для продакшена
npm start
```

Сервер будет доступен по адресу: `http://localhost:3000`

## API Endpoints

### Получить всех пользователей
```
GET /api/users
```
**Параметры запроса:**
- `page` (number) - номер страницы (по умолчанию: 1)
- `limit` (number) - количество записей на странице (по умолчанию: 10)
- `city` (string) - фильтр по городу
- `status` (number) - фильтр по статусу (10 или 20)
- `name` (string) - поиск по имени

**Пример:**
```
GET /api/users?page=1&limit=5&city=Москва&status=10
```

### Получить пользователя по ID
```
GET /api/users/:id
```

### Создать пользователя
```
POST /api/users
Content-Type: application/json

{
  "name": "Иван Иванов",
  "address": "ул. Пушкина, д. 1",
  "city": "Москва",
  "birthday": "1990-01-15",
  "status": 10
}
```

### Обновить пользователя
```
PUT /api/users/:id
Content-Type: application/json

{
  "name": "Новое имя",
  "city": "Новый город"
}
```

### Удалить пользователя
```
DELETE /api/users/:id
```

### Получить статистику
```
GET /api/users/stats
```

## Примеры ответов

### Успешный ответ (список пользователей)
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Иван Иванов",
        "address": "ул. Пушкина, д. 1",
        "city": "Москва",
        "birthday": "1990-01-15T00:00:00.000Z",
        "date": "2024-01-20T10:30:00.000Z",
        "status": 10
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Ошибка
```json
{
  "success": false,
  "message": "Пользователь не найден"
}
```

## Зависимости

- **express** - веб-фреймворк
- **pg** - PostgreSQL клиент
- **dotenv** - загрузка переменных окружения
- **cors** - обработка CORS запросов
- **nodemon** - автоперезагрузка в режиме разработки

## Структура проекта

```
backend/
├── config/
│   └── database.js     # Подключение к БД
├── models/
│   └── User.js         # Модель пользователя
├── routes/
│   └── users.js        # API роуты
├── scripts/
│   └── init-db.js      # Инициализация БД
├── .env.example        # Пример настроек
├── package.json
└── server.js           # Главный файл сервера
```

## Статусы пользователей

- `10` - Активный пользователь
- `20` - Заблокированный пользователь

## Разработка

Для разработки используйте:
```bash
npm run dev
```

Это запустит сервер с автоматической перезагрузкой при изменении файлов.