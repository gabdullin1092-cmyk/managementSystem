import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import * as Yup from 'yup';
import { companyAPI, userAPI, apiUtils } from '@/api/index';
import {
  CompanyFormProps,
  CompanyFormValues,
  CompanyStatus,
  CreateCompanyData,
  UpdateCompanyData,
  CompanyEmployee,
  User
} from '@/types';

// Схема валидации с Yup
const CompanySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Название должно содержать минимум 2 символа')
    .max(200, 'Название не должно превышать 200 символов')
    .required('Название обязательно для заполнения'),
  idn: Yup.string()
    .matches(/^\d+$/, 'ИНН должен содержать только цифры')
    .min(10, 'ИНН должен содержать минимум 10 цифр')
    .max(12, 'ИНН не должен превышать 12 цифр')
    .required('ИНН обязателен для заполнения'),
  address: Yup.string()
    .max(300, 'Адрес не должен превышать 300 символов'),
  status: Yup.number()
    .oneOf([CompanyStatus.ACTIVE, CompanyStatus.INACTIVE], 'Статус должен быть 10 (Активная) или 20 (Неактивная)')
    .required('Статус обязателен')
});

const CompanyForm: React.FC<CompanyFormProps> = ({ company, onSuccess, onCancel }) => {
  const queryClient = useQueryClient();
  const isEditing = !!company;
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Получаем список всех пользователей для выбора сотрудников
  const { data: usersResponse } = useQuery({
    queryKey: ['users', 1, 100],
    queryFn: () => userAPI.getUsers(1, 100),
  });

  const availableUsers = usersResponse?.data?.users || [];

  // Мутация для создания компании
  const createMutation = useMutation({
    mutationFn: (companyData: CreateCompanyData) => companyAPI.createCompany(companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companyStats'] });
      alert('Компания успешно создана!');
      formik.resetForm();
      onSuccess();
    },
    onError: (error: unknown) => {
      const message = apiUtils.getErrorMessage(error);
      alert(`Ошибка при создании: ${message}`);
    },
  });

  // Мутация для обновления компании
  const updateMutation = useMutation({
    mutationFn: ({ id, companyData }: { id: number; companyData: UpdateCompanyData }) =>
      companyAPI.updateCompany(id, companyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['companyStats'] });
      alert('Компания успешно обновлена!');
      onSuccess();
    },
    onError: (error: unknown) => {
      const message = apiUtils.getErrorMessage(error);
      alert(`Ошибка при обновлении: ${message}`);
    },
  });

  // Начальные значения формы
  const initialValues: CompanyFormValues = {
    name: company?.name || '',
    idn: company?.idn || '',
    address: company?.address || '',
    status: company?.status || CompanyStatus.ACTIVE,
    users: company?.users || []
  };

  // Использование useFormik хука
  const formik = useFormik<CompanyFormValues>({
    initialValues,
    validationSchema: CompanySchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      const formattedValues: CreateCompanyData | UpdateCompanyData = {
        name: values.name.trim(),
        idn: values.idn.trim(),
        address: values.address?.trim() || undefined,
        status: values.status,
        users: values.users
      };

      if (isEditing && company) {
        updateMutation.mutate({ id: company.id, companyData: formattedValues });
      } else {
        createMutation.mutate(formattedValues as CreateCompanyData);
      }
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Добавить сотрудника
  const handleAddEmployee = (): void => {
    if (!selectedUserId) return;

    const user = availableUsers.find((u: User) => u.id === parseInt(selectedUserId));
    if (!user) return;

    // Проверяем, не добавлен ли уже этот сотрудник
    const alreadyExists = formik.values.users.some((emp: CompanyEmployee) => emp.userId === user.id);
    if (alreadyExists) {
      alert('Этот сотрудник уже добавлен в компанию');
      return;
    }

    const newEmployee: CompanyEmployee = {
      userId: user.id,
      userName: user.name
    };

    formik.setFieldValue('users', [...formik.values.users, newEmployee]);
    setSelectedUserId('');
  };

  // Удалить сотрудника
  const handleRemoveEmployee = (userId: number): void => {
    const updatedUsers = formik.values.users.filter((emp: CompanyEmployee) => emp.userId !== userId);
    formik.setFieldValue('users', updatedUsers);
  };

  const getStatusLabel = (status: CompanyStatus): string => {
    return status === CompanyStatus.ACTIVE ? 'Активная' : 'Неактивная';
  };

  return (
    <div className="company-form">
      <div className="form-header">
        <h2>{isEditing ? 'Редактировать компанию' : 'Создать новую компанию'}</h2>
      </div>

      <form className="form" onSubmit={formik.handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Название компании *</label>
          <input
            type="text"
            name="name"
            id="name"
            className="form-control"
            placeholder="Введите название компании"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name && (
            <div className="error-message">{formik.errors.name}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="idn">ИНН *</label>
          <input
            type="text"
            name="idn"
            id="idn"
            className="form-control"
            placeholder="Введите ИНН (10-12 цифр)"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.idn}
          />
          {formik.touched.idn && formik.errors.idn && (
            <div className="error-message">{formik.errors.idn}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="address">Адрес</label>
          <input
            type="text"
            name="address"
            id="address"
            className="form-control"
            placeholder="Введите адрес компании"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.address}
          />
          {formik.touched.address && formik.errors.address && (
            <div className="error-message">{formik.errors.address}</div>
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
            <option value={CompanyStatus.ACTIVE}>Активная</option>
            <option value={CompanyStatus.INACTIVE}>Неактивная</option>
          </select>
          {formik.touched.status && formik.errors.status && (
            <div className="error-message">{formik.errors.status}</div>
          )}
        </div>

        {/* Управление сотрудниками */}
        <div className="form-section">
          <h3>Сотрудники компании</h3>
          
          <div className="employee-selector">
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="form-control"
            >
              <option value="">Выберите сотрудника...</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} (ID: {user.id})
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-add"
              onClick={handleAddEmployee}
              disabled={!selectedUserId}
            >
              ➕ Добавить
            </button>
          </div>

          {formik.values.users.length > 0 ? (
            <div className="employees-list">
              <h4>Добавленные сотрудники ({formik.values.users.length}):</h4>
              <ul>
                {formik.values.users.map((employee) => (
                  <li key={employee.userId} className="employee-item">
                    <span>
                      {employee.userName} (ID: {employee.userId})
                    </span>
                    <button
                      type="button"
                      className="btn btn-remove-small"
                      onClick={() => handleRemoveEmployee(employee.userId)}
                    >
                      ❌
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="no-employees">Сотрудники не добавлены</p>
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
              : (isEditing ? 'Сохранить изменения' : 'Создать компанию')
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
          <p><strong>Название:</strong> {formik.values.name || 'Не указано'}</p>
          <p><strong>ИНН:</strong> {formik.values.idn || 'Не указан'}</p>
          <p><strong>Адрес:</strong> {formik.values.address || 'Не указан'}</p>
          <p><strong>Статус:</strong> {getStatusLabel(formik.values.status)}</p>
          <p><strong>Сотрудников:</strong> {formik.values.users.length}</p>
        </div>

        {/* Отладочная информация */}
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
                  <li key={field}>{field}: {typeof error === 'string' ? error : JSON.stringify(error)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;
