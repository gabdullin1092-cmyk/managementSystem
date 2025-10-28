"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeData = exports.readData = exports.query = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Путь к файлу данных
const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');
// Функция для обеспечения существования директории и файла данных
const ensureDataFile = async () => {
    try {
        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
            console.log('Создан файл данных:', DATA_FILE);
        }
    }
    catch (error) {
        console.error('Ошибка создания файла данных:', error);
        throw error;
    }
};
// Функция для чтения данных из файла
const readData = async () => {
    try {
        await ensureDataFile();
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Ошибка чтения файла данных:', error);
        return [];
    }
};
exports.readData = readData;
// Функция для записи данных в файл
const writeData = async (data) => {
    try {
        await ensureDataFile();
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log('Данные записаны в файл');
    }
    catch (error) {
        console.error('Ошибка записи в файл данных:', error);
        throw error;
    }
};
exports.writeData = writeData;
// Генератор уникальных ID
const generateId = () => {
    return Date.now() + Math.floor(Math.random() * 1000);
};
// Эмуляция SQL-подобных операций
const query = async (operation, data) => {
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
                }
                else {
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
                    }
                    else {
                        result = { rows: [] };
                    }
                }
                else {
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
    }
    catch (error) {
        console.error('Ошибка выполнения операции:', error);
        throw error;
    }
};
exports.query = query;
// Инициализация при запуске
ensureDataFile()
    .then(() => {
    console.log('Файловая система хранения данных готова');
})
    .catch(error => {
    console.error('Ошибка инициализации файловой системы:', error);
});
//# sourceMappingURL=database.js.map