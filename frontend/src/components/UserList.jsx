import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../api';
import UserCard from './UserCard';

const UserList = ({ onEditUser }) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    status: ''
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  // Запрос пользователей с TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', page, appliedFilters],
    queryFn: () => userAPI.getUsers(page, 10, appliedFilters),
  });

  // Запрос статистики
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: userAPI.getStats,
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ name: '', city: '', status: '' });
    setAppliedFilters({});
    setPage(1);
  };

  const handleRefresh = () => {
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
    return (
      <div className="error">
        <h3>Ошибка загрузки данных</h3>
        <p>{error.message}</p>
        <button className="btn btn-primary" onClick={handleRefresh}>
          Попробовать снова
        </button>
      </div>
    );
  }

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="user-list">
      {/* Статистика */}
      {stats && (
        <div className="stats-panel">
          <h3>Статистика</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Всего пользователей:</span>
              <span className="stat-value">{stats.data.total_users}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Активных:</span>
              <span className="stat-value">{stats.data.status_10_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Неактивных:</span>
              <span className="stat-value">{stats.data.status_20_count}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Уникальных городов:</span>
              <span className="stat-value">{stats.data.unique_cities}</span>
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
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              placeholder="Поиск по имени..."
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="city-filter">Город:</label>
            <input
              id="city-filter"
              type="text"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              placeholder="Поиск по городу..."
            />
          </div>
          
          <div className="filter-group">
            <label htmlFor="status-filter">Статус:</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Все статусы</option>
              <option value="10">Активный</option>
              <option value="20">Неактивный</option>
            </select>
          </div>
          
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={handleApplyFilters}>
              Применить
            </button>
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Очистить
            </button>
            <button className="btn btn-refresh" onClick={handleRefresh}>
              Обновить
            </button>
          </div>
        </div>
      </div>

      {/* Список пользователей */}
      <div className="users-section">
        <div className="section-header">
          <h3>Пользователи ({pagination.totalCount || 0})</h3>
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
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
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