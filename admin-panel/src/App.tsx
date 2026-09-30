import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, ModuleGuard } from './components/ProtectedRoute';
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
import { StaffManagement } from './pages/StaffManagement';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected Admin Experience with Strict RBAC Module Guards */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ModuleGuard requiredPermission="dashboard" moduleTitle="Dashboard"><Dashboard /></ModuleGuard>} />
          <Route path="/customers" element={<ModuleGuard requiredPermission="customers" moduleTitle="Customers"><Customers /></ModuleGuard>} />
          <Route path="/staff-management" element={<ModuleGuard requiredPermission="staff_management" moduleTitle="Administrator & Staff Management"><StaffManagement /></ModuleGuard>} />
          <Route path="/properties" element={<ModuleGuard requiredPermission="properties" moduleTitle="Properties"><Properties /></ModuleGuard>} />
          <Route path="/bookings" element={<ModuleGuard requiredPermission="bookings" moduleTitle="Booked Properties"><Bookings /></ModuleGuard>} />
          <Route path="/snap-properties" element={<ModuleGuard requiredPermission="snap_properties" moduleTitle="Snap Properties"><SnapProperties /></ModuleGuard>} />
          <Route path="/categories" element={<ModuleGuard requiredPermission="categories" moduleTitle="Categories"><Categories /></ModuleGuard>} />
          <Route path="/rewards" element={<ModuleGuard requiredPermission="rewards" moduleTitle="Rewards"><Rewards /></ModuleGuard>} />
          <Route path="/reports" element={<ModuleGuard requiredPermission="reports" moduleTitle="Reports"><Reports /></ModuleGuard>} />
          <Route path="/website-settings" element={<ModuleGuard requiredPermission="website_settings" moduleTitle="Website Settings & CMS"><WebsiteSettings /></ModuleGuard>} />
          <Route path="/cms-pages" element={<ModuleGuard requiredPermission="website_settings" moduleTitle="Website Settings & CMS"><WebsiteSettings /></ModuleGuard>} />
          <Route path="/plan-management" element={<ModuleGuard requiredPermission="plans" moduleTitle="Plan Management"><Plans /></ModuleGuard>} />
          <Route path="/verified-partners" element={<ModuleGuard requiredPermission="verified_partners" moduleTitle="Dealers & Partners Hub"><VerifiedPartners /></ModuleGuard>} />
          <Route path="/data-export" element={<ModuleGuard requiredPermission="data_export" moduleTitle="Data Export & Download"><DataExport /></ModuleGuard>} />
          <Route path="/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
