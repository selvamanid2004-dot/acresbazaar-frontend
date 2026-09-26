import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Eye, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  Calendar, 
  Shield,
  ShoppingBag,
  Building2,
  Briefcase,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { Customer } from '../types';
import { api } from '../services/api';

export const Customers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'all';

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [counts, setCounts] = useState({
    all: 0,
    admins: 0,
    buyers: 0,
    sellers: 0,
    dealers: 0,
    common: 0,
    newCust: 0
  });

  const refreshCounts = async () => {
    try {
      const all = await api.getCustomers();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      setCounts({
        all: all.length,
        admins: all.filter(c => c.role === 'ADMIN' || c.role === 'SUPER_ADMIN').length,
        buyers: all.filter(c => c.role === 'BUYER').length,
        sellers: all.filter(c => c.role === 'SELLER').length,
        dealers: all.filter(c => c.role === 'DEALER').length,
        common: all.filter(c => c.role === 'COMMON_PEOPLE').length,
        newCust: all.filter(c => new Date(c.createdAt) >= sevenDaysAgo).length,
      });
    } catch (err) {
      console.error('Failed to load customer counts', err);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      let role: string | undefined;
      let isNew: boolean | undefined;

      if (currentTab === 'new') isNew = true;
      if (currentTab === 'admins') role = 'ADMIN';
      if (currentTab === 'buyers') role = 'BUYER';
      if (currentTab === 'sellers') role = 'SELLER';
      if (currentTab === 'dealers') role = 'DEALER';
      if (currentTab === 'common') role = 'COMMON_PEOPLE';

      const data = await api.getCustomers({
        role,
        isNew,
        search: searchQuery || undefined,
      });
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    refreshCounts();
  }, [currentTab, searchQuery]);

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleToggleStatus = async (cust: Customer) => {
    const newStatus = cust.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.toggleCustomerStatus(cust.id, newStatus);
      await fetchCustomers();
      await refreshCounts();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration record?')) return;
    try {
      await api.deleteCustomer(id);
      await fetchCustomers();
      await refreshCounts();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    try {
      await api.updateCustomer(editingCustomer.id, {
        name: editingCustomer.name,
        email: editingCustomer.email,
        mobile: editingCustomer.mobile,
        role: editingCustomer.role,
        planType: editingCustomer.planType,
        agencyName: editingCustomer.agencyName,
      });
      setEditingCustomer(null);
      await fetchCustomers();
      await refreshCounts();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return {
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.25), rgba(245, 158, 11, 0.25))',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.6)',
          fontWeight: 700
        };
      case 'BUYER':
        return {
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          fontWeight: 600
        };
      case 'SELLER':
        return {
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          fontWeight: 600
        };
      case 'DEALER':
        return {
          background: 'rgba(168, 85, 247, 0.15)',
          color: '#c084fc',
          border: '1px solid rgba(168, 85, 247, 0.35)',
          fontWeight: 600
        };
      case 'COMMON_PEOPLE':
        return {
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          fontWeight: 600
        };
      default:
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#cbd5e1',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontWeight: 600
        };
    }
  };

  const formatRoleName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Administrator';
      case 'BUYER': return 'Buyer';
      case 'SELLER': return 'Seller';
      case 'DEALER': return 'Dealer';
      case 'COMMON_PEOPLE': return 'Common People';
      default: return role?.replace('_', ' ') || 'User';
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>User & Customer Registrations</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time directory of all registered Buyers, Sellers, Dealers, and Common People
          </p>
        </div>

        <div className="search-input-wrap">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, email, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Role Metric Cards */}
      <div className="dash-metric-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {/* Total */}
        <div 
          className={`dash-card ${currentTab === 'all' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'all' ? '1px solid var(--gold-primary)' : undefined }}
          onClick={() => handleTabChange('all')}
        >
          <div className="dash-card-info">
            <h3>Total Users</h3>
            <div className="metric-num">{counts.all}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(2, 132, 199, 0.12)', color: '#38bdf8' }}>
            <Users size={22} />
          </div>
        </div>

        {/* Administrators */}
        <div 
          className={`dash-card ${currentTab === 'admins' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'admins' ? '1px solid #fbbf24' : undefined }}
          onClick={() => handleTabChange('admins')}
        >
          <div className="dash-card-info">
            <h3>Administrators</h3>
            <div className="metric-num">{counts.admins}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Shield size={22} />
          </div>
        </div>

        {/* Buyers */}
        <div 
          className={`dash-card ${currentTab === 'buyers' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'buyers' ? '1px solid #3b82f6' : undefined }}
          onClick={() => handleTabChange('buyers')}
        >
          <div className="dash-card-info">
            <h3>Buyers</h3>
            <div className="metric-num">{counts.buyers}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Sellers */}
        <div 
          className={`dash-card ${currentTab === 'sellers' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'sellers' ? '1px solid #f59e0b' : undefined }}
          onClick={() => handleTabChange('sellers')}
        >
          <div className="dash-card-info">
            <h3>Sellers</h3>
            <div className="metric-num">{counts.sellers}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>
            <Building2 size={22} />
          </div>
        </div>

        {/* Dealers */}
        <div 
          className={`dash-card ${currentTab === 'dealers' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'dealers' ? '1px solid #a855f7' : undefined }}
          onClick={() => handleTabChange('dealers')}
        >
          <div className="dash-card-info">
            <h3>Dealers</h3>
            <div className="metric-num">{counts.dealers}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#c084fc' }}>
            <Briefcase size={22} />
          </div>
        </div>

        {/* Common People */}
        <div 
          className={`dash-card ${currentTab === 'common' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'common' ? '1px solid #10b981' : undefined }}
          onClick={() => handleTabChange('common')}
        >
          <div className="dash-card-info">
            <h3>Common People</h3>
            <div className="metric-num">{counts.common}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#34d399' }}>
            <HeartHandshake size={22} />
          </div>
        </div>
      </div>

      {/* Tabs with Count Badges */}
      <div className="tab-list" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${currentTab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabChange('all')}
        >
          All Registrations <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8, padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>{counts.all}</span>
        </button>
        <button
          className={`tab-btn ${currentTab === 'admins' ? 'active' : ''}`}
          onClick={() => handleTabChange('admins')}
        >
          Administrators <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8, padding: '2px 6px', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', borderRadius: '10px' }}>{counts.admins}</span>
        </button>
        <button
          className={`tab-btn ${currentTab === 'buyers' ? 'active' : ''}`}
          onClick={() => handleTabChange('buyers')}
        >
          Buyers <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8, padding: '2px 6px', background: 'rgba(59,130,246,0.2)', color: '#93c5fd', borderRadius: '10px' }}>{counts.buyers}</span>
        </button>
        <button
          className={`tab-btn ${currentTab === 'sellers' ? 'active' : ''}`}
          onClick={() => handleTabChange('sellers')}
        >
          Sellers <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8, padding: '2px 6px', background: 'rgba(245,158,11,0.2)', color: '#fcd34d', borderRadius: '10px' }}>{counts.sellers}</span>
        </button>
        <button
          className={`tab-btn ${currentTab === 'dealers' ? 'active' : ''}`}
          onClick={() => handleTabChange('dealers')}
        >
          Dealers <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8, padding: '2px 6px', background: 'rgba(168,85,247,0.2)', color: '#d8b4fe', borderRadius: '10px' }}>{counts.dealers}</span>
        </button>
        <button
          className={`tab-btn ${currentTab === 'common' ? 'active' : ''}`}
          onClick={() => handleTabChange('common')}
        >
          Common People <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8, padding: '2px 6px', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', borderRadius: '10px' }}>{counts.common}</span>
        </button>
        <button
          className={`tab-btn ${currentTab === 'new' ? 'active' : ''}`}
          onClick={() => handleTabChange('new')}
        >
          New (Last 7 Days) <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8, padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>{counts.newCust}</span>
        </button>
      </div>

      {/* Table */}
      <div className="panel">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer / User Info</th>
                <th>Category / Role</th>
                <th>Contact</th>
                <th>Plan Tier</th>
                <th>Properties</th>
                <th>Status</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading registered users...</td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.email}</div>
                    </td>
                    <td>
                      <span className="badge" style={getRoleBadgeStyle(c.role)}>
                        {formatRoleName(c.role)}
                      </span>
                      {c.agencyName && (
                        <div style={{ fontSize: '11px', color: 'var(--gold-primary)', marginTop: '3px', fontWeight: 500 }}>
                          {c.agencyName}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', color: '#e2e8f0' }}>{c.mobile || '—'}</div>
                    </td>
                    <td>
                      <span className={`badge ${c.planType === 'PLATINUM' ? 'badge-platinum' : c.planType === 'GOLD' ? 'badge-gold' : ''}`}>
                        {c.planType}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: c.propertiesCount ? '#fbbf24' : 'var(--text-muted)' }}>
                        {c.propertiesCount ? `${c.propertiesCount} Listed` : '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="View Details"
                          onClick={() => setSelectedCustomer(c)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Edit User"
                          onClick={() => setEditingCustomer(c)}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className={`btn btn-icon ${c.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'}`}
                          title={c.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User'}
                          onClick={() => handleToggleStatus(c)}
                        >
                          {c.status === 'ACTIVE' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Delete Record"
                          style={{ color: 'var(--rose)' }}
                          onClick={() => handleDelete(c.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Users size={36} className="empty-state-icon" />
                      <h4>No registrations found</h4>
                      <p style={{ fontSize: '13px' }}>
                        {currentTab === 'all'
                          ? 'Registered users across Buyers, Sellers, Dealers, and Common People will appear here.'
                          : `No registered users found under "${currentTab.toUpperCase()}".`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Customer Details Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>User Profile & Registration Details</span>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setSelectedCustomer(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginTop: '3px' }}>{selectedCustomer.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Category / Role</div>
                  <div style={{ marginTop: '3px' }}>
                    <span className="badge" style={getRoleBadgeStyle(selectedCustomer.role)}>
                      {formatRoleName(selectedCustomer.role)}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</div>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '3px' }}>{selectedCustomer.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Number</div>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '3px' }}>{selectedCustomer.mobile || 'Not provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Access Plan Tier</div>
                  <div style={{ marginTop: '3px' }}>
                    <span className={`badge ${selectedCustomer.planType === 'PLATINUM' ? 'badge-platinum' : selectedCustomer.planType === 'GOLD' ? 'badge-gold' : ''}`}>
                      {selectedCustomer.planType}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</div>
                  <div style={{ marginTop: '3px' }}>
                    <span className={`badge ${selectedCustomer.status === 'ACTIVE' ? 'badge-active' : 'badge-inactive'}`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Agency / Organization</div>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '3px' }}>{selectedCustomer.agencyName || 'Individual (None)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Properties</div>
                  <div style={{ fontSize: '14px', color: selectedCustomer.propertiesCount ? 'var(--gold-primary)' : '#fff', marginTop: '3px', fontWeight: 600 }}>
                    {selectedCustomer.propertiesCount || 0} Properties
                  </div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registration Timestamp</div>
                  <div style={{ fontSize: '13.5px', color: '#cbd5e1', marginTop: '3px' }}>
                    {new Date(selectedCustomer.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'medium' })}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="modal-overlay" onClick={() => setEditingCustomer(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>Edit Registration Details</div>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditingCustomer(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingCustomer.mobile || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, mobile: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Category / Role</label>
                    <select
                      className="form-control"
                      value={editingCustomer.role}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, role: e.target.value as any })}
                    >
                      <option value="BUYER">Buyer</option>
                      <option value="SELLER">Seller</option>
                      <option value="DEALER">Dealer</option>
                      <option value="COMMON_PEOPLE">Common People</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Plan Tier</label>
                    <select
                      className="form-control"
                      value={editingCustomer.planType}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, planType: e.target.value as any })}
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="GOLD">Gold Plan</option>
                      <option value="PLATINUM">Platinum Plan</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Agency / Brokerage Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Optional for dealers/agencies"
                    value={editingCustomer.agencyName || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, agencyName: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingCustomer(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

