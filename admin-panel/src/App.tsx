import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminLayout } from './components/AdminLayout';

import { AdminLogin } from './pages/AdminLogin';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Properties } from './pages/Properties';
import { Bookings } from './pages/Bookings';
import { SnapProperties } from './pages/SnapProperties';
import { Categories } from './pages/Categories';
import { Plans } from './pages/Plans';
import { Rewards } from './pages/Rewards';
import { Reports } from './pages/Reports';
import { WebsiteSettings } from './pages/WebsiteSettings';
import { VerifiedPartners } from './pages/VerifiedPartners';
import { DataExport } from './pages/DataExport';
import { ChangePassword } from './pages/ChangePassword';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected Admin Experience */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/snap-properties" element={<SnapProperties />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/website-settings" element={<WebsiteSettings />} />
          <Route path="/cms-pages" element={<WebsiteSettings />} />
          <Route path="/plan-management" element={<Plans />} />
          <Route path="/verified-partners" element={<VerifiedPartners />} />
          <Route path="/data-export" element={<DataExport />} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
