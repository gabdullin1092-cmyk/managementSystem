import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserList from '@/components/UserList';
import UserForm from '@/components/UserForm';
import { User } from '@/types';
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

type ActiveTab = 'list' | 'form';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleEditUser = (user: User): void => {
    setEditingUser(user);
    setActiveTab('form');
  };

  const handleFormSuccess = (): void => {
    setActiveTab('list');
    setEditingUser(null);
  };

  const handleCancelEdit = (): void => {
    setEditingUser(null);
    setActiveTab('list');
  };

  const handleAddNewUser = (): void => {
    setEditingUser(null);
    setActiveTab('form');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header className="header">
          <h1>Управление пользователями</h1>
          <nav className="nav">
            <button
              type="button"
              className={`nav-button ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Список пользователей
            </button>
            <button
              type="button"
              className={`nav-button ${activeTab === 'form' ? 'active' : ''}`}
              onClick={handleAddNewUser}
            >
              Добавить пользователя
            </button>
          </nav>
        </header>

        <main className="main">
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
        </main>
      </div>
    </QueryClientProvider>
  );
};

export default App;