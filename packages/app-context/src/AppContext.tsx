'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string | null;
  department?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (username: string) => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  removeToast: (id: string) => void;
  selectedWarehouse: string;
  setSelectedWarehouse: (id: string) => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const defaultUser: UserProfile = {
  id: 'cmvg2xco0000qluof12345678',
  username: 'admin',
  name: 'วิชัย เกียรติบูรพา',
  email: 'admin@hospital.org',
  role: 'ADMIN',
  department: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(defaultUser);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAllUsers(data);
          // Set initial user to admin or inv_manager
          const admin = data.find((u) => u.username === 'admin') || data[0];
          if (admin) setCurrentUser(admin);
        }
      })
      .catch((err) => console.error('Failed to load users:', err));
  }, []);

  const switchRole = (username: string) => {
    const found = allUsers.find((u) => u.username === username);
    if (found) {
      setCurrentUser(found);
      addToast('info', `สลับผู้ใช้เป็น: ${found.name} [สิทธิ์: ${found.role}]`);
      triggerRefresh();
    }
  };

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        setCurrentUser,
        switchRole,
        toasts,
        addToast,
        removeToast,
        selectedWarehouse,
        setSelectedWarehouse,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
