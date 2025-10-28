import React from 'react';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Yup from 'yup';
import { userAPI } from '../api';

// Схема валидации с Yup
const UserSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов')
    .required('Имя обязательно для заполнения'),
  address: Yup.string()
    .max(200, 'Адрес не должен превышать 200 символов'),
  city: Yup.string()
    .max(50, 'Название города не должно превышать 50 символов'),
  birthday: Yup.date()
    .max(new Date(), 'Дата рождения не может быть в будущем'),
  status: Yup.number()
    .oneOf([10, 20], 'Статус должен быть 10 (Активный) или 20 (Неактивный)')
    .required('Статус обязателен')
});

const UserForm = ({ user, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const isEditing = !!user;

  // Мутация для создания пользователя
  const createMutation = useMutation({
    mutationFn: userAPI.createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      alert('Пользователь успешно создан!');
      formik.resetForm();
      onSuccess();
    },
    onError: (error) => {
      alert(`Ошибка при создании: ${error.response?.data?.message || error.message}`);
    },
  });

  // Мутация для обновления пользователя
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => userAPI.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      alert('Пользователь успешно обновлен!');
      onSuccess();
    },
    onError: (error) => {
      alert(`Ошибка при обновлении: ${error.response?.data?.message || error.message}`);
    },
  });

  // Начальные значения формы
  const initialValues = {
    name: user?.name || '',
    address: user?.address || '',
    city: user?.city || '',
    birthday: user?.birthday ? user.birthday.split('T')[0] : '',
    status: user?.status || 10
  };

  // Использование useFormik хука
  const formik = useFormik({
    initialValues,
    validationSchema: UserSchema,
    enableReinitialize: true,
    onSubmit: (values, { setSubmitting }) => {
      const formattedValues = {
        ...values,
        birthday: values.birthday || null,
        status: Number(values.status)
      };

      if (isEditing) {
        updateMutation.mutate({ id: user.id, data: formattedValues });
      } else {
        createMutation.mutate(formattedValues);
      }
      
      setSubmitting(false);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="user-form">
      <div className="form-header">
        <h2>{isEditing ? 'Редактировать пользователя' : 'Создать нового пользователя'}</h2>
      </div>

      <form className="form" onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Имя *</label>
          <input
            type="text"
            name="name"
            id="name"
            className="form-control"
            placeholder="Введите имя пользователя"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="error-message">{formik.errors.name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address">Адрес</label>
          <input
            type="text"
            name="address"
            id="address"
            className="form-control"
            placeholder="Введите адрес"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.address}
          />
          {formik.touched.address && formik.errors.address && (
            <div className="error-message">{formik.errors.address}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="city">Город</label>
          <input
            type="text"
            name="city"
            id="city"
            className="form-control"
            placeholder="Введите город"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.city}
          />
          {formik.touched.city && formik.errors.city && (
            <div className="error-message">{formik.errors.city}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="birthday">Дата рождения</label>
          <input
            type="date"
            name="birthday"
            id="birthday"
            className="form-control"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.birthday}
          />
          {formik.touched.birthday && formik.errors.birthday && (
            <div className="error-message">{formik.errors.birthday}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="status">Статус *</label>
          <select 
            name="status" 
            id="status" 
            className="form-control"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.status}
          >
            <option value={10}>Активный</option>
            <option value={20}>Неактивный</option>
          </select>
          {formik.touched.status && formik.errors.status && (
            <div className="error-message">{formik.errors.status}</div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={formik.isSubmitting || isPending}
          >
            {isPending
              ? (isEditing ? 'Сохранение...' : 'Создание...')
              : (isEditing ? 'Сохранить изменения' : 'Создать пользователя')
            }
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isPending}
          >
            Отмена
          </button>

          {/* Дополнительные кнопки для демонстрации возможностей useFormik */}
          <button
            type="button"
            className="btn btn-refresh"
            onClick={() => formik.resetForm()}
            disabled={isPending}
          >
            Сбросить форму
          </button>
        </div>
      </form>

      {/* Предварительный просмотр */}
      <div className="form-preview">
        <h3>Предварительный просмотр</h3>
        <div className="preview-card">
          <p><strong>Имя:</strong> {formik.values.name || 'Не указано'}</p>
          <p><strong>Адрес:</strong> {formik.values.address || 'Не указан'}</p>
          <p><strong>Город:</strong> {formik.values.city || 'Не указан'}</p>
          <p><strong>Дата рождения:</strong> {formik.values.birthday || 'Не указана'}</p>
          <p><strong>Статус:</strong> {Number(formik.values.status) === 10 ? 'Активный' : 'Неактивный'}</p>
        </div>
        
        {/* Дополнительная информация о состоянии формы */}
        <div className="form-debug">
          <h4>Отладочная информация:</h4>
          <p><strong>Форма валидна:</strong> {formik.isValid ? '✅' : '❌'}</p>
          <p><strong>Форма изменена:</strong> {formik.dirty ? '✅' : '❌'}</p>
          <p><strong>Отправляется:</strong> {formik.isSubmitting ? '✅' : '❌'}</p>
          {Object.keys(formik.errors).length > 0 && (
            <div>
              <strong>Ошибки:</strong>
              <ul>
                {Object.entries(formik.errors).map(([field, error]) => (
                  <li key={field}>{field}: {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserForm;