import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { setupInterceptors } from './api/axios';
import router from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Inner component: runs after AuthProvider is mounted so it has access to
 * the auth context — needed to wire the axios interceptors.
 */
function AppInner() {
  const auth = useAuth();

  setupInterceptors({
    tokenRef: auth.tokenRef,
    refresh: auth.refresh,
    clearSession: auth.clearSession,
  });

  return <RouterProvider router={router} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
