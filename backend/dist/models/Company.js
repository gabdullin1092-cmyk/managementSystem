"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const index_1 = require("../types/index");
const COMPANIES_FILE = 'companies.json';
class CompanyModel {
    // Получить все компании с пагинацией и фильтрацией
    async getAll(filters = {}, pagination = { page: 1, limit: 10 }) {
        const companies = await (0, database_1.readDatabase)(COMPANIES_FILE);
        // Применяем фильтры
        let filteredCompanies = companies;
        if (filters.name) {
            const searchName = filters.name.toLowerCase();
            filteredCompanies = filteredCompanies.filter((company) => company.name.toLowerCase().includes(searchName));
        }
        if (filters.idn) {
            const searchIdn = filters.idn.toLowerCase();
            filteredCompanies = filteredCompanies.filter((company) => company.idn.toLowerCase().includes(searchIdn));
        }
        if (filters.status !== undefined) {
            filteredCompanies = filteredCompanies.filter((company) => company.status === filters.status);
        }
        // Применяем пагинацию
        const totalCount = filteredCompanies.length;
        const totalPages = Math.ceil(totalCount / pagination.limit);
        const offset = (pagination.page - 1) * pagination.limit;
        const paginatedCompanies = filteredCompanies.slice(offset, offset + pagination.limit);
        return {
            companies: paginatedCompanies,
            pagination: {
                currentPage: pagination.page,
                totalPages,
                totalCount,
                hasNext: pagination.page < totalPages,
                hasPrev: pagination.page > 1,
            },
        };
    }
    // Получить компанию по ID
    async getById(id) {
        const companies = await (0, database_1.readDatabase)(COMPANIES_FILE);
        return companies.find((company) => company.id === id) || null;
    }
    // Создать новую компанию
    async create(companyData) {
        const companies = await (0, database_1.readDatabase)(COMPANIES_FILE);
        // Проверяем уникальность ИНН
        const existingCompany = companies.find((company) => company.idn === companyData.idn);
        if (existingCompany) {
            throw new Error(`Компания с ИНН ${companyData.idn} уже существует`);
        }
        const now = new Date().toISOString();
        const newCompany = {
            id: (0, database_1.generateId)(companies),
            name: companyData.name,
            idn: companyData.idn,
            address: companyData.address,
            status: companyData.status || index_1.CompanyStatus.ACTIVE,
            users: companyData.users || [],
            created_at: now,
            updated_at: now,
        };
        companies.push(newCompany);
        await (0, database_1.writeDatabase)(COMPANIES_FILE, companies);
        return newCompany;
    }
    // Обновить компанию
    async update(id, updateData) {
        const companies = await (0, database_1.readDatabase)(COMPANIES_FILE);
        const companyIndex = companies.findIndex((company) => company.id === id);
        if (companyIndex === -1) {
            return null;
        }
        const currentCompany = companies[companyIndex];
        if (!currentCompany) {
            return null;
        }
        // Если обновляется ИНН, проверяем уникальность
        if (updateData.idn && updateData.idn !== currentCompany.idn) {
            const existingCompany = companies.find((company) => company.idn === updateData.idn && company.id !== id);
            if (existingCompany) {
                throw new Error(`Компания с ИНН ${updateData.idn} уже существует`);
            }
        }
        const updatedCompany = {
            ...currentCompany,
            ...(updateData.name && { name: updateData.name }),
            ...(updateData.idn && { idn: updateData.idn }),
            ...(updateData.address !== undefined && { address: updateData.address }),
            ...(updateData.status !== undefined && { status: updateData.status }),
            ...(updateData.users !== undefined && { users: updateData.users }),
            updated_at: new Date().toISOString(),
        };
        companies[companyIndex] = updatedCompany;
        await (0, database_1.writeDatabase)(COMPANIES_FILE, companies);
        return updatedCompany;
    }
    // Удалить компанию
    async delete(id) {
        const companies = await (0, database_1.readDatabase)(COMPANIES_FILE);
        const filteredCompanies = companies.filter((company) => company.id !== id);
        if (filteredCompanies.length === companies.length) {
            return false;
        }
        await (0, database_1.writeDatabase)(COMPANIES_FILE, filteredCompanies);
        return true;
    }
    // Получить статистику
    async getStats() {
        const companies = await (0, database_1.readDatabase)(COMPANIES_FILE);
        const activeCount = companies.filter((company) => company.status === index_1.CompanyStatus.ACTIVE).length;
        const inactiveCount = companies.filter((company) => company.status === index_1.CompanyStatus.INACTIVE).length;
        const totalEmployees = companies.reduce((sum, company) => sum + (company.users?.length || 0), 0);
        return {
            total_companies: companies.length.toString(),
            status_10_count: activeCount.toString(),
            status_20_count: inactiveCount.toString(),
            total_employees: totalEmployees.toString(),
        };
    }
    // Добавить сотрудника в компанию
    async addEmployee(companyId, userId, userName) {
        const company = await this.getById(companyId);
        if (!company) {
            return null;
        }
        // Проверяем, не добавлен ли уже этот пользователь
        const existingEmployee = company.users.find((emp) => emp.userId === userId);
        if (existingEmployee) {
            throw new Error('Этот сотрудник уже добавлен в компанию');
        }
        const updatedUsers = [...company.users, { userId, userName }];
        return this.update(companyId, { users: updatedUsers });
    }
    // Удалить сотрудника из компании
    async removeEmployee(companyId, userId) {
        const company = await this.getById(companyId);
        if (!company) {
            return null;
        }
        const updatedUsers = company.users.filter((emp) => emp.userId !== userId);
        return this.update(companyId, { users: updatedUsers });
    }
}
exports.default = new CompanyModel();
//# sourceMappingURL=Company.js.map