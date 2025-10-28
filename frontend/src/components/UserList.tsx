import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userAPI, apiUtils } from '@/api/index';
import UserCard from './UserCard';
import { UserListProps, UserFilters, UserStatus } from '@/types';

const UserList: React.FC<UserListProps> = ({ onEditUser }) => {
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState<UserFilters>({
    name: '',
    city: '',
    status: ''
  });
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>({});

  // Запрос пользователей с TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', page, appliedFilters],
    queryFn: () => userAPI.getUsers(page, 10, appliedFilters),
  });

  // Запрос статистики
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: userAPI.getStats,
  });

  const handleFilterChange = (field: keyof UserFilters, value: string): void => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = (): void => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleClearFilters = (): void => {
    const emptyFilters: UserFilters = { name: '', city: '', status: '' };
    setFilters(emptyFilters);
    setAppliedFilters({});
    setPage(1);
  };

  const handleRefresh = (): void => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка пользователей...</p>
      </div>
    );
  }

  if (error) {
    const errorMessage = apiUtils.getErrorMessage(error);
    return (
      <div className="error">
        <h3>Ошибка загрузки данных</h3>
        <p>{errorMessage}</p>
        <button className="btn btn-primary" onClick={handleRefresh}>
          Попробовать снова
        </button>
      </div>
    );
  }

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;
  const stats = statsData?.data;

  return (
    <div className="user-list">
      {/* Статистика */}
      {stats && (
        <div className="stats-panel">
          <h3>Статистика</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Всего пользователей:</span>
              <span className="stat-value">{stats.total_users}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Активных:</span>
              <span className="stat-value">{stats.status_10_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Неактивных:</span>
              <span className="stat-value">{stats.status_20_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Уникальных городов:</span>
              <span className="stat-value">{stats.unique_cities}</span>
            </div>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="filters-panel">
        <h3>Фильтры</h3>
        <div className="filters-form">
          <div className="filter-group">
            <label htmlFor="name-filter">Имя:</label>
            <input
              id="name-filter"
              type="text"
              value={filters.name || ''}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Поиск по имени..."
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="city-filter">Город:</label>
            <input
              id="city-filter"
              type="text"
              value={filters.city || ''}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Поиск по городу..."
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="status-filter">Статус:</label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value={UserStatus.ACTIVE.toString()}>Активный</option>
              <option value={UserStatus.INACTIVE.toString()}>Неактивный</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={handleApplyFilters}
            >
              Применить
            </button>
            <button 
              type="button"
              className="btn btn-secondary" 
              onClick={handleClearFilters}
            >
              Очистить
            </button>
            <button 
              type="button"
              className="btn btn-refresh" 
              onClick={handleRefresh}
            >
              Обновить
            </button>
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      <div className="users-section">
        <div className="section-header">
          <h3>Пользователи ({pagination?.totalCount || 0})</h3>
        </div>

        {users.length === 0 ? (
          <div className="empty-state">
            <p>Пользователи не найдены</p>
          </div>
        ) : (
          <>
            <div className="users-grid">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onEdit={onEditUser}
                />
              ))}
            </div>

            {/* Пагинация */}
            {pagination && pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage(page - 1)}
                >
                  Назад
                </button>
                
                <span className="pagination-info">
                  Страница {pagination.currentPage} из {pagination.totalPages}
                </span>
                
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage(page + 1)}
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;