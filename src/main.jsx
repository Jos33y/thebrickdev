/**
 * Main Entry Point
 * Renders App to DOM with providers
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './styles/index.css';

// Create a query client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus in development
      refetchOnWindowFocus: false,
      // Retry failed requests once
      retry: 1,
      // Consider data stale after 30 seconds
      staleTime: 30 * 1000,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
 