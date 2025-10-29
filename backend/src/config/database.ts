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

interface BaseEntity {
  id: number;
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
const ensureDataFile = async (fileName: string = 'users.json'): Promise<void> => {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, fileName);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      console.log('Создан файл данных:', filePath);
    }
  } catch (error) {
    console.error('Ошибка создания файла данных:', error);
    throw error;
  }
};

// Универсальная функция для чтения данных из файла
export const readDatabase = async <T extends BaseEntity>(fileName: string): Promise<T[]> => {
  try {
    await ensureDataFile(fileName);
    const filePath = path.join(process.cwd(), 'data', fileName);
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error('Ошибка чтения файла данных:', error);
    return [];
  }
};

// Универсальная функция для записи данных в файл
export const writeDatabase = async <T extends BaseEntity>(
  fileName: string,
  data: T[]
): Promise<void> => {
  try {
    await ensureDataFile(fileName);
    const filePath = path.join(process.cwd(), 'data', fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log('Данные записаны в файл:', fileName);
  } catch (error) {
    console.error('Ошибка записи в файл данных:', error);
    throw error;
  }
};

// Генератор уникальных ID
export const generateId = <T extends BaseEntity>(entities: T[]): number => {
  if (entities.length === 0) {
    return 1;
  }
  const maxId = Math.max(...entities.map((entity: T) => entity.id));
  return maxId + 1;
};

// Старые функции для совместимости с существующим кодом
const readData = async (): Promise<User[]> => {
  return readDatabase<User>('users.json');
};

const writeData = async (data: User[]): Promise<void> => {
  return writeDatabase<User>('users.json', data);
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
          id: generateId(users),
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