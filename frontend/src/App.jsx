import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import './App.css';

// Создаем клиент для TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [editingUser, setEditingUser] = useState(null);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setActiveTab('form');
  };

  const handleFormSuccess = () => {
    setActiveTab('list');
    setEditingUser(null);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setActiveTab('list');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <header className="header">
          <h1>Управление пользователями</h1>
          <nav className="nav">
            <button
              className={`nav-button ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Список пользователей
            </button>
            <button
              className={`nav-button ${activeTab === 'form' ? 'active' : ''}`}
              onClick={() => {
                setEditingUser(null);
                setActiveTab('form');
              }}
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
              user={editingUser}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelEdit}
            />
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;