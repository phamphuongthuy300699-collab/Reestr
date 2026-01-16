import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { CampDashboard } from './pages/CampDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserRole } from './types';

const AppContent = () => {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <Layout>
      {currentUser.role === UserRole.ADMIN ? (
        <AdminDashboard />
      ) : (
        <CampDashboard />
      )}
    </Layout>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}