import './globals.css'

import { AuthProvider } from './features/auth/provider/auth-provider';
import { QueryClientProvider } from '@tanstack/react-query';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { Toaster } from './components/ui/toaster';
import { UIProvider } from './components/ui/provider';
import { queryClient } from './lib/queryClient';
import reportWebVitals from './reportWebVitals';
import { router } from './lib/router';
import { useAuth } from './features/auth/provider/use-auth';

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <UIProvider>
            <AuthApp />
            <Toaster />
          </UIProvider>
        </QueryClientProvider>
      </AuthProvider>
    </StrictMode>,
  );
}

function AuthApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
