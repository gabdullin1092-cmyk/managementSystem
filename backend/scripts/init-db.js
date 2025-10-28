const pool = require('../config/database');

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    birthday DATE,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status INTEGER CHECK (status IN (10, 20)) DEFAULT 10
);

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
`;

async function initDatabase() {
    try {
        console.log('Создание таблицы users...');
        await pool.query(createUsersTable);
        console.log('Таблица users успешно создана!');
        
        // Добавим несколько тестовых записей
        const insertTestData = `
        INSERT INTO users (name, address, city, birthday, status) VALUES 
        ('Иван Иванов', 'ул. Пушкина, д. 1', 'Москва', '1990-01-15', 10),
        ('Петр Петров', 'пр. Ленина, д. 25', 'Санкт-Петербург', '1985-05-20', 20),
        ('Анна Сидорова', 'ул. Гагарина, д. 10', 'Екатеринбург', '1992-12-03', 10)
        ON CONFLICT DO NOTHING;
        `;
        
        await pool.query(insertTestData);
        console.log('Тестовые данные добавлены!');
        
    } catch (err) {
        console.error('Ошибка при инициализации базы данных:', err);
    } finally {
        process.exit(0);
    }
}

// Запускаем инициализацию если файл выполняется напрямую
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase };