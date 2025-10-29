import {
  readDatabase,
  writeDatabase,
  generateId,
} from '../config/database';
import {
  Company,
  CreateCompanyRequest,
  UpdateCompanyRequest,
  CompanyStatus,
  CompanyFilters,
  PaginationParams,
  PaginatedCompaniesResponse,
  CompanyStatsResponse,
} from '../types/index';

const COMPANIES_FILE = 'companies.json';

class CompanyModel {
  // Получить все компании с пагинацией и фильтрацией
  async getAll(
    filters: CompanyFilters = {},
    pagination: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedCompaniesResponse> {
    const companies = await readDatabase<Company>(COMPANIES_FILE);

    // Применяем фильтры
    let filteredCompanies = companies;

    if (filters.name) {
      const searchName = filters.name.toLowerCase();
      filteredCompanies = filteredCompanies.filter((company: Company) =>
        company.name.toLowerCase().includes(searchName)
      );
    }

    if (filters.idn) {
      const searchIdn = filters.idn.toLowerCase();
      filteredCompanies = filteredCompanies.filter((company: Company) =>
        company.idn.toLowerCase().includes(searchIdn)
      );
    }

    if (filters.status !== undefined) {
      filteredCompanies = filteredCompanies.filter(
        (company: Company) => company.status === filters.status
      );
    }

    // Применяем пагинацию
    const totalCount = filteredCompanies.length;
    const totalPages = Math.ceil(totalCount / pagination.limit);
    const offset = (pagination.page - 1) * pagination.limit;

    const paginatedCompanies = filteredCompanies.slice(
      offset,
      offset + pagination.limit
    );

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
  async getById(id: number): Promise<Company | null> {
    const companies = await readDatabase<Company>(COMPANIES_FILE);
    return companies.find((company: Company) => company.id === id) || null;
  }

  // Создать новую компанию
  async create(companyData: CreateCompanyRequest): Promise<Company> {
    const companies = await readDatabase<Company>(COMPANIES_FILE);

    // Проверяем уникальность ИНН
    const existingCompany = companies.find(
      (company: Company) => company.idn === companyData.idn
    );
    if (existingCompany) {
      throw new Error(`Компания с ИНН ${companyData.idn} уже существует`);
    }

    const now = new Date().toISOString();
    const newCompany: Company = {
      id: generateId(companies),
      name: companyData.name,
      idn: companyData.idn,
      address: companyData.address,
      status: companyData.status || CompanyStatus.ACTIVE,
      users: companyData.users || [],
      created_at: now,
      updated_at: now,
    };

    companies.push(newCompany);
    await writeDatabase(COMPANIES_FILE, companies);
    return newCompany;
  }

  // Обновить компанию
  async update(
    id: number,
    updateData: UpdateCompanyRequest
  ): Promise<Company | null> {
    const companies = await readDatabase<Company>(COMPANIES_FILE);
    const companyIndex = companies.findIndex((company: Company) => company.id === id);

    if (companyIndex === -1) {
      return null;
    }

    const currentCompany = companies[companyIndex];
    if (!currentCompany) {
      return null;
    }

    // Если обновляется ИНН, проверяем уникальность
    if (updateData.idn && updateData.idn !== currentCompany.idn) {
      const existingCompany = companies.find(
        (company: Company) => company.idn === updateData.idn && company.id !== id
      );
      if (existingCompany) {
        throw new Error(`Компания с ИНН ${updateData.idn} уже существует`);
      }
    }

    const updatedCompany: Company = {
      ...currentCompany,
      ...(updateData.name && { name: updateData.name }),
      ...(updateData.idn && { idn: updateData.idn }),
      ...(updateData.address !== undefined && { address: updateData.address }),
      ...(updateData.status !== undefined && { status: updateData.status }),
      ...(updateData.users !== undefined && { users: updateData.users }),
      updated_at: new Date().toISOString(),
    };

    companies[companyIndex] = updatedCompany;
    await writeDatabase(COMPANIES_FILE, companies);
    return updatedCompany;
  }

  // Удалить компанию
  async delete(id: number): Promise<boolean> {
    const companies = await readDatabase<Company>(COMPANIES_FILE);
    const filteredCompanies = companies.filter((company: Company) => company.id !== id);

    if (filteredCompanies.length === companies.length) {
      return false;
    }

    await writeDatabase(COMPANIES_FILE, filteredCompanies);
    return true;
  }

  // Получить статистику
  async getStats(): Promise<CompanyStatsResponse> {
    const companies = await readDatabase<Company>(COMPANIES_FILE);

    const activeCount = companies.filter(
      (company: Company) => company.status === CompanyStatus.ACTIVE
    ).length;

    const inactiveCount = companies.filter(
      (company: Company) => company.status === CompanyStatus.INACTIVE
    ).length;

    const totalEmployees = companies.reduce(
      (sum: number, company: Company) => sum + (company.users?.length || 0),
      0
    );

    return {
      total_companies: companies.length.toString(),
      status_10_count: activeCount.toString(),
      status_20_count: inactiveCount.toString(),
      total_employees: totalEmployees.toString(),
    };
  }

  // Добавить сотрудника в компанию
  async addEmployee(
    companyId: number,
    userId: number,
    userName: string
  ): Promise<Company | null> {
    const company = await this.getById(companyId);
    if (!company) {
      return null;
    }

    // Проверяем, не добавлен ли уже этот пользователь
    const existingEmployee = company.users.find(
      (emp) => emp.userId === userId
    );
    if (existingEmployee) {
      throw new Error('Этот сотрудник уже добавлен в компанию');
    }

    const updatedUsers = [...company.users, { userId, userName }];
    return this.update(companyId, { users: updatedUsers });
  }

  // Удалить сотрудника из компании
  async removeEmployee(
    companyId: number,
    userId: number
  ): Promise<Company | null> {
    const company = await this.getById(companyId);
    if (!company) {
      return null;
    }

    const updatedUsers = company.users.filter((emp) => emp.userId !== userId);
    return this.update(companyId, { users: updatedUsers });
  }
}

export default new CompanyModel();
