import * as fs from 'fs';
import * as path from 'path';

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

interface DatabaseResult<T> {
  rows: T[];
}

interface DatabaseOperation {
  type: 'SELECT_ALL' | 'SELECT_BY_ID' | 'INSERT' | 'UPDATE' | 'DELETE';
}

// Путь к файлу данных
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

// Функция для обеспечения существования директории и файла данных
const ensureDataFile = async (): Promise<void> => {
  try {
    const dataDir = path.dirname(DATA_FILE);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      console.log('Создан файл данных:', DATA_FILE);
    }
  } catch (error) {
    console.error('Ошибка создания файла данных:', error);
    throw error;
  }
};

// Функция для чтения данных из файла
const readData = async (): Promise<User[]> => {
  try {
    await ensureDataFile();
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data) as User[];
  } catch (error) {
    console.error('Ошибка чтения файла данных:', error);
    return [];
  }
};

// Функция для записи данных в файл
const writeData = async (data: User[]): Promise<void> => {
  try {
    await ensureDataFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('Данные записаны в файл');
  } catch (error) {
    console.error('Ошибка записи в файл данных:', error);
    throw error;
  }
};

// Генератор уникальных ID
const generateId = (): number => {
  return Date.now() + Math.floor(Math.random() * 1000);
};

// Эмуляция SQL-подобных операций
const query = async (
  operation: DatabaseOperation,
  data?: any
): Promise<DatabaseResult<User>> => {
  const start = Date.now();
  
  try {
    let result: DatabaseResult<User>;
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
        const newUser: User = {
          id: generateId(),
          name: data.name,
          address: data.address,
          city: data.city,
          birthday: data.birthday,
          status: data.status || 10,
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
          const updatedUser = {
            ...users[userIndex],
            ...data.updates,
            updated_at: new Date().toISOString()
          };
          users[userIndex] = updatedUser;
          await writeData(users);
          result = { rows: [updatedUser] };
        } else {
          result = { rows: [] };
        }
        break;
        
      case 'DELETE':
        const deleteIndex = users.findIndex(u => u.id === data.id);
        if (deleteIndex !== -1) {
          const deletedUser = users.splice(deleteIndex, 1)[0];
          if (deletedUser) {
            await writeData(users);
            result = { rows: [deletedUser] };
          } else {
            result = { rows: [] };
          }
        } else {
          result = { rows: [] };
        }
        break;
        
      default:
        throw new Error(`Неизвестная операция: ${operation.type}`);
    }
    
    const duration = Date.now() - start;
    console.log('Выполнена операция:', { 
      operation: operation.type, 
      duration, 
      rows: result.rows.length 
    });
    
    return result;
    
  } catch (error) {
    console.error('Ошибка выполнения операции:', error);
    throw error;
  }
};

// Инициализация при запуске
ensureDataFile()
  .then(() => {
    console.log('Файловая система хранения данных готова');
  })
  .catch(error => {
    console.error('Ошибка инициализации файловой системы:', error);
  });

export {
  query,
  readData,
  writeData
};