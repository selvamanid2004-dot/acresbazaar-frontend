import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Edit3,
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
  UserCheck,
  Building2,
  UserCog,
  FileSpreadsheet,
  Settings,
  Sliders,
  CheckSquare,
  Square,
  HelpCircle,
  Shield,
  Zap,
  ArrowRight,
  BadgeCheck,
  LockKeyhole
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
  const [activeFormTab, setActiveFormTab] = useState<'DETAILS' | 'PERMISSIONS'>('DETAILS');

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

  // Group modules logically with category metadata
  const groupedModules = useMemo(() => {
    const groups: Record<string, { icon: any; color: string; items: ModulePermission[] }> = {};

    const getGroupMeta = (name: string) => {
      if (name.includes('Property')) return { icon: Building2, color: '#3b82f6' };
      if (name.includes('Customer') || name.includes('User')) return { icon: Users, color: '#10b981' };
      if (name.includes('Communication') || name.includes('Chat')) return { icon: Zap, color: '#ec4899' };
      if (name.includes('Platform') || name.includes('Setting')) return { icon: Settings, color: '#f59e0b' };
      if (name.includes('Administration') || name.includes('Staff')) return { icon: ShieldCheck, color: '#8b5cf6' };
      return { icon: Layers, color: '#06b6d4' };
    };

    modulesList.forEach(m => {
      const groupName = m.group || 'General Management';
      if (!groups[groupName]) {
        const meta = getGroupMeta(groupName);
        groups[groupName] = { icon: meta.icon, color: meta.color, items: [] };
      }
      groups[groupName].items.push(m);
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
    setActiveFormTab('DETAILS');
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
    setActiveFormTab('DETAILS');
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
      showToast('Please enter full name, username/email, and password', 'error');
      setActiveFormTab('DETAILS');
      return;
    }
    if (formPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      setActiveFormTab('DETAILS');
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
      showToast(`Account for ${created.name} (${created.role}) created successfully!`);
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
      showToast(`Details and permissions for ${formName} updated successfully!`);
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

  // Calculate permission coverage
  const permPercentage = modulesList.length > 0
    ? Math.round((formPermissions.length / modulesList.length) * 100)
    : 0;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '8px 4px 60px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '28px',
            zIndex: 9999,
            padding: '14px 20px',
            borderRadius: '12px',
            background: toastMessage.type === 'success' ? 'linear-gradient(135deg, #064e3b, #047857)' : 'linear-gradient(135deg, #881337, #be123c)',
            border: toastMessage.type === 'success' ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(251, 113, 133, 0.4)',
            color: '#fff',
            boxShadow: '0 20px 35px -5px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={19} color="#34d399" /> : <AlertTriangle size={19} color="#f87171" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
        backdropFilter: 'blur(16px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '28px 32px',
        marginBottom: '28px',
        boxShadow: '0 10px 30px -5px rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 20px rgba(59, 130, 246, 0.35)',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Administrator & Staff Management
              </h1>
              <span style={{
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                fontSize: '11px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '20px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                RBAC Security
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#94a3b8' }}>
              Create and manage executive Administrators and Staff with granular module permissions
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadData}
            title="Refresh List"
            style={{
              borderRadius: '12px',
              padding: '11px 18px',
              fontSize: '13.5px',
              fontWeight: 600,
              gap: '8px'
            }}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '11px 22px',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <UserPlus size={18} />
            <span>Create Administrator / Staff</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Total Accounts */}
        <div style={{
          background: 'rgba(19, 27, 46, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#3b82f6' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Users
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff', margin: '4px 0 2px', letterSpacing: '-0.02em' }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Registered system users</div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}>
            <Users size={22} />
          </div>
        </div>

        {/* Active Accounts */}
        <div style={{
          background: 'rgba(19, 27, 46, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#10b981' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active Status
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', margin: '4px 0 2px', letterSpacing: '-0.02em' }}>
              {stats.active}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Authorized to sign in</div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399'
          }}>
            <UserCheck size={22} />
          </div>
        </div>

        {/* Super Admins */}
        <div style={{
          background: 'rgba(19, 27, 46, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#f59e0b' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Super Admins
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fbbf24', margin: '4px 0 2px', letterSpacing: '-0.02em' }}>
              {stats.superAdmins}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Full unrestricted access</div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24'
          }}>
            <Sparkles size={22} />
          </div>
        </div>

        {/* Administrators */}
        <div style={{
          background: 'rgba(19, 27, 46, 0.85)',
          backdropFilter: 'blur(12px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '20px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px -2px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: '#8b5cf6' }} />
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Admins & Staff
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#c084fc', margin: '4px 0 2px', letterSpacing: '-0.02em' }}>
              {stats.admins + stats.staff}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{stats.admins} Admins · {stats.staff} Staff</div>
          </div>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c084fc'
          }}>
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'rgba(19, 27, 46, 0.75)',
        backdropFilter: 'blur(12px)',
        padding: '16px 20px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '440px' }}>
          <Search size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '40px',
              paddingRight: searchQuery ? '36px' : '14px',
              borderRadius: '10px',
              height: '42px',
              fontSize: '13.5px'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Role Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role:</span>
            <select
              className="form-control"
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              style={{ width: '150px', height: '40px', padding: '6px 12px', fontSize: '13px', borderRadius: '10px' }}
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">👑 Super Admin</option>
              <option value="ADMIN">🛡️ Administrator</option>
              <option value="STAFF">⚡ Staff Member</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status:</span>
            <select
              className="form-control"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{ width: '130px', height: '40px', padding: '6px 12px', fontSize: '13px', borderRadius: '10px' }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">🟢 Active</option>
              <option value="INACTIVE">🔴 Disabled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div style={{
        background: 'rgba(19, 27, 46, 0.85)',
        backdropFilter: 'blur(12px)',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden'
      }}>
        <div className="table-responsive">
          <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 20, 34, 0.75)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '16px 20px', width: '280px' }}>User & Identity</th>
                <th style={{ padding: '16px 20px', width: '160px' }}>Role</th>
                <th style={{ padding: '16px 20px' }}>Module Access & Permissions</th>
                <th style={{ padding: '16px 20px', width: '120px' }}>Status</th>
                <th style={{ padding: '16px 20px', width: '130px' }}>Created</th>
                <th style={{ padding: '16px 20px', width: '170px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <RefreshCw size={28} className="spin" style={{ margin: '0 auto 12px', display: 'block', color: '#3b82f6' }} />
                    <span style={{ fontSize: '14px', color: '#94a3b8' }}>Loading Administrator & Staff accounts...</span>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                      color: '#64748b'
                    }}>
                      <Users size={32} />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                      No matching users found
                    </div>
                    <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '360px', margin: '0 auto 20px' }}>
                      {searchQuery || selectedRoleFilter !== 'ALL' || selectedStatusFilter !== 'ALL'
                        ? 'Try clearing your filters or search keywords.'
                        : 'Get started by creating your first administrator or staff member.'}
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleOpenCreate}
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '10px' }}
                    >
                      <UserPlus size={16} />
                      <span>Create Administrator</span>
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
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      {/* Identity */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: isUserSuperAdmin
                              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                              : user.role === 'ADMIN'
                                ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '14px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            flexShrink: 0
                          }}>
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {user.name}
                              </span>
                              {isCurrentSelf && (
                                <span style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  background: 'rgba(59, 130, 246, 0.2)',
                                  color: '#60a5fa',
                                  padding: '2px 7px',
                                  borderRadius: '6px',
                                  border: '1px solid rgba(59, 130, 246, 0.35)'
                                }}>
                                  You
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: badge.bg,
                          color: badge.color,
                          border: badge.border,
                          letterSpacing: '0.02em'
                        }}>
                          {isUserSuperAdmin && <Sparkles size={13} />}
                          {user.role === 'ADMIN' && <ShieldCheck size={13} />}
                          {user.role === 'STAFF' && <Layers size={13} />}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Module Permissions */}
                      <td style={{ padding: '16px 20px' }}>
                        {isUserSuperAdmin ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '4px 12px',
                            borderRadius: '8px',
                            background: 'rgba(245, 158, 11, 0.12)',
                            color: '#fbbf24',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            fontSize: '12px',
                            fontWeight: 700
                          }}>
                            <Sparkles size={13} />
                            <span>Master Access (All 21 Modules Active)</span>
                          </div>
                        ) : permissions.length === 0 ? (
                          <span style={{ color: '#f87171', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <AlertTriangle size={14} />
                            <span>No access granted</span>
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                            {permissions.slice(0, 3).map(permKey => {
                              const found = modulesList.find(m => m.id === permKey);
                              return (
                                <span
                                  key={permKey}
                                  style={{
                                    padding: '3px 9px',
                                    borderRadius: '6px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: '#e2e8f0',
                                    fontSize: '11.5px',
                                    fontWeight: 500,
                                    border: '1px solid rgba(255,255,255,0.08)'
                                  }}
                                >
                                  {found?.name || permKey}
                                </span>
                              );
                            })}
                            {permissions.length > 3 && (
                              <span
                                title={permissions.slice(3).map(p => modulesList.find(m => m.id === p)?.name || p).join(', ')}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  background: 'rgba(59, 130, 246, 0.18)',
                                  color: '#60a5fa',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  cursor: 'help',
                                  border: '1px solid rgba(59, 130, 246, 0.3)'
                                }}
                              >
                                +{permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px' }}>
                        {user.isActive !== false ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#34d399',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            background: 'rgba(239, 68, 68, 0.12)',
                            color: '#f87171',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171' }} />
                            <span>Disabled</span>
                          </span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: '#94a3b8' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'System'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Edit Details & Permissions */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              color: '#93c5fd',
                              border: '1px solid rgba(59, 130, 246, 0.25)',
                              background: 'rgba(59, 130, 246, 0.08)'
                            }}
                            title="Edit User & Permissions"
                            onClick={() => handleOpenEdit(user)}
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Reset Password */}
                          <button
                            type="button"
                            className="btn btn-secondary btn-icon"
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              color: '#fcd34d',
                              border: '1px solid rgba(245, 158, 11, 0.25)',
                              background: 'rgba(245, 158, 11, 0.08)'
                            }}
                            title="Change / Reset Password"
                            onClick={() => handleOpenPassword(user)}
                          >
                            <KeyRound size={15} />
                          </button>

                          {/* Toggle Active Status */}
                          {(!isUserSuperAdmin || !isCurrentSelf) && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-icon"
                              style={{
                                padding: '8px',
                                borderRadius: '8px',
                                color: user.isActive !== false ? '#f87171' : '#34d399',
                                border: user.isActive !== false ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                                background: user.isActive !== false ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)'
                              }}
                              title={user.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                              onClick={() => handleToggleStatus(user)}
                            >
                              <Power size={15} />
                            </button>
                          )}

                          {/* Delete Account (Super Admin only) */}
                          {isSuperAdmin && !isCurrentSelf && (
                            <button
                              type="button"
                              className="btn btn-danger btn-icon"
                              style={{
                                padding: '8px',
                                borderRadius: '8px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.3)'
                              }}
                              title="Delete Account"
                              onClick={() => handleOpenDelete(user)}
                            >
                              <Trash2 size={15} />
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
      </div>

      {/* ========================================================================= */}
      {/* 🚀 CREATE ADMINISTRATOR / STAFF MODAL (REDESIGNED PREMIUM UI)           */}
      {/* ========================================================================= */}
      {isCreateOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 16, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #131b2e 0%, #0d121f 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.12)',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 30px 70px -10px rgba(0,0,0,0.8), 0 0 50px rgba(59, 130, 246, 0.15)',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '22px 28px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 6px 18px rgba(59, 130, 246, 0.35)'
                }}>
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                    Create Administrator / Staff
                  </h3>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                    Setup login credentials, assign role privileges, and configure module permissions
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsCreateOpen(false)}
                style={{ borderRadius: '10px', padding: '8px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Step / Section Navigation Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '0 28px',
              background: 'rgba(15, 20, 34, 0.5)'
            }}>
              <button
                type="button"
                onClick={() => setActiveFormTab('DETAILS')}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeFormTab === 'DETAILS' ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeFormTab === 'DETAILS' ? '#60a5fa' : '#94a3b8',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: activeFormTab === 'DETAILS' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  color: activeFormTab === 'DETAILS' ? '#fff' : '#94a3b8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  1
                </span>
                <span>Account Credentials & Role</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('PERMISSIONS')}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeFormTab === 'PERMISSIONS' ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeFormTab === 'PERMISSIONS' ? '#60a5fa' : '#94a3b8',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: activeFormTab === 'PERMISSIONS' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                  color: activeFormTab === 'PERMISSIONS' ? '#fff' : '#94a3b8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  2
                </span>
                <span>Module Permissions Matrix</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: formRole === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: formRole === 'SUPER_ADMIN' ? '#fbbf24' : '#60a5fa',
                  fontWeight: 700
                }}>
                  {formRole === 'SUPER_ADMIN' ? 'All 21' : `${formPermissions.length}`}
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '28px', overflowY: 'auto', flex: 1, maxHeight: 'calc(92vh - 190px)' }}>
                {activeFormTab === 'DETAILS' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Role Selection Cards */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                        Select Account Role <span style={{ color: '#f43f5e' }}>*</span>
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        {/* Administrator */}
                        <div
                          onClick={() => setFormRole('ADMIN')}
                          style={{
                            padding: '16px',
                            borderRadius: '14px',
                            background: formRole === 'ADMIN' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.03)',
                            border: formRole === 'ADMIN' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700, fontSize: '14px' }}>
                              <ShieldCheck size={18} />
                              <span>Administrator</span>
                            </div>
                            <input
                              type="radio"
                              name="createRole"
                              checked={formRole === 'ADMIN'}
                              onChange={() => setFormRole('ADMIN')}
                              style={{ accentColor: '#3b82f6', width: '16px', height: '16px' }}
                            />
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                            Manage properties, CRM customers, reports, and assigned operations.
                          </div>
                        </div>

                        {/* Staff */}
                        <div
                          onClick={() => setFormRole('STAFF')}
                          style={{
                            padding: '16px',
                            borderRadius: '14px',
                            background: formRole === 'STAFF' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                            border: formRole === 'STAFF' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '14px' }}>
                              <Layers size={18} />
                              <span>Staff Member</span>
                            </div>
                            <input
                              type="radio"
                              name="createRole"
                              checked={formRole === 'STAFF'}
                              onChange={() => setFormRole('STAFF')}
                              style={{ accentColor: '#10b981', width: '16px', height: '16px' }}
                            />
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                            Assigned to task-specific modules such as inquiries, chats, and bookings.
                          </div>
                        </div>

                        {/* Super Admin */}
                        {isSuperAdmin && (
                          <div
                            onClick={() => setFormRole('SUPER_ADMIN')}
                            style={{
                              padding: '16px',
                              borderRadius: '14px',
                              background: formRole === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.03)',
                              border: formRole === 'SUPER_ADMIN' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 700, fontSize: '14px' }}>
                                <Sparkles size={18} />
                                <span>Super Admin</span>
                              </div>
                              <input
                                type="radio"
                                name="createRole"
                                checked={formRole === 'SUPER_ADMIN'}
                                onChange={() => setFormRole('SUPER_ADMIN')}
                                style={{ accentColor: '#f59e0b', width: '16px', height: '16px' }}
                              />
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.4 }}>
                              Master administrative access with unrestricted module & staff control.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Personal & Login Details Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                      {/* Full Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#e2e8f0' }}>
                          Full Name <span style={{ color: '#f43f5e' }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Rahul Sharma"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          required
                          style={{ height: '44px', borderRadius: '10px' }}
                        />
                      </div>

                      {/* Username / Email */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#e2e8f0' }}>
                          Username / Email <span style={{ color: '#f43f5e' }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. rahul@acresbazaar.com or admin_rahul"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          required
                          style={{ height: '44px', borderRadius: '10px' }}
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                          Password <span style={{ color: '#f43f5e' }}>*</span>
                        </label>
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#60a5fa',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.25)',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer'
                          }}
                        >
                          🎲 Auto-Generate Strong Password
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="Minimum 6 characters"
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          required
                          style={{ height: '44px', borderRadius: '10px', paddingRight: '42px', letterSpacing: showPassword ? 'normal' : '0.1em' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    {/* Account Status Toggle Card */}
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Immediate Sign-in Status</div>
                        <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                          Enable or disable login privileges for this account upon creation
                        </div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                          style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                        />
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: formIsActive ? '#34d399' : '#f87171' }}>
                          {formIsActive ? '🟢 Active' : '🔴 Disabled'}
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  /* PERMISSIONS MATRIX TAB */
                  <div>
                    {/* Header with Quick Presets */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                            Assigned Portal Modules
                          </div>
                          <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                            Choose exactly which sections and tools this user can view and manage
                          </div>
                        </div>

                        {/* Progress Badge */}
                        <div style={{
                          padding: '6px 14px',
                          borderRadius: '10px',
                          background: formRole === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          border: formRole === 'SUPER_ADMIN' ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: formRole === 'SUPER_ADMIN' ? '#fbbf24' : '#60a5fa' }}>
                            {formRole === 'SUPER_ADMIN' ? '21 / 21 Modules (100%)' : `${formPermissions.length} / ${modulesList.length} Modules (${permPercentage}%)`}
                          </span>
                        </div>
                      </div>

                      {/* Quick Templates Bar */}
                      {formRole !== 'SUPER_ADMIN' && (
                        <div style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginRight: '4px' }}>
                            ⚡ Quick Templates:
                          </span>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('ALL')} style={{ borderRadius: '8px' }}>
                            Select All (21)
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('ADMIN')} style={{ borderRadius: '8px' }}>
                            Admin Default (20)
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('PROPERTIES')} style={{ borderRadius: '8px' }}>
                            🏠 Property Specialist
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('CUSTOMERS')} style={{ borderRadius: '8px' }}>
                            👥 CRM & Leads
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('REPORTS')} style={{ borderRadius: '8px' }}>
                            📊 Analytics & Reports
                          </button>
                          <button type="button" className="btn btn-secondary btn-sm" style={{ color: '#f87171', borderRadius: '8px' }} onClick={() => applyPreset('CLEAR')}>
                            🧹 Clear All
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Permissions Accordions / Category Cards */}
                    {formRole === 'SUPER_ADMIN' ? (
                      <div style={{
                        padding: '24px',
                        borderRadius: '16px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#fbbf24',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <Sparkles size={32} style={{ flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>
                            Master Super Admin Privileges
                          </div>
                          <div style={{ fontSize: '13px', color: '#fde68a', lineHeight: 1.5 }}>
                            Super Admin accounts have full, unrestricted operational access to every single module, setting, financial data, and staff administration by default.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(groupedModules).map(([groupName, groupData]) => {
                          const groupSelectedCount = groupData.items.filter(m => formPermissions.includes(m.id)).length;
                          const isAllGroupSelected = groupSelectedCount === groupData.items.length;
                          const GroupIcon = groupData.icon;

                          return (
                            <div
                              key={groupName}
                              style={{
                                borderRadius: '14px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                overflow: 'hidden'
                              }}
                            >
                              {/* Category Header */}
                              <div style={{
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    background: `${groupData.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: groupData.color
                                  }}>
                                    <GroupIcon size={16} />
                                  </div>
                                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc' }}>
                                    {groupName}
                                  </span>
                                  <span style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    background: groupSelectedCount > 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.06)',
                                    color: groupSelectedCount > 0 ? '#60a5fa' : '#94a3b8'
                                  }}>
                                    {groupSelectedCount} of {groupData.items.length}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => toggleGroupPermissions(groupData.items)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: isAllGroupSelected ? '#f87171' : '#60a5fa',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  {isAllGroupSelected ? 'Deselect Category' : 'Select All in Category'}
                                </button>
                              </div>

                              {/* Category Modules Grid */}
                              <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
                                {groupData.items.map(mod => {
                                  const isChecked = formPermissions.includes(mod.id);
                                  return (
                                    <label
                                      key={mod.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        background: isChecked ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                        border: isChecked ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => togglePermission(mod.id)}
                                        style={{ marginTop: '2px', accentColor: '#3b82f6', width: '17px', height: '17px' }}
                                      />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: isChecked ? '#93c5fd' : '#e2e8f0' }}>
                                          {mod.name}
                                        </div>
                                        <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.3, marginTop: '2px' }}>
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
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '18px 28px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(15, 20, 34, 0.7)'
              }}>
                <div>
                  {activeFormTab === 'DETAILS' ? (
                    <button
                      type="button"
                      onClick={() => setActiveFormTab('PERMISSIONS')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f8fafc',
                        borderRadius: '10px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>Configure Permissions</span>
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveFormTab('DETAILS')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#f8fafc',
                        borderRadius: '10px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ← Back to Details
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={submitting}
                    style={{ borderRadius: '10px', padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    {submitting ? 'Creating User...' : 'Create Account & Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ✏️ EDIT USER & PERMISSIONS MODAL                                         */}
      {/* ========================================================================= */}
      {isEditOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 16, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #131b2e 0%, #0d121f 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.12)',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 30px 70px -10px rgba(0,0,0,0.8), 0 0 50px rgba(59, 130, 246, 0.15)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '22px 28px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 6px 18px rgba(59, 130, 246, 0.35)'
                }}>
                  <Edit3 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#f8fafc' }}>
                    Edit User & Permissions
                  </h3>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                    Updating account for <strong>{selectedUser.name}</strong> ({selectedUser.email})
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsEditOpen(false)}
                style={{ borderRadius: '10px', padding: '8px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '0 28px',
              background: 'rgba(15, 20, 34, 0.5)'
            }}>
              <button
                type="button"
                onClick={() => setActiveFormTab('DETAILS')}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeFormTab === 'DETAILS' ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeFormTab === 'DETAILS' ? '#60a5fa' : '#94a3b8',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Account Details & Role
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('PERMISSIONS')}
                style={{
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeFormTab === 'PERMISSIONS' ? '2px solid #3b82f6' : '2px solid transparent',
                  color: activeFormTab === 'PERMISSIONS' ? '#60a5fa' : '#94a3b8',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>Module Permissions</span>
                <span style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: formRole === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  color: formRole === 'SUPER_ADMIN' ? '#fbbf24' : '#60a5fa',
                  fontWeight: 700
                }}>
                  {formRole === 'SUPER_ADMIN' ? 'All 21' : `${formPermissions.length}`}
                </span>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '28px', overflowY: 'auto', flex: 1, maxHeight: 'calc(92vh - 190px)' }}>
                {activeFormTab === 'DETAILS' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Role Selection */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#f8fafc', marginBottom: '10px' }}>
                        Account Role
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        <div
                          onClick={() => setFormRole('ADMIN')}
                          style={{
                            padding: '16px',
                            borderRadius: '14px',
                            background: formRole === 'ADMIN' ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.03)',
                            border: formRole === 'ADMIN' ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: 700 }}>
                              <ShieldCheck size={18} />
                              <span>Administrator</span>
                            </div>
                            <input type="radio" checked={formRole === 'ADMIN'} onChange={() => setFormRole('ADMIN')} style={{ accentColor: '#3b82f6' }} />
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Standard Admin Operations</div>
                        </div>

                        <div
                          onClick={() => setFormRole('STAFF')}
                          style={{
                            padding: '16px',
                            borderRadius: '14px',
                            background: formRole === 'STAFF' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.03)',
                            border: formRole === 'STAFF' ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700 }}>
                              <Layers size={18} />
                              <span>Staff Member</span>
                            </div>
                            <input type="radio" checked={formRole === 'STAFF'} onChange={() => setFormRole('STAFF')} style={{ accentColor: '#10b981' }} />
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Task-specific modules</div>
                        </div>

                        {isSuperAdmin && (
                          <div
                            onClick={() => setFormRole('SUPER_ADMIN')}
                            style={{
                              padding: '16px',
                              borderRadius: '14px',
                              background: formRole === 'SUPER_ADMIN' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.03)',
                              border: formRole === 'SUPER_ADMIN' ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontWeight: 700 }}>
                                <Sparkles size={18} />
                                <span>Super Admin</span>
                              </div>
                              <input type="radio" checked={formRole === 'SUPER_ADMIN'} onChange={() => setFormRole('SUPER_ADMIN')} style={{ accentColor: '#f59e0b' }} />
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Master Full Access</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#e2e8f0' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          required
                          style={{ height: '44px', borderRadius: '10px' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#e2e8f0' }}>
                          Username / Email
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          required
                          style={{ height: '44px', borderRadius: '10px' }}
                        />
                      </div>
                    </div>

                    {/* Status toggle */}
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Account Access Status</div>
                        <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>
                          Toggle login authorization for this administrator
                        </div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formIsActive}
                          onChange={(e) => setFormIsActive(e.target.checked)}
                          style={{ width: '20px', height: '20px', accentColor: '#10b981' }}
                        />
                        <span style={{ fontSize: '13.5px', fontWeight: 700, color: formIsActive ? '#34d399' : '#f87171' }}>
                          {formIsActive ? '🟢 Active' : '🔴 Disabled'}
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  /* PERMISSIONS MATRIX IN EDIT */
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>Module Access Matrix</div>
                        <div style={{ fontSize: '12.5px', color: '#94a3b8', marginTop: '2px' }}>Changes take effect on their next action</div>
                      </div>

                      {formRole !== 'SUPER_ADMIN' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('ALL')} style={{ borderRadius: '8px' }}>Select All</button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('ADMIN')} style={{ borderRadius: '8px' }}>Admin Default</button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('PROPERTIES')} style={{ borderRadius: '8px' }}>Properties</button>
                          <button type="button" className="btn btn-secondary btn-sm" onClick={() => applyPreset('CUSTOMERS')} style={{ borderRadius: '8px' }}>Customers</button>
                          <button type="button" className="btn btn-secondary btn-sm" style={{ color: '#f87171', borderRadius: '8px' }} onClick={() => applyPreset('CLEAR')}>Clear All</button>
                        </div>
                      )}
                    </div>

                    {formRole === 'SUPER_ADMIN' ? (
                      <div style={{
                        padding: '24px',
                        borderRadius: '16px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        color: '#fbbf24'
                      }}>
                        <strong>Super Admin Privilege:</strong> Unrestricted access across all 21 modules.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {Object.entries(groupedModules).map(([groupName, groupData]) => {
                          const groupSelectedCount = groupData.items.filter(m => formPermissions.includes(m.id)).length;
                          const isAllGroupSelected = groupSelectedCount === groupData.items.length;
                          const GroupIcon = groupData.icon;

                          return (
                            <div
                              key={groupName}
                              style={{
                                borderRadius: '14px',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                background: 'rgba(255, 255, 255, 0.02)',
                                overflow: 'hidden'
                              }}
                            >
                              <div style={{
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${groupData.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: groupData.color }}>
                                    <GroupIcon size={16} />
                                  </div>
                                  <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#f8fafc' }}>{groupName}</span>
                                  <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                                    {groupSelectedCount} / {groupData.items.length}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleGroupPermissions(groupData.items)}
                                  style={{ background: 'none', border: 'none', color: isAllGroupSelected ? '#f87171' : '#60a5fa', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                                >
                                  {isAllGroupSelected ? 'Deselect Category' : 'Select All in Category'}
                                </button>
                              </div>

                              <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '10px' }}>
                                {groupData.items.map(mod => {
                                  const isChecked = formPermissions.includes(mod.id);
                                  return (
                                    <label
                                      key={mod.id}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '10px 12px',
                                        borderRadius: '10px',
                                        background: isChecked ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                        border: isChecked ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => togglePermission(mod.id)}
                                        style={{ marginTop: '2px', accentColor: '#3b82f6', width: '17px', height: '17px' }}
                                      />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: 700, color: isChecked ? '#93c5fd' : '#e2e8f0' }}>
                                          {mod.name}
                                        </div>
                                        <div style={{ fontSize: '11.5px', color: '#94a3b8', lineHeight: 1.3, marginTop: '2px' }}>
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
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '18px 28px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(15, 20, 34, 0.7)'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveFormTab(activeFormTab === 'DETAILS' ? 'PERMISSIONS' : 'DETAILS')}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f8fafc',
                    borderRadius: '10px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {activeFormTab === 'DETAILS' ? 'Configure Permissions →' : '← Back to Details'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditOpen(false)}
                    disabled={submitting}
                    style={{ borderRadius: '10px', padding: '10px 18px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 24px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    {submitting ? 'Saving Changes...' : 'Save Updated Permissions'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔑 RESET PASSWORD MODAL                                                  */}
      {/* ========================================================================= */}
      {isPasswordOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 16, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #131b2e 0%, #0d121f 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.12)',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 60px -10px rgba(0,0,0,0.8)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#f8fafc' }}>
                    Reset User Password
                  </h3>
                  <div style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                    For {selectedUser.name} ({selectedUser.email})
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-icon"
                onClick={() => setIsPasswordOpen(false)}
                style={{ borderRadius: '8px', padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>New Password</label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#60a5fa',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      Generate Strong
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter new password (min. 6 chars)"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      required
                      style={{ height: '44px', borderRadius: '10px', paddingRight: '42px', letterSpacing: showPassword ? 'normal' : '0.1em' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  💡 The user can immediately sign into the portal using this new password.
                </div>
              </div>

              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                background: 'rgba(15, 20, 34, 0.6)'
              }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPasswordOpen(false)}
                  disabled={submitting}
                  style={{ borderRadius: '10px', padding: '9px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '9px 22px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
                  }}
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🗑️ CONFIRM DELETE MODAL                                                   */}
      {/* ========================================================================= */}
      {isDeleteOpen && selectedUser && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 16, 0.82)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(145deg, #18131d 0%, #0f0d14 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 25px 60px -10px rgba(0,0,0,0.8), 0 0 40px rgba(239, 68, 68, 0.15)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '28px 24px', textAlign: 'center' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                <Trash2 size={26} />
              </div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                Delete User Account?
              </h3>
              <p style={{ fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 24px' }}>
                Are you sure you want to permanently delete <strong style={{ color: '#fff' }}>{selectedUser.name}</strong> ({selectedUser.email})?
                This administrator will lose all portal access immediately.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={submitting}
                  style={{ borderRadius: '10px', padding: '10px 20px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteSubmit}
                  disabled={submitting}
                  style={{ borderRadius: '10px', padding: '10px 22px', fontWeight: 700 }}
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
