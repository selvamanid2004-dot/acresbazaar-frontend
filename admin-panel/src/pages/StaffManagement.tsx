import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  KeyRound,
  Trash2,
  Power,
  RefreshCw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { api } from '../services/api';
import { AdminUser, ModulePermission } from '../types';
import { getCurrentAdminUser, getRoleBadgeStyle } from '../services/authUtils';

export const StaffManagement: React.FC = () => {
  const currentAdmin = getCurrentAdminUser();
  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

  const [staffList, setStaffList] = useState<AdminUser[]>([]);
  const [modulesList, setModulesList] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPassword, setFormPassword] = useState<string>('');
  const [formRole, setFormRole] = useState<'ADMIN' | 'STAFF' | 'SUPER_ADMIN'>('ADMIN');
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, modulesData] = await Promise.all([
        api.getStaff(),
        api.getModulePermissions(),
      ]);
      setStaffList(staffData);
      setModulesList(modulesData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load staff list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group modules logically
  const groupedModules = useMemo(() => {
    const groups: Record<string, ModulePermission[]> = {};
    modulesList.forEach(m => {
      const groupName = m.group || 'General Modules';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(m);
    });
    return groups;
  }, [modulesList]);

  // Filter staff records
  const filteredStaff = useMemo(() => {
    return staffList.filter(user => {
      if (selectedRoleFilter !== 'ALL' && user.role !== selectedRoleFilter) return false;
      if (selectedStatusFilter === 'ACTIVE' && user.isActive === false) return false;
      if (selectedStatusFilter === 'INACTIVE' && user.isActive !== false) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(q);
        const matchesEmail = user.email?.toLowerCase().includes(q);
        const matchesRole = user.role?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesRole) return false;
      }
      return true;
    });
  }, [staffList, selectedRoleFilter, selectedStatusFilter, searchQuery]);

  // Statistics counters
  const stats = useMemo(() => {
    return {
      total: staffList.length,
      active: staffList.filter(u => u.isActive !== false).length,
      superAdmins: staffList.filter(u => u.role === 'SUPER_ADMIN').length,
      admins: staffList.filter(u => u.role === 'ADMIN' || u.role === 'ADMINISTRATOR').length,
      staff: staffList.filter(u => u.role === 'STAFF').length,
    };
  }, [staffList]);

  // Handle Preset Permissions
  const applyPreset = (presetType: string) => {
    const allIds = modulesList.map(m => m.id);
    switch (presetType) {
      case 'ALL':
        setFormPermissions(allIds);
        break;
      case 'CLEAR':
        setFormPermissions([]);
        break;
      case 'ADMIN':
        setFormPermissions(allIds.filter(id => id !== 'staff_management'));
        break;
      case 'PROPERTIES':
        setFormPermissions(['dashboard', 'properties', 'gold_properties', 'premium_properties', 'snap_properties', 'bookings', 'categories']);
        break;
      case 'CUSTOMERS':
        setFormPermissions(['dashboard', 'buyers', 'sellers', 'dealers', 'common_people', 'verified_partners', 'reports']);
        break;
      case 'REPORTS':
        setFormPermissions(['reports', 'dashboard']);
        break;
      case 'CONTENT':
        setFormPermissions(['categories', 'website_settings', 'contact_details', 'logo_management']);
        break;
      default:
        break;
    }
  };

  const togglePermission = (permId: string) => {
    setFormPermissions(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const toggleGroupPermissions = (groupModules: ModulePermission[]) => {
    const groupIds = groupModules.map(m => m.id);
    const allSelected = groupIds.every(id => formPermissions.includes(id));
    if (allSelected) {
      setFormPermissions(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...formPermissions, ...groupIds]));
      setFormPermissions(merged);
    }
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('ADMIN');
    setFormPermissions(['dashboard', 'properties', 'buyers', 'sellers', 'reports']);
    setFormIsActive(true);
    setShowPassword(false);
    setIsCreateOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role as any);
    setFormPermissions(user.permissions || []);
    setFormIsActive(user.isActive !== false);
    setIsEditOpen(true);
  };

  // Open Password Modal
  const handleOpenPassword = (user: AdminUser) => {
    setSelectedUser(user);
    setFormPassword('');
    setShowPassword(false);
    setIsPasswordOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Submit Create User
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim() || !formPassword.trim()) {
      showToast('Please fill in username/email, name, and password', 'error');
      return;
    }
    if (formPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createStaff({
        email: formEmail.trim(),
        name: formName.trim(),
        password: formPassword,
        role: formRole,
        permissions: formRole === 'SUPER_ADMIN' ? modulesList.map(m => m.id) : formPermissions,
        isActive: formIsActive,
      });
      showToast(`User ${created.name} (${created.role}) created successfully!`);
      setIsCreateOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit User
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Name and username/email are required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.updateStaff(selectedUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        permissions: formRole === 'SUPER_ADMIN' ? modulesList.map(m => m.id) : formPermissions,
        isActive: formIsActive,
      });
      showToast(`Details and permissions for ${formName} updated!`);
      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Reset Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!formPassword || formPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.resetStaffPassword(selectedUser.id, formPassword);
      showToast(res.message || 'Password updated successfully!');
      setIsPasswordOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle User Active Status
  const handleToggleStatus = async (user: AdminUser) => {
    try {
      const updated = await api.toggleStaffStatus(user.id);
      showToast(`Account for ${user.name} is now ${updated.isActive ? 'Active' : 'Disabled'}`);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to change status', 'error');
    }
  };

  // Confirm Delete User
  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await api.deleteStaff(selectedUser.id);
      showToast(res.message || 'Account removed successfully');
      setIsDeleteOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pass);
    setShowPassword(true);
  };

  return (
    <div className="admin-page-container" style={{ paddingBottom: '60px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            padding: '14px 22px',
            borderRadius: '10px',
            background: toastMessage.type === 'success' ? 'linear-gradient(135deg, #065f46, #047857)' : 'linear-gradient(135deg, #991b1b, #b91c1c)',
            color: '#fff',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 500,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#fff' }}>
                Administrator & Staff Management
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Create, configure, and manage executive administrators and staff with granular module permissions
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadData}
            title="Refresh List"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenCreate}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              padding: '10px 18px'
            }}
          >
            <UserPlus size={17} />
            <span>Create Administrator / Staff</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="dash-card">
          <div className="dash-card-header">
            <span className="card-title">Total Admin Accounts</span>
            <Users size={18} color="#60a5fa" />
          </div>
          <div className="metric-num" style={{ color: '#fff' }}>{stats.total}</div>
          <div className="metric-desc">Registered access accounts</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="card-title">Active Accounts</span>
            <UserCheck size={18} color="#34d399" />
          </div>
          <div className="metric-num" style={{ color: '#34d399' }}>{stats.active}</div>
          <div className="metric-desc">Can log in & access assigned modules</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="card-title">Super Admins</span>
            <Sparkles size={18} color="#fbbf24" />
          </div>
          <div className="metric-num" style={{ color: '#fbbf24' }}>{stats.superAdmins}</div>
          <div className="metric-desc">Full unrestricted portal access</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="card-title">Administrators</span>
            <ShieldCheck size={18} color="#60a5fa" />
          </div>
          <div className="metric-num" style={{ color: '#60a5fa' }}>{stats.admins}</div>
          <div className="metric-desc">Assigned operational modules</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span className="card-title">Staff Members</span>
            <Layers size={18} color="#a78bfa" />
          </div>
          <div className="metric-num" style={{ color: '#a78bfa' }}>{stats.staff}</div>
          <div className="metric-desc">Assigned task-specific modules</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-filter-bar" style={{
        background: 'var(--card-bg, #111827)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search by name, email, username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Role:</span>
            <select
              className="input"
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              style={{ width: '150px', padding: '6px 10px', fontSize: '13px' }}
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Administrator</option>
              <option value="STAFF">Staff</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Status:</span>
            <select
              className="input"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{ width: '130px', padding: '6px 10px', fontSize: '13px' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="table-responsive" style={{
        background: 'var(--card-bg, #111827)',
        borderRadius: '12px',
        border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
        overflow: 'hidden'
      }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))' }}>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>User / Identity</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Assigned Modules</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Created</th>
              <th style={{ textAlign: 'right', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px', display: 'block' }} />
                  <span>Loading Administrator & Staff accounts...</span>
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '50px 20px' }}>
                  <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>No users match your criteria</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Try adjusting your search query or filters.</div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
                    <UserPlus size={14} />
                    <span>Create New Administrator</span>
                  </button>
                </td>
              </tr>
            ) : (
              filteredStaff.map(user => {
                const badge = getRoleBadgeStyle(user.role);
                const isCurrentSelf = currentAdmin?.id === user.id || currentAdmin?.email === user.email;
                const permissions = user.permissions || [];
                const isUserSuperAdmin = user.role === 'SUPER_ADMIN';

                return (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.06))',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    {/* User info */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          background: isUserSuperAdmin ? 'linear-gradient(135deg, #f59e0b, #d97706)' : user.role === 'ADMIN' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'linear-gradient(135deg, #10b981, #059669)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '13px'
                        }}>
                          {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{user.name}</span>
                            {isCurrentSelf && (
                              <span style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '1px 6px', borderRadius: '4px' }}>
                                (You)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: badge.bg,
                        color: badge.color,
                        border: badge.border
                      }}>
                        {isUserSuperAdmin && <Sparkles size={13} />}
                        {user.role === 'ADMIN' && <ShieldCheck size={13} />}
                        {user.role === 'STAFF' && <Layers size={13} />}
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    {/* Assigned Modules */}
                    <td style={{ padding: '14px 16px', maxWidth: '380px' }}>
                      {isUserSuperAdmin ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            padding: '3px 9px',
                            borderRadius: '5px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            fontSize: '11.5px',
                            fontWeight: 600
                          }}>
                            ★ Full Access (All 21 Modules)
                          </span>
                        </div>
                      ) : permissions.length === 0 ? (
                        <span style={{ color: '#f87171', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={13} />
                          <span>No modules assigned</span>
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {permissions.slice(0, 4).map(permKey => {
                            const found = modulesList.find(m => m.id === permKey);
                            return (
                              <span
                                key={permKey}
                                style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  background: 'rgba(255, 255, 255, 0.07)',
                                  color: '#e2e8f0',
                                  fontSize: '11px',
                                  border: '1px solid rgba(255,255,255,0.08)'
                                }}
                              >
                                {found?.name || permKey}
                              </span>
                            );
                          })}
                          {permissions.length > 4 && (
                            <span
                              title={permissions.slice(4).map(p => modulesList.find(m => m.id === p)?.name || p).join(', ')}
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                background: 'rgba(59, 130, 246, 0.2)',
                                color: '#60a5fa',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'help'
                              }}
                            >
                              +{permissions.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      {user.isActive !== false ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: 'rgba(239, 68, 68, 0.15)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)'
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171' }} />
                          <span>Disabled</span>
                        </span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '14px 16px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'System Default'}
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {/* Edit button */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '6px 8px', fontSize: '12px' }}
                          title="Edit Details & Module Permissions"
                          onClick={() => handleOpenEdit(user)}
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Reset password */}
                        <button
                          type="button"
                          className="btn btn-secondary btn-icon"
                          style={{ padding: '6px 8px', fontSize: '12px' }}
                          title="Change / Reset Password"
                          onClick={() => handleOpenPassword(user)}
                        >
                          <KeyRound size={14} />
                        </button>

                        {/* Toggle active / disabled */}
                        {(!isUserSuperAdmin || !isCurrentSelf) && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            style={{
                              padding: '6px 8px',
                              fontSize: '12px',
                              color: user.isActive !== false ? '#f87171' : '#34d399'
                            }}
                            title={user.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                            onClick={() => handleToggleStatus(user)}
                          >
                            <Power size={14} />
                          </button>
                        )}

                        {/* Delete button (Super Admin protected) */}
                        {isSuperAdmin && !isCurrentSelf && (
                          <button
                            type="button"
                            className="btn btn-danger btn-icon"
                            style={{ padding: '6px 8px', fontSize: '12px' }}
                            title="Delete User"
                            onClick={() => handleOpenDelete(user)}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE USER MODAL */}
      {isCreateOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="modal-card" style={{
            background: 'var(--card-bg, #111827)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#fff' }}>Create Administrator / Staff</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Setup credentials and select permitted portal modules</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsCreateOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 140px)' }}>
                {/* Basic credentials grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
                      Full Name <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Rahul Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Username / Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
                      Username / Email <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. admin01 or rahul@acresbazaar.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#e2e8f0' }}>
                        Password <span style={{ color: '#f43f5e' }}>*</span>
                      </label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        style={{ fontSize: '11px', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Generate Strong
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input"
                        placeholder="Min. 6 characters"
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        required
                        style={{ width: '100%', paddingRight: '36px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
                      Role <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <select
                      className="input"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="ADMIN">Administrator</option>
                      <option value="STAFF">Staff</option>
                      {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin (Full Access)</option>}
                    </select>
                  </div>
                </div>

                {/* Account Status */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Account Status</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Allow this user to sign in immediately upon creation</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: formIsActive ? '#34d399' : '#f87171' }}>
                      {formIsActive ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {/* Module Permissions Section */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Module Access & Permissions</span>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          fontWeight: 600
                        }}>
                          {formRole === 'SUPER_ADMIN' ? 'All 21 Assigned' : `${formPermissions.length} of ${modulesList.length} Selected`}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Select the modules this user is permitted to view and manage in the Admin Panel
                      </div>
                    </div>

                    {/* Quick Presets */}
                    {formRole !== 'SUPER_ADMIN' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('ALL')}>
                          Select All
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('ADMIN')}>
                          All Except Staff Mgmt
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('PROPERTIES')}>
                          Property Manager
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('CUSTOMERS')}>
                          CRM & Buyers
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('REPORTS')}>
                          Reports Only
                        </button>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ color: '#f87171' }} onClick={() => applyPreset('CLEAR')}>
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>

                  {formRole === 'SUPER_ADMIN' ? (
                    <div style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: '#fbbf24',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <Sparkles size={20} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Super Admin Privilege:</strong> Super Admin has unrestricted, full access to all system modules, settings, and administrator management automatically.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Object.entries(groupedModules).map(([groupName, groupList]) => {
                        const groupSelectedCount = groupList.filter(m => formPermissions.includes(m.id)).length;
                        const isAllGroupSelected = groupSelectedCount === groupList.length;

                        return (
                          <div
                            key={groupName}
                            style={{
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                              background: 'rgba(255,255,255,0.02)',
                              overflow: 'hidden'
                            }}
                          >
                            {/* Group Header */}
                            <div style={{
                              padding: '10px 14px',
                              background: 'rgba(255,255,255,0.04)',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.02em' }}>
                                {groupName} ({groupSelectedCount}/{groupList.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleGroupPermissions(groupList)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: isAllGroupSelected ? '#f87171' : '#60a5fa',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                {isAllGroupSelected ? 'Deselect Group' : 'Select Group'}
                              </button>
                            </div>

                            {/* Group Items Grid */}
                            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                              {groupList.map(mod => {
                                const isChecked = formPermissions.includes(mod.id);
                                return (
                                  <label
                                    key={mod.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: '10px',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      background: isChecked ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                                      border: isChecked ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(255,255,255,0.04)',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => togglePermission(mod.id)}
                                      style={{ marginTop: '2px', accentColor: '#3b82f6', width: '16px', height: '16px' }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: isChecked ? '#93c5fd' : '#e2e8f0' }}>
                                        {mod.name}
                                      </div>
                                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.25, marginTop: '2px' }}>
                                        {mod.description}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '9px 22px' }}
                >
                  {submitting ? 'Creating User...' : 'Create Account & Assign Modules'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER & PERMISSIONS MODAL */}
      {isEditOpen && selectedUser && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="modal-card" style={{
            background: 'var(--card-bg, #111827)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
            width: '100%',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <Edit2 size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#fff' }}>Edit Details & Permissions</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Updating account for {selectedUser.name} ({selectedUser.email})</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsEditOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '24px', overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 140px)' }}>
                {/* Form fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>Full Name</label>
                    <input
                      type="text"
                      className="input"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>Username / Email</label>
                    <input
                      type="text"
                      className="input"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>Role</label>
                    <select
                      className="input"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as any)}
                      style={{ width: '100%' }}
                    >
                      <option value="ADMIN">Administrator</option>
                      <option value="STAFF">Staff</option>
                      {isSuperAdmin && <option value="SUPER_ADMIN">Super Admin (Full Access)</option>}
                    </select>
                  </div>
                </div>

                {/* Status toggle */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px'
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>Account Status</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Control portal login and API authorization for this user</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#3b82f6' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: formIsActive ? '#34d399' : '#f87171' }}>
                      {formIsActive ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                {/* Module Permissions Matrix */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Module Access & Permissions</span>
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#60a5fa',
                          fontWeight: 600
                        }}>
                          {formRole === 'SUPER_ADMIN' ? 'All 21 Assigned' : `${formPermissions.length} of ${modulesList.length} Selected`}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Changes take effect immediately upon saving
                      </div>
                    </div>

                    {formRole !== 'SUPER_ADMIN' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('ALL')}>Select All</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('ADMIN')}>Admin Default</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('PROPERTIES')}>Properties</button>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('CUSTOMERS')}>Customers</button>
                        <button type="button" className="btn btn-secondary btn-sm" style={{ color: '#f87171' }} onClick={() => applyPreset('CLEAR')}>Clear All</button>
                      </div>
                    )}
                  </div>

                  {formRole === 'SUPER_ADMIN' ? (
                    <div style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      color: '#fbbf24',
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <Sparkles size={20} style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Super Admin:</strong> Unrestricted access across all modules.
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Object.entries(groupedModules).map(([groupName, groupList]) => {
                        const groupSelectedCount = groupList.filter(m => formPermissions.includes(m.id)).length;
                        const isAllGroupSelected = groupSelectedCount === groupList.length;

                        return (
                          <div
                            key={groupName}
                            style={{
                              borderRadius: '10px',
                              border: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                              background: 'rgba(255,255,255,0.02)',
                              overflow: 'hidden'
                            }}
                          >
                            <div style={{
                              padding: '10px 14px',
                              background: 'rgba(255,255,255,0.04)',
                              borderBottom: '1px solid rgba(255,255,255,0.06)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#e2e8f0' }}>
                                {groupName} ({groupSelectedCount}/{groupList.length})
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleGroupPermissions(groupList)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: isAllGroupSelected ? '#f87171' : '#60a5fa',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                {isAllGroupSelected ? 'Deselect Group' : 'Select Group'}
                              </button>
                            </div>

                            <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px' }}>
                              {groupList.map(mod => {
                                const isChecked = formPermissions.includes(mod.id);
                                return (
                                  <label
                                    key={mod.id}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      gap: '10px',
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      background: isChecked ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                                      border: isChecked ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(255,255,255,0.04)',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => togglePermission(mod.id)}
                                      style={{ marginTop: '2px', accentColor: '#3b82f6', width: '16px', height: '16px' }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: isChecked ? '#93c5fd' : '#e2e8f0' }}>
                                        {mod.name}
                                      </div>
                                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.25, marginTop: '2px' }}>
                                        {mod.description}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '9px 22px' }}
                >
                  {submitting ? 'Saving Changes...' : 'Save Updated Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isPasswordOpen && selectedUser && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="modal-card" style={{
            background: 'var(--card-bg, #111827)',
            borderRadius: '16px',
            border: '1px solid var(--border-color, rgba(255,255,255,0.12))',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <KeyRound size={17} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#fff' }}>Reset Account Password</h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>For {selectedUser.name} ({selectedUser.email})</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsPasswordOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#e2e8f0' }}>New Password</label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      style={{ fontSize: '11px', color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Generate Strong
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="Enter new password (min. 6 chars)"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                      style={{ width: '100%', paddingRight: '36px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
                  The user can immediately log in with this new password.
                </div>
              </div>

              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid var(--border-color, rgba(255,255,255,0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                background: 'rgba(255,255,255,0.02)'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPasswordOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {isDeleteOpen && selectedUser && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div className="modal-card" style={{
            background: 'var(--card-bg, #111827)',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)'
          }}>
            <div style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Delete User Account?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
                Are you sure you want to permanently delete <strong>{selectedUser.name}</strong> ({selectedUser.email})?
                This action cannot be undone.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
