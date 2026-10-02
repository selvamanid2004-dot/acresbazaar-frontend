import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Camera,
  Tags,
  Award,
  AlertCircle,
  Settings,
  CreditCard,
  ShieldCheck,
  Download,
  KeyRound,
  LogOut,
  BookmarkCheck,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Bell,
  Database,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  UserCog
} from 'lucide-react';
import { api, exitDemoMode, isDemoSession } from '../services/api';
import { AdminUser } from '../types';
import { getCurrentAdminUser, hasModulePermission, getRoleBadgeStyle } from '../services/authUtils';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [switchingToLive, setSwitchingToLive] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(getCurrentAdminUser());

  const checkBackend = async () => {
    try {
      const res = await api.checkBackendHealth();
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  };

  // Sync fresh profile & permissions
  const syncProfile = async () => {
    try {
      const me = await api.getMe();
      if (me) {
        setAdminUser(me);
        localStorage.setItem('admin_user', JSON.stringify(me));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    checkBackend();
    syncProfile();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  // Submenu states
  const isCustomersActive = location.pathname.startsWith('/customers');
  const isPropertiesActive = location.pathname.startsWith('/properties');
  const isSettingsActive = location.pathname.startsWith('/website-settings') || location.pathname.startsWith('/cms-pages');

  const [customersOpen, setCustomersOpen] = useState<boolean>(true);
  const [propertiesOpen, setPropertiesOpen] = useState<boolean>(true);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(isSettingsActive);

  const isDemo = isDemoSession();

  // Permission checks
  const canDashboard = hasModulePermission(adminUser, 'dashboard');
  const canBuyers = hasModulePermission(adminUser, 'buyers');
  const canSellers = hasModulePermission(adminUser, 'sellers');
  const canDealers = hasModulePermission(adminUser, 'dealers');
  const canCommonPeople = hasModulePermission(adminUser, 'common_people');
  const canStaffManagement = hasModulePermission(adminUser, 'staff_management') || adminUser?.role === 'SUPER_ADMIN';
  const canCustomersGroup = hasModulePermission(adminUser, 'customers') || canBuyers || canSellers || canDealers || canCommonPeople || canStaffManagement;

  const canProperties = hasModulePermission(adminUser, 'properties');
  const canGoldProps = hasModulePermission(adminUser, 'gold_properties') || canProperties;
  const canPremiumProps = hasModulePermission(adminUser, 'premium_properties') || canProperties;
  const canSnapProps = hasModulePermission(adminUser, 'snap_properties') || canProperties;
  const canBookings = hasModulePermission(adminUser, 'bookings') || canProperties;
  const canPropertiesGroup = canProperties || canGoldProps || canPremiumProps || canSnapProps || canBookings;

  const canCategories = hasModulePermission(adminUser, 'categories');
  const canRewards = hasModulePermission(adminUser, 'rewards');
  const canReports = hasModulePermission(adminUser, 'reports');
  const canWebsiteSettings = hasModulePermission(adminUser, 'website_settings');
  const canContactDetails = hasModulePermission(adminUser, 'contact_details') || canWebsiteSettings;
  const canLogoManagement = hasModulePermission(adminUser, 'logo_management') || canWebsiteSettings;
  const canCmsGroup = canWebsiteSettings || canContactDetails || canLogoManagement;

  const canPlans = hasModulePermission(adminUser, 'plans');
  const canPartners = hasModulePermission(adminUser, 'verified_partners');
  const canDataExport = hasModulePermission(adminUser, 'data_export');
  const canChangePassword = hasModulePermission(adminUser, 'change_password') || true;

  const roleBadge = getRoleBadgeStyle(adminUser?.role || 'ADMIN');

  const handleSwitchToLive = async () => {
    setSwitchingToLive(true);
    try {
      const res = await api.switchToLiveMode();
      if (res.success) {
        window.location.reload();
      } else {
        exitDemoMode();
        navigate('/login');
      }
    } catch {
      exitDemoMode();
      navigate('/login');
    } finally {
      setSwitchingToLive(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_is_demo');
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="admin-app-layout">
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={closeMobileMenu}
          aria-label="Close Navigation"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-badge">A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="brand-title">ACRES BAZAAR</div>
            <div className="brand-sub">Admin Executive Portal</div>
          </div>
          <button 
            type="button" 
            className="sidebar-close-btn"
            onClick={closeMobileMenu}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Core Management</div>
          
          {/* Dashboard */}
          {canDashboard && (
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
          )}

          {/* Customers Group */}
          {canCustomersGroup && (
            <div>
              <button 
                type="button"
                className={`nav-link ${isCustomersActive ? 'active' : ''}`}
                onClick={() => setCustomersOpen(!customersOpen)}
              >
                <Users size={18} />
                <span style={{ flex: 1 }}>Customers</span>
                {customersOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              {customersOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                  {(canBuyers || canSellers || canDealers || canCommonPeople) && (
                    <NavLink to="/customers?tab=all" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=all') || (isActive && !location.search.includes('tab=')) ? 'active' : ''}`} onClick={closeMobileMenu}>All Users & Registrations</NavLink>
                  )}
                  {canStaffManagement && (
                    <NavLink to="/staff-management" className={({ isActive }) => `nav-link nav-link-sub ${location.pathname.startsWith('/staff-management') || location.search.includes('tab=admins') ? 'active' : ''}`} onClick={closeMobileMenu}>Administrators & Staff</NavLink>
                  )}
                  {canBuyers && (
                    <NavLink to="/customers?tab=buyers" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=buyers') ? 'active' : ''}`} onClick={closeMobileMenu}>Buyers</NavLink>
                  )}
                  {canSellers && (
                    <NavLink to="/customers?tab=sellers" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=sellers') ? 'active' : ''}`} onClick={closeMobileMenu}>Sellers</NavLink>
                  )}
                  {canDealers && (
                    <NavLink to="/customers?tab=dealers" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=dealers') ? 'active' : ''}`} onClick={closeMobileMenu}>Dealers</NavLink>
                  )}
                  {canCommonPeople && (
                    <NavLink to="/customers?tab=common" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=common') ? 'active' : ''}`} onClick={closeMobileMenu}>Community Partners</NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Properties Group */}
          {canPropertiesGroup && (
            <div>
              <button 
                type="button" 
                className={`nav-link ${isPropertiesActive ? 'active' : ''}`}
                onClick={() => setPropertiesOpen(!propertiesOpen)}
              >
                <Building2 size={18} />
                <span style={{ flex: 1 }}>Properties</span>
                {propertiesOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              {propertiesOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                  {canProperties && (
                    <>
                      <NavLink to="/properties?status=ALL" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('ALL') || (isActive && !location.search.includes('PENDING') && !location.search.includes('APPROVED') && !location.search.includes('HOLD') && !location.search.includes('POSTED') && !location.search.includes('REJECTED')) ? 'active' : ''}`} onClick={closeMobileMenu}>All Properties</NavLink>
                      <NavLink to="/properties?status=PENDING" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('PENDING') ? 'active' : ''}`} onClick={closeMobileMenu}>New Properties</NavLink>
                      <NavLink to="/properties?status=APPROVED" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('APPROVED') ? 'active' : ''}`} onClick={closeMobileMenu}>Approved Properties</NavLink>
                      <NavLink to="/properties?status=HOLD" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('HOLD') ? 'active' : ''}`} onClick={closeMobileMenu}>Hold Properties</NavLink>
                      <NavLink to="/properties?status=POSTED" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('POSTED') ? 'active' : ''}`} onClick={closeMobileMenu}>Posted Properties</NavLink>
                    </>
                  )}
                  {canSnapProps && (
                    <NavLink to="/snap-properties" className={({ isActive }) => `nav-link nav-link-sub ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>Common People Snaps</NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Booked Properties */}
          {canBookings && (
            <NavLink 
              to="/bookings" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <BookmarkCheck size={18} />
              <span>Booked Properties</span>
              <span className="badge" style={{ marginLeft: 'auto', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px' }}>
                DEALS
              </span>
            </NavLink>
          )}

          {/* Snap Properties */}
          {canSnapProps && (
            <NavLink 
              to="/snap-properties" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Camera size={18} />
              <span>Snap Properties</span>
              <span className="badge" style={{ marginLeft: 'auto', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px' }}>
                SPOTS
              </span>
            </NavLink>
          )}

          {/* Categories */}
          {canCategories && (
            <NavLink 
              to="/categories" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Tags size={18} />
              <span>Categories</span>
            </NavLink>
          )}

          {(canRewards || canReports || canCmsGroup || canPlans || canPartners || canDataExport || canStaffManagement) && (
            <div className="nav-section-title">Operations & Admin</div>
          )}

          {/* Staff & Admin Management */}
          {canStaffManagement && (
            <NavLink 
              to="/staff-management" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <UserCog size={18} />
              <span>Staff & Administrators</span>
              <span className="badge" style={{ marginLeft: 'auto', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px' }}>
                RBAC
              </span>
            </NavLink>
          )}

          {/* Rewards */}
          {canRewards && (
            <NavLink 
              to="/rewards" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Award size={18} />
              <span>Rewards</span>
            </NavLink>
          )}

          {/* Reports */}
          {canReports && (
            <NavLink 
              to="/reports" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <AlertCircle size={18} />
              <span>Reports</span>
            </NavLink>
          )}

          {/* Website Settings Group */}
          {canCmsGroup && (
            <div>
              <button 
                type="button"
                className={`nav-link ${isSettingsActive ? 'active' : ''}`}
                onClick={() => setSettingsOpen(!settingsOpen)}
              >
                <Settings size={18} />
                <span style={{ flex: 1 }}>CMS Pages & Settings</span>
                {settingsOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              {settingsOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
                  {canWebsiteSettings && (
                    <>
                      <NavLink to="/website-settings?group=home" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('home') ? 'active' : ''}`} onClick={closeMobileMenu}>Home Page CMS</NavLink>
                      <NavLink to="/website-settings?group=about" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('about') ? 'active' : ''}`} onClick={closeMobileMenu}>About Page CMS</NavLink>
                      <NavLink to="/website-settings?group=service" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('service') ? 'active' : ''}`} onClick={closeMobileMenu}>Services Page CMS</NavLink>
                    </>
                  )}
                  {canContactDetails && (
                    <NavLink to="/website-settings?group=contact" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('contact') ? 'active' : ''}`} onClick={closeMobileMenu}>Contact Page CMS</NavLink>
                  )}
                  {canLogoManagement && (
                    <NavLink to="/website-settings?group=logo" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('logo') ? 'active' : ''}`} onClick={closeMobileMenu}>Logo & Identity</NavLink>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Plan Management */}
          {canPlans && (
            <NavLink 
              to="/plan-management" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <CreditCard size={18} />
              <span>Plan Management</span>
            </NavLink>
          )}

          {/* Verified Partners */}
          {canPartners && (
            <NavLink 
              to="/verified-partners" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <ShieldCheck size={18} />
              <span>Dealers & Partners</span>
              <span className="badge" style={{ marginLeft: 'auto', background: 'rgba(212, 175, 55, 0.2)', color: '#e2c044', fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px' }}>
                HUB
              </span>
            </NavLink>
          )}

          {/* Data Export */}
          {canDataExport && (
            <NavLink 
              to="/data-export" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <Download size={18} />
              <span>Data Export</span>
            </NavLink>
          )}

          <div className="nav-section-title">Security & Session</div>

          {canChangePassword && (
            <NavLink 
              to="/change-password" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <KeyRound size={18} />
              <span>Change Password</span>
            </NavLink>
          )}

          <button 
            type="button" 
            className="nav-link" 
            onClick={handleLogout}
            style={{ color: '#f43f5e' }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-strip">
            <div className="user-avatar" style={{
              background: adminUser?.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : adminUser?.role === 'ADMIN' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontWeight: 700
            }}>
              {adminUser?.name ? adminUser.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adminUser?.name || 'Administrator'}
                </span>
                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: roleBadge.bg,
                  color: roleBadge.color,
                  border: roleBadge.border,
                  whiteSpace: 'nowrap'
                }}>
                  {roleBadge.label}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser?.email || 'admin@acresbazaar.com'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-wrapper">
        <header className="top-navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-icon mobile-menu-btn" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={20} />
            </button>
            <div className="page-title">
              <span>Executive Admin Control</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {isDemo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>
                  ⚡ Demo Mode (Sample Data)
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '11px', padding: '4px 10px', background: 'linear-gradient(135deg, #059669, #10b981)' }}
                  onClick={handleSwitchToLive}
                  disabled={switchingToLive}
                  title="Switch to Live Database (91 Properties, 87 Users)"
                >
                  <Database size={13} />
                  <span>{switchingToLive ? 'Connecting...' : 'Connect to Live Database'}</span>
                </button>
              </div>
            ) : backendOnline === false ? (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.35)', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>
                ⚠️ Backend Offline (Port 5001)
              </span>
            ) : (
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.35)', padding: '4px 10px', fontSize: '11px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                <span>Live Database Connected</span>
              </span>
            )}

            <button 
              className="btn btn-secondary btn-icon"
              title="Re-check Backend Connection"
              onClick={checkBackend}
            >
              <RefreshCw size={15} />
            </button>

            <button 
              className="btn btn-danger btn-sm"
              onClick={handleLogout}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Global Alert Bar for Demo Mode */}
        {isDemo && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.12))',
            borderBottom: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12.5px',
            color: '#fef3c7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
              <div>
                <strong>Notice:</strong> You are currently viewing <strong>Demo / Sample Preview Data</strong> (6 mock items).
                Your live database contains <strong>91 Real Properties</strong>, <strong>87 Users</strong>, and <strong>46 Bookings</strong>.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ padding: '6px 14px', fontSize: '12px', background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none' }}
              onClick={handleSwitchToLive}
              disabled={switchingToLive}
            >
              <Database size={14} />
              <span>{switchingToLive ? 'Switching...' : 'Switch to Live Database Mode'}</span>
            </button>
          </div>
        )}

        {/* Global Alert Bar for Offline Backend */}
        {!isDemo && backendOnline === false && (
          <div style={{
            background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.18), rgba(220, 38, 38, 0.12))',
            borderBottom: '1px solid rgba(239, 68, 68, 0.35)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12.5px',
            color: '#fee2e2'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <strong>Backend Server Disconnected (Port 5001):</strong> Live database queries cannot be fulfilled. Please start the backend using <code>run-backend.bat</code> or <code>run-all.bat</code>.
              </div>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 14px', fontSize: '12px' }}
              onClick={checkBackend}
            >
              <RefreshCw size={14} />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
