const fs = require('fs').promises;
const path = require('path');

// Путь к файлу данных
const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Функция для обеспечения существования директории и файла данных
const ensureDataFile = async () => {
    try {
        const dataDir = path.dirname(DATA_FILE);
        await fs.mkdir(dataDir, { recursive: true });
        
        try {
            await fs.access(DATA_FILE);
        } catch {
            // Файл не существует, создаем его с пустым массивом
            await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
            console.log('Создан файл данных:', DATA_FILE);
        }
    } catch (error) {
        console.error('Ошибка создания файла данных:', error);
        throw error;
    }
};

// Функция для чтения данных из файла
const readData = async () => {
    try {
        await ensureDataFile();
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Ошибка чтения файла данных:', error);
        return [];
    }
};

// Функция для записи данных в файл
const writeData = async (data) => {
    try {
        await ensureDataFile();
        await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('Данные записаны в файл');
    } catch (error) {
        console.error('Ошибка записи в файл данных:', error);
        throw error;
    }
};

// Эмуляция SQL-подобных операций для совместимости
const query = async (operation, data = null) => {
    const start = Date.now();
    try {
        let result;
        const users = await readData();
        
        switch (operation.type) {
            case 'SELECT_ALL':
                result = { rows: users };
                break;
                
            case 'SELECT_BY_ID':
                const user = users.find(u => u.id === data.id);
                result = { rows: user ? [user] : [] };
                break;
                
            case 'INSERT':
                const newUser = {
                    id: Date.now(), // Простой способ генерации ID
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                users.push(newUser);
                await writeData(users);
                result = { rows: [newUser] };
                break;
                
            case 'UPDATE':
                const userIndex = users.findIndex(u => u.id === data.id);
                if (userIndex !== -1) {
                    users[userIndex] = {
                        ...users[userIndex],
                        ...data.updates,
                        updated_at: new Date().toISOString()
                    };
                    await writeData(users);
                    result = { rows: [users[userIndex]] };
                } else {
                    result = { rows: [] };
                }
                break;
                
            case 'DELETE':
                const deleteIndex = users.findIndex(u => u.id === data.id);
                if (deleteIndex !== -1) {
                    const deletedUser = users.splice(deleteIndex, 1)[0];
                    await writeData(users);
                    result = { rows: [deletedUser] };
                } else {
                    result = { rows: [] };
                }
                break;
                
            default:
                throw new Error(`Неизвестная операция: ${operation.type}`);
        }
        
        const duration = Date.now() - start;
        console.log('Выполнена операция:', { operation: operation.type, duration, rows: result.rows.length });
        return result;
        
    } catch (error) {
        console.error('Ошибка выполнения операции:', error);
        throw error;
    }
};

// Инициализация при запуске
ensureDataFile().then(() => {
    console.log('Файловая система хранения данных готова');
}).catch(error => {
    console.error('Ошибка инициализации файловой системы:', error);
});

module.exports = {
    query,
    readData,
    writeData
};