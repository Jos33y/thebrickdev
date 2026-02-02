/**
 * App - Main Application Component
 * 
 * Routes:
 * - / : Public portfolio site
 * - /portal/* : Private admin portal
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { PageLoader } from './components/common';
import Home from './pages/Home';

// Portal pages
import PortalLayout from './pages/portal/PortalLayout';
import Login from './pages/portal/Login';
import Dashboard from './pages/portal/Dashboard';
import Clients from './pages/portal/Clients';
import ClientDetail from './pages/portal/ClientDetail';
import Invoices from './pages/portal/Invoices';
import InvoiceCreate from './pages/portal/InvoiceCreate';
import InvoiceDetail from './pages/portal/InvoiceDetail';
import InvoiceEdit from './pages/portal/InvoiceEdit';
import Payments from './pages/portal/Payments';
import PaymentCreate from './pages/portal/PaymentCreate';
import PaymentDetail from './pages/portal/PaymentDetail';
import PaymentEdit from './pages/portal/PaymentEdit';
import Settings from './pages/portal/Settings';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <PageLoader onLoadComplete={() => setIsLoaded(true)} />}
      
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          
          {/* Portal Routes */}
          <Route path="/portal/login" element={<Login />} />
          
          {/* Protected Portal Routes (wrapped in PortalLayout) */}
          <Route path="/portal" element={<PortalLayout />}>
            {/* Redirect /portal to /portal/dashboard */}
            <Route index element={<Navigate to="/portal/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* Clients */}
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientDetail />} />
            
            {/* Invoices */}
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<InvoiceCreate />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="invoices/:id/edit" element={<InvoiceEdit />} />
            
            {/* Payments - FIXED: Added missing routes */}
            <Route path="payments" element={<Payments />} />
            <Route path="payments/new" element={<PaymentCreate />} />
            <Route path="payments/:id" element={<PaymentDetail />} />
            <Route path="payments/:id/edit" element={<PaymentEdit />} />
            
            {/* Settings */}
            <Route path="settings" element={<Settings />} />
          </Route>
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;