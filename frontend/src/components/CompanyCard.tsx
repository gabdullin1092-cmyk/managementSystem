import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyAPI, apiUtils } from '@/api/index';
import { CompanyCardProps, COMPANY_STATUS_LABELS } from '@/types';

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onEdit }) => {
  const queryClient = useQueryClient();

  // Мутация для удаления компании
  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyAPI.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companyStats'] });
      alert('Компания успешно удалена!');
    },
    onError: (error: unknown) => {
      const message = apiUtils.getErrorMessage(error);
      alert(`Ошибка при удалении: ${message}`);
    },
  });

  const handleDelete = (): void => {
    if (window.confirm(`Вы уверены, что хотите удалить компанию "${company.name}"?`)) {
      deleteMutation.mutate(company.id);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>{company.name}</h3>
        <span className={`status status-${company.status}`}>
          {COMPANY_STATUS_LABELS[company.status]}
        </span>
      </div>

      <div className="card-body">
        <div className="card-row">
          <strong>ИНН:</strong>
          <span>{company.idn}</span>
        </div>

        {company.address && (
          <div className="card-row">
            <strong>Адрес:</strong>
            <span>{company.address}</span>
          </div>
        )}

        <div className="card-row">
          <strong>Сотрудников:</strong>
          <span>{company.users.length}</span>
        </div>

        {company.users.length > 0 && (
          <div className="card-section">
            <strong>Список сотрудников:</strong>
            <ul className="employee-list">
              {company.users.map((employee) => (
                <li key={employee.userId}>
                  {employee.userName} (ID: {employee.userId})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="card-row">
          <strong>Создана:</strong>
          <span>{formatDate(company.created_at)}</span>
        </div>

        <div className="card-row">
          <strong>Обновлена:</strong>
          <span>{formatDate(company.updated_at)}</span>
        </div>
      </div>

      <div className="card-actions">
        <button
          className="btn btn-edit"
          onClick={() => onEdit(company)}
          disabled={deleteMutation.isPending}
        >
          ✏️ Редактировать
        </button>
        <button
          className="btn btn-delete"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? '⏳ Удаление...' : '🗑️ Удалить'}
        </button>
      </div>
    </div>
  );
};

export default CompanyCard;
