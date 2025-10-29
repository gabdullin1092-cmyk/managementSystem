import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { companyAPI } from '@/api/index';
import CompanyCard from './CompanyCard';
import { Company, CompanyListProps, CompanyFilters, CompanyStatus } from '@/types';

const CompanyList: React.FC<CompanyListProps> = ({ onEditCompany }) => {
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<CompanyFilters>({
    name: '',
    idn: '',
    status: ''
  });

  // Запрос списка компаний
  const {
    data: companiesResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['companies', page, filters],
    queryFn: () => companyAPI.getCompanies(page, 10, filters),
  });

  // Запрос статистики
  const { data: statsResponse } = useQuery({
    queryKey: ['companyStats'],
    queryFn: () => companyAPI.getStats(),
  });

  const handleFilterChange = (
    field: keyof CompanyFilters,
    value: string | CompanyStatus | ''
  ): void => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPage(1); // Сбрасываем на первую страницу при изменении фильтров
  };

  const handleClearFilters = (): void => {
    setFilters({
      name: '',
      idn: '',
      status: ''
    });
    setPage(1);
  };

  if (isLoading) {
    return <div className="loading">⏳ Загрузка компаний...</div>;
  }

  if (isError) {
    return (
      <div className="error">
        ❌ Ошибка загрузки компаний: {error instanceof Error ? error.message : 'Неизвестная ошибка'}
      </div>
    );
  }

  const companies = companiesResponse?.data?.companies || [];
  const pagination = companiesResponse?.data?.pagination;
  const stats = statsResponse?.data;

  return (
    <div className="company-list">
      {/* Статистика */}
      {stats && (
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Всего компаний:</span>
            <span className="stat-value">{stats.total_companies}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Активные:</span>
            <span className="stat-value status-10">{stats.status_10_count}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Неактивные:</span>
            <span className="stat-value status-20">{stats.status_20_count}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Всего сотрудников:</span>
            <span className="stat-value">{stats.total_employees}</span>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="filters">
        <h3>Фильтры</h3>
        <div className="filter-row">
          <div className="filter-group">
            <label htmlFor="filter-name">Название компании:</label>
            <input
              type="text"
              id="filter-name"
              value={filters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Поиск по названию..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-idn">ИНН:</label>
            <input
              type="text"
              id="filter-idn"
              value={filters.idn || ''}
              onChange={(e) => handleFilterChange('idn', e.target.value)}
              placeholder="Поиск по ИНН..."
            />
          </div>

          <div className="filter-group">
            <label htmlFor="filter-status">Статус:</label>
            <select
              id="filter-status"
              value={filters.status?.toString() || ''}
              onChange={(e) =>
                handleFilterChange(
                  'status',
                  e.target.value ? parseInt(e.target.value) as CompanyStatus : ''
                )
              }
            >
              <option value="">Все статусы</option>
              <option value={CompanyStatus.ACTIVE}>Активная</option>
              <option value={CompanyStatus.INACTIVE}>Неактивная</option>
            </select>
          </div>

          <button className="btn btn-clear" onClick={handleClearFilters}>
            🔄 Сбросить фильтры
          </button>
        </div>
      </div>

      {/* Список компаний */}
      {companies.length === 0 ? (
        <div className="no-data">
          <p>📋 Компании не найдены</p>
          <p>Попробуйте изменить фильтры или добавить новую компанию</p>
        </div>
      ) : (
        <div className="cards-grid">
          {companies.map((company: Company) => (
            <CompanyCard key={company.id} company={company} onEdit={onEditCompany} />
          ))}
        </div>
      )}

      {/* Пагинация */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-pagination"
            onClick={() => setPage((prev) => prev - 1)}
            disabled={!pagination.hasPrev}
          >
            ← Предыдущая
          </button>
          <span className="pagination-info">
            Страница {pagination.currentPage} из {pagination.totalPages} (всего:{' '}
            {pagination.totalCount})
          </span>
          <button
            className="btn btn-pagination"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!pagination.hasNext}
          >
            Следующая →
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyList;
