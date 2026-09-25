import React, { useState } from 'react';
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
  Bell
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Submenu states
  const isCustomersActive = location.pathname.startsWith('/customers');
  const isPropertiesActive = location.pathname.startsWith('/properties');
  const isSettingsActive = location.pathname.startsWith('/website-settings');

  const [customersOpen, setCustomersOpen] = useState<boolean>(true);
  const [propertiesOpen, setPropertiesOpen] = useState<boolean>(true);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(isSettingsActive);

  let adminUser = { name: 'Master Administrator', email: 'admin@acresbazaar.com' };
  try {
    const adminUserStr = localStorage.getItem('admin_user');
    if (adminUserStr) adminUser = JSON.parse(adminUserStr);
  } catch {
    // fallback safely
  }

  const isDemo = localStorage.getItem('admin_is_demo') === 'true';

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
          
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          {/* Customers Group */}
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
                <NavLink to="/customers?tab=all" className={({ isActive }) => `nav-link nav-link-sub ${isActive && location.search.includes('tab=all') ? 'active' : ''}`} onClick={closeMobileMenu}>All Customers</NavLink>
                <NavLink to="/customers?tab=new" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=new') ? 'active' : ''}`} onClick={closeMobileMenu}>New Customers</NavLink>
                <NavLink to="/customers?tab=buyers" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=buyers') ? 'active' : ''}`} onClick={closeMobileMenu}>Buyers</NavLink>
                <NavLink to="/customers?tab=sellers" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=sellers') ? 'active' : ''}`} onClick={closeMobileMenu}>Sellers</NavLink>
                <NavLink to="/customers?tab=dealers" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=dealers') ? 'active' : ''}`} onClick={closeMobileMenu}>Dealers</NavLink>
                <NavLink to="/customers?tab=common" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('tab=common') ? 'active' : ''}`} onClick={closeMobileMenu}>Common People</NavLink>
              </div>
            )}
          </div>

          {/* Properties Group */}
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
                <NavLink to="/properties?status=PENDING" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('PENDING') ? 'active' : ''}`} onClick={closeMobileMenu}>New Properties</NavLink>
                <NavLink to="/properties?status=APPROVED" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('APPROVED') ? 'active' : ''}`} onClick={closeMobileMenu}>Approved Properties</NavLink>
                <NavLink to="/properties?status=HOLD" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('HOLD') ? 'active' : ''}`} onClick={closeMobileMenu}>Hold Properties</NavLink>
                <NavLink to="/properties?status=POSTED" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('POSTED') ? 'active' : ''}`} onClick={closeMobileMenu}>Posted Properties</NavLink>
                <NavLink to="/snap-properties" className={({ isActive }) => `nav-link nav-link-sub ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>Common People Snaps</NavLink>
              </div>
            )}
          </div>

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

          <NavLink 
            to="/categories" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Tags size={18} />
            <span>Categories</span>
          </NavLink>

          <div className="nav-section-title">Operations & Admin</div>

          <NavLink 
            to="/rewards" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Award size={18} />
            <span>Rewards</span>
          </NavLink>

          <NavLink 
            to="/reports" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <AlertCircle size={18} />
            <span>Reports</span>
          </NavLink>

          {/* Website Settings Group */}
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
                <NavLink to="/website-settings?group=home" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('home') ? 'active' : ''}`} onClick={closeMobileMenu}>Home Page CMS</NavLink>
                <NavLink to="/website-settings?group=about" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('about') ? 'active' : ''}`} onClick={closeMobileMenu}>About Page CMS</NavLink>
                <NavLink to="/website-settings?group=service" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('service') ? 'active' : ''}`} onClick={closeMobileMenu}>Services Page CMS</NavLink>
                <NavLink to="/website-settings?group=contact" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('contact') ? 'active' : ''}`} onClick={closeMobileMenu}>Contact Page CMS</NavLink>
                <NavLink to="/website-settings?group=logo" className={({ isActive }) => `nav-link nav-link-sub ${location.search.includes('logo') ? 'active' : ''}`} onClick={closeMobileMenu}>Logo & Identity</NavLink>
              </div>
            )}
          </div>

          <NavLink 
            to="/plan-management" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <CreditCard size={18} />
            <span>Plan Management</span>
          </NavLink>

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

          <NavLink 
            to="/data-export" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <Download size={18} />
            <span>Data Export</span>
          </NavLink>

          <div className="nav-section-title">Security & Session</div>

          <NavLink 
            to="/change-password" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={closeMobileMenu}
          >
            <KeyRound size={18} />
            <span>Change Password</span>
          </NavLink>

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
            <div className="user-avatar">AD</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminUser.email || 'admin@acresbazaar.com'}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isDemo ? (
              <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>
                ⚡ Demo Mode (Offline Preview)
              </span>
            ) : (
              <span className="badge badge-gold">Authorized Session</span>
            )}
            <button 
              className="btn btn-secondary btn-icon"
              title="Notifications"
            >
              <Bell size={18} />
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

        <main className="content-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
