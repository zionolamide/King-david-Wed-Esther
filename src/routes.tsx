import WeddingPage from './pages/WeddingPage';
import AdminPage from './pages/AdminPage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: 'Wedding Invitation',
    path: '/',
    element: <WeddingPage />,
    public: true,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminPage />,
    public: true,
  }
];
