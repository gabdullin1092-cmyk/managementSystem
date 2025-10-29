import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserList from '@/components/UserList';
import UserForm from '@/components/UserForm';
import CompanyList from '@/components/CompanyList';
import CompanyForm from '@/components/CompanyForm';
import { User, Company } from '@/types';
import './App.css';

// Создаем клиент для TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 минут
    },
    mutations: {
      retry: 0,
    }
  },
});

type ActiveSection = 'users' | 'companies';
type ActiveTab = 'list' | 'form';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('users');
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  const handleEditUser = (user: User): void => {
    setEditingUser(user);
    setActiveTab('form');
  };

  const handleEditCompany = (company: Company): void => {
    setEditingCompany(company);
    setActiveTab('form');
  };

  const handleFormSuccess = (): void => {
    setActiveTab('list');
    setEditingUser(null);
    setEditingCompany(null);
  };

  const handleCancelEdit = (): void => {
    setEditingUser(null);
    setEditingCompany(null);
    setActiveTab('list');
  };

  const handleAddNewUser = (): void => {
    setEditingUser(null);
    setEditingCompany(null);
    setActiveTab('form');
  };

  const handleSwitchSection = (section: ActiveSection): void => {
    setActiveSection(section);
    setActiveTab('list');
    setEditingUser(null);
    setEditingCompany(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header className="header">
          <h1>🏢 Система управления</h1>
          
          {/* Переключатель разделов */}
          <div className="section-switcher">
            <button
              type="button"
              className={`section-button ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => handleSwitchSection('users')}
            >
              👥 Пользователи
            </button>
            <button
              type="button"
              className={`section-button ${activeSection === 'companies' ? 'active' : ''}`}
              onClick={() => handleSwitchSection('companies')}
            >
              🏢 Компании
            </button>
          </div>

          {/* Навигация внутри раздела */}
          <nav className="nav">
            <button
              type="button"
              className={`nav-button ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              📋 Список {activeSection === 'users' ? 'пользователей' : 'компаний'}
            </button>
            <button
              type="button"
              className={`nav-button ${activeTab === 'form' ? 'active' : ''}`}
              onClick={handleAddNewUser}
            >
              ➕ Добавить {activeSection === 'users' ? 'пользователя' : 'компанию'}
            </button>
          </nav>
        </header>

        <main className="main">
          {/* Раздел пользователей */}
          {activeSection === 'users' && (
            <>
              {activeTab === 'list' && (
                <UserList onEditUser={handleEditUser} />
              )}
              {activeTab === 'form' && (
                <UserForm
                  user={editingUser || undefined}
                  onSuccess={handleFormSuccess}
                  onCancel={handleCancelEdit}
                />
              )}
            </>
          )}

          {/* Раздел компаний */}
          {activeSection === 'companies' && (
            <>
              {activeTab === 'list' && (
                <CompanyList onEditCompany={handleEditCompany} />
              )}
              {activeTab === 'form' && (
                <CompanyForm
                  company={editingCompany || undefined}
                  onSuccess={handleFormSuccess}
                  onCancel={handleCancelEdit}
                />
              )}
            </>
          )}
        </main>

        <footer className="footer">
          <p>© 2025 Система управления пользователями и компаниями</p>
          <p>TypeScript + React + TanStack Query + Formik</p>
        </footer>
      </div>
    </QueryClientProvider>
  );
};

export default App;