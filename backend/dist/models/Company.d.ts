import { Company, CreateCompanyRequest, UpdateCompanyRequest, CompanyFilters, PaginationParams, PaginatedCompaniesResponse, CompanyStatsResponse } from '../types/index';
declare class CompanyModel {
    getAll(filters?: CompanyFilters, pagination?: PaginationParams): Promise<PaginatedCompaniesResponse>;
    getById(id: number): Promise<Company | null>;
    create(companyData: CreateCompanyRequest): Promise<Company>;
    update(id: number, updateData: UpdateCompanyRequest): Promise<Company | null>;
    delete(id: number): Promise<boolean>;
    getStats(): Promise<CompanyStatsResponse>;
    addEmployee(companyId: number, userId: number, userName: string): Promise<Company | null>;
    removeEmployee(companyId: number, userId: number): Promise<Company | null>;
}
declare const _default: CompanyModel;
export default _default;
//# sourceMappingURL=Company.d.ts.map