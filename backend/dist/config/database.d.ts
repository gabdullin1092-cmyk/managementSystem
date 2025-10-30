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
export declare const readDatabase: <T extends BaseEntity>(fileName: string) => Promise<T[]>;
export declare const writeDatabase: <T extends BaseEntity>(fileName: string, data: T[]) => Promise<void>;
export declare const generateId: <T extends BaseEntity>(entities: T[]) => number;
declare const readData: () => Promise<User[]>;
declare const writeData: (data: User[]) => Promise<void>;
declare const query: (operation: DatabaseOperation, data?: any) => Promise<DatabaseResult<User>>;
export { query, readData, writeData };
//# sourceMappingURL=database.d.ts.map