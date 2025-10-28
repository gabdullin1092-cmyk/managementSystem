import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, apiUtils } from '@/api/index';
import { UserCardProps, USER_STATUS_LABELS, UserStatus } from '@/types';

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const queryClient = useQueryClient();

  // Мутация для удаления пользователя
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userAPI.deleteUser(id),
    onSuccess: () => {
      // Обновляем кеш после успешного удаления
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      alert('Пользователь успешно удален!');
    },
    onError: (error: unknown) => {
      const message = apiUtils.getErrorMessage(error);
      alert(`Ошибка при удалении: ${message}`);
    },
  });

  const handleDelete = (): void => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      deleteMutation.mutate(user.id);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Не указано';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return 'Неверная дата';
    }
  };

  const getStatusText = (status: UserStatus): string => {
    return USER_STATUS_LABELS[status] || 'Не определен';
  };

  const getStatusClass = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'status-active';
      case UserStatus.INACTIVE:
        return 'status-inactive';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className="user-card">
      <div className="user-card-header">
        <h3 className="user-name">{user.name || 'Имя не указано'}</h3>
        <span className={`status-badge ${getStatusClass(user.status)}`}>
          {getStatusText(user.status)}
        </span>
      </div>

      <div className="user-card-body">
        <div className="user-info">
          <div className="info-item">
            <strong>ID:</strong> {user.id}
          </div>
          <div className="info-item">
            <strong>Адрес:</strong> {user.address || 'Не указан'}
          </div>
          <div className="info-item">
            <strong>Город:</strong> {user.city || 'Не указан'}
          </div>
          <div className="info-item">
            <strong>Дата рождения:</strong> {formatDate(user.birthday)}
          </div>
          <div className="info-item">
            <strong>Создан:</strong> {formatDate(user.created_at)}
          </div>
          <div className="info-item">
            <strong>Обновлен:</strong> {formatDate(user.updated_at)}
          </div>
        </div>
      </div>

      <div className="user-card-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onEdit(user)}
          disabled={deleteMutation.isPending}
        >
          Редактировать
        </button>
        <button
          type="button"
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? 'Удаление...' : 'Удалить'}
        </button>
      </div>
    </div>
  );
};

export default UserCard;