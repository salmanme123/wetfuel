import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider } from './context/SidebarContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
