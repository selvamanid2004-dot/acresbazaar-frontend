import React from 'react';
import { Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut, Lock, Home } from 'lucide-react';
import { getCurrentAdminUser, hasModulePermission, getUserFirstAllowedRoute, getRoleBadgeStyle } from '../services/authUtils';

export const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

interface ModuleGuardProps {
  requiredPermission: string;
  moduleTitle?: string;
  children?: React.ReactNode;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({
  requiredPermission,
  moduleTitle = 'Requested Module',
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentAdminUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAllowed = hasModulePermission(user, requiredPermission);

  if (!isAllowed) {
    const fallbackRoute = getUserFirstAllowedRoute(user);
    const badge = getRoleBadgeStyle(user.role);

    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <div style={{
          background: 'var(--card-bg, #111827)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '16px',
          padding: '40px 32px',
          maxWidth: '520px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Lock / Shield Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.1))',
            border: '2px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.2)'
          }}>
            <ShieldAlert size={32} />
          </div>

          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '20px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}>
              <Lock size={12} />
              <span>403 Forbidden Access</span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
              Module Access Restricted
            </h2>

            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Your account <strong style={{ color: '#fff' }}>{user.name}</strong> (<span style={{ color: badge.color, fontWeight: 600 }}>{badge.label}</span>) does not have authorization to access the <strong style={{ color: '#60a5fa' }}>{moduleTitle}</strong> module (<code style={{ color: '#f87171', fontSize: '12px' }}>{location.pathname}</code>).
            </p>

            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '12px',
              color: 'var(--text-muted)',
              textAlign: 'left',
              marginBottom: '20px'
            }}>
              <strong>Backend Security Policy:</strong> Direct URL navigation and API requests to unauthorized sections are blocked by Role-Based Access Control (RBAC). Contact your Super Admin to request module permissions.
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(fallbackRoute)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontWeight: 600
              }}
            >
              <Home size={16} />
              <span>Return to Permitted Section</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                localStorage.removeItem('admin_is_demo');
                navigate('/login');
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
