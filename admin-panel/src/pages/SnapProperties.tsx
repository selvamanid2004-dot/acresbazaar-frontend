import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Camera, 
  Search, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  Trash2, 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Tag, 
  ExternalLink,
  User,
  ZoomIn,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Property, Category } from '../types';
import { api } from '../services/api';

export const SnapProperties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('status') || 'ALL';

  const [snaps, setSnaps] = useState<Property[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [viewSnap, setViewSnap] = useState<Property | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [approvalSnap, setApprovalSnap] = useState<Property | null>(null);
  const [selectedApprovalTier, setSelectedApprovalTier] = useState<'GOLD' | 'PLATINUM'>('GOLD');
  const [approving, setApproving] = useState(false);

  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    hold: 0,
    rejected: 0,
  });

  const fetchSnaps = async () => {
    setLoading(true);
    try {
      const statusParam = currentTab === 'ALL' ? undefined : currentTab;
      const data = await api.getSnapProperties({
        status: statusParam,
        search: searchQuery || undefined,
      });
      setSnaps(data);
    } catch (err) {
      console.error('Failed to load snap properties', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCounts = async () => {
    try {
      const all = await api.getSnapProperties();
      setCounts({
        all: all.length,
        pending: all.filter(s => s.status === 'PENDING').length,
        approved: all.filter(s => s.status === 'APPROVED').length,
        hold: all.filter(s => s.status === 'HOLD').length,
        rejected: all.filter(s => s.status === 'REJECTED').length,
      });
    } catch (err) {
      console.error('Failed to load snap counts', err);
    }
  };

  useEffect(() => {
    fetchSnaps();
    refreshCounts();
  }, [currentTab, searchQuery]);

  const handleTabChange = (status: string) => {
    setSearchParams({ status });
  };

  const handleConfirmApproval = async () => {
    if (!approvalSnap) return;
    setApproving(true);
    try {
      await api.updatePropertyStatus(approvalSnap.id, 'APPROVED', selectedApprovalTier);
      setApprovalSnap(null);
      if (viewSnap && viewSnap.id === approvalSnap.id) {
        setViewSnap(null);
      }
      await fetchSnaps();
      await refreshCounts();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setApproving(false);
    }
  };

  const handleQuickStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'HOLD') => {
    try {
      await api.updatePropertyStatus(id, status);
      await fetchSnaps();
      await refreshCounts();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this snap property record?')) return;
    try {
      await api.deleteProperty(id);
      await fetchSnaps();
      await refreshCounts();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Common People — Snap Properties</h2>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              LIVE SPOTS
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
            TO-LET boards and sale signboards captured by verified public spotters with GPS location
          </p>
        </div>

        <div className="search-input-wrap">
          <Search size={16} className="search-input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by title, location, phone, spotter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Metric Cards */}
      <div className="dash-metric-grid" style={{ marginBottom: '24px' }}>
        <div 
          className={`dash-card ${currentTab === 'ALL' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'ALL' ? '1px solid var(--gold-primary)' : undefined }}
          onClick={() => handleTabChange('ALL')}
        >
          <div className="dash-card-info">
            <h3>Total Snaps</h3>
            <div className="metric-num">{counts.all}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(2, 132, 199, 0.12)', color: '#38bdf8' }}>
            <Camera size={22} />
          </div>
        </div>

        <div 
          className={`dash-card ${currentTab === 'PENDING' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'PENDING' ? '1px solid #f59e0b' : undefined }}
          onClick={() => handleTabChange('PENDING')}
        >
          <div className="dash-card-info">
            <h3>Pending Review</h3>
            <div className="metric-num" style={{ color: '#fbbf24' }}>{counts.pending}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}>
            <Sparkles size={22} />
          </div>
        </div>

        <div 
          className={`dash-card ${currentTab === 'APPROVED' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'APPROVED' ? '1px solid #10b981' : undefined }}
          onClick={() => handleTabChange('APPROVED')}
        >
          <div className="dash-card-info">
            <h3>Approved</h3>
            <div className="metric-num" style={{ color: '#34d399' }}>{counts.approved}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div 
          className={`dash-card ${currentTab === 'HOLD' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'HOLD' ? '1px solid #a855f7' : undefined }}
          onClick={() => handleTabChange('HOLD')}
        >
          <div className="dash-card-info">
            <h3>On Hold</h3>
            <div className="metric-num" style={{ color: '#c084fc' }}>{counts.hold}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.12)', color: '#c084fc' }}>
            <PauseCircle size={22} />
          </div>
        </div>

        <div 
          className={`dash-card ${currentTab === 'REJECTED' ? 'active-card' : ''}`}
          style={{ cursor: 'pointer', border: currentTab === 'REJECTED' ? '1px solid #f43f5e' : undefined }}
          onClick={() => handleTabChange('REJECTED')}
        >
          <div className="dash-card-info">
            <h3>Rejected</h3>
            <div className="metric-num" style={{ color: '#fb7185' }}>{counts.rejected}</div>
          </div>
          <div className="dash-card-icon" style={{ backgroundColor: 'rgba(244, 63, 94, 0.12)', color: '#fb7185' }}>
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list" style={{ marginBottom: '20px' }}>
        <button className={`tab-btn ${currentTab === 'ALL' ? 'active' : ''}`} onClick={() => handleTabChange('ALL')}>
          All Snapped Properties <span style={{ marginLeft: '6px', fontSize: '11px', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>{counts.all}</span>
        </button>
        <button className={`tab-btn ${currentTab === 'PENDING' ? 'active' : ''}`} onClick={() => handleTabChange('PENDING')}>
          Pending Review <span style={{ marginLeft: '6px', fontSize: '11px', padding: '2px 6px', background: 'rgba(245,158,11,0.2)', color: '#fcd34d', borderRadius: '10px' }}>{counts.pending}</span>
        </button>
        <button className={`tab-btn ${currentTab === 'APPROVED' ? 'active' : ''}`} onClick={() => handleTabChange('APPROVED')}>
          Approved <span style={{ marginLeft: '6px', fontSize: '11px', padding: '2px 6px', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', borderRadius: '10px' }}>{counts.approved}</span>
        </button>
        <button className={`tab-btn ${currentTab === 'HOLD' ? 'active' : ''}`} onClick={() => handleTabChange('HOLD')}>
          On Hold <span style={{ marginLeft: '6px', fontSize: '11px', padding: '2px 6px', background: 'rgba(168,85,247,0.2)', color: '#d8b4fe', borderRadius: '10px' }}>{counts.hold}</span>
        </button>
        <button className={`tab-btn ${currentTab === 'REJECTED' ? 'active' : ''}`} onClick={() => handleTabChange('REJECTED')}>
          Rejected <span style={{ marginLeft: '6px', fontSize: '11px', padding: '2px 6px', background: 'rgba(244,63,94,0.2)', color: '#fda4af', borderRadius: '10px' }}>{counts.rejected}</span>
        </button>
      </div>

      {/* Table */}
      <div className="panel">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '85px' }}>Board Photo</th>
                <th>Board / Property Info</th>
                <th>Contact On Board</th>
                <th>Spotted Location</th>
                <th>Spotter (Common Person)</th>
                <th>Status</th>
                <th>Date Spotted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading snap properties...</td>
                </tr>
              ) : snaps.length > 0 ? (
                snaps.map((p) => {
                  const coverImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400';
                  const boardType = p.categorySpecs?.boardType || 'TO-LET / RENT';
                  const boardContact = p.categorySpecs?.boardContact || p.sellerPhone || 'Not captured';
                  const landmark = p.categorySpecs?.landmark || '';
                  const gpsLat = p.categorySpecs?.gpsLat;
                  const gpsLng = p.categorySpecs?.gpsLng;

                  return (
                    <tr key={p.id}>
                      {/* Photo */}
                      <td>
                        <div 
                          style={{
                            width: '64px',
                            height: '52px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            position: 'relative',
                            cursor: 'pointer',
                            border: '1px solid var(--border-color)',
                            backgroundColor: '#1e293b'
                          }}
                          onClick={() => setPreviewImage(coverImg)}
                          title="Click to view full photo"
                        >
                          <img 
                            src={coverImg} 
                            alt={p.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                          >
                            <ZoomIn size={16} color="#fff" />
                          </div>
                        </div>
                      </td>

                      {/* Board Info */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <span className="badge" style={{
                            fontSize: '10px',
                            padding: '2px 6px',
                            background: boardType.includes('SALE') ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                            color: boardType.includes('SALE') ? '#60a5fa' : '#fbbf24',
                            border: boardType.includes('SALE') ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(245,158,11,0.3)'
                          }}>
                            {boardType}
                          </span>
                          <span className="badge" style={{ fontSize: '10px', padding: '2px 5px', background: 'rgba(255,255,255,0.06)' }}>
                            {p.category}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px' }}>{p.title}</div>
                        {p.priceDisplay && (
                          <div style={{ fontSize: '12px', color: 'var(--gold-primary)', fontWeight: 600, marginTop: '2px' }}>
                            {p.priceDisplay}
                          </div>
                        )}
                      </td>

                      {/* Contact on Board */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 600, fontSize: '13.5px' }}>
                          <Phone size={14} />
                          <span>{boardContact}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Number on Signboard
                        </div>
                      </td>

                      {/* Spotted Location */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#fff' }}>
                          <MapPin size={14} className="text-muted" />
                          <span>{p.location || p.city || '—'}</span>
                        </div>
                        {landmark && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Near: {landmark}
                          </div>
                        )}
                        {gpsLat && gpsLng && (
                          <a 
                            href={`https://www.google.com/maps?q=${gpsLat},${gpsLng}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontSize: '11px', color: '#60a5fa', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '3px' }}
                          >
                            <span>GPS: {Number(gpsLat).toFixed(4)}, {Number(gpsLng).toFixed(4)}</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </td>

                      {/* Spotter (Common Person) */}
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <User size={13} style={{ color: '#34d399' }} />
                          <span>{p.sellerName || 'Public Spotter'}</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {p.sellerPhone ? p.sellerPhone : p.sellerEmail}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${
                          p.status === 'APPROVED' ? 'badge-approved' : 
                          p.status === 'HOLD' ? 'badge-hold' : 
                          p.status === 'REJECTED' ? 'badge-rejected' : 'badge-pending'
                        }`}>
                          {p.status}
                        </span>
                        {p.status === 'APPROVED' && (
                          <div style={{ fontSize: '10.5px', color: 'var(--gold-primary)', marginTop: '2px', fontWeight: 600 }}>
                            {p.planType === 'PLATINUM' ? '★ Premium' : '★ Gold'}
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                        {new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-icon"
                            title="View Full Snap Details"
                            onClick={() => setViewSnap(p)}
                          >
                            <Eye size={15} />
                          </button>

                          {p.status !== 'APPROVED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              title="Approve Snap Property"
                              onClick={() => {
                                setApprovalSnap(p);
                                setSelectedApprovalTier('GOLD');
                              }}
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve</span>
                            </button>
                          )}

                          {p.status !== 'HOLD' && (
                            <button
                              className="btn btn-secondary btn-icon"
                              title="Put On Hold"
                              onClick={() => handleQuickStatus(p.id, 'HOLD')}
                            >
                              <PauseCircle size={15} />
                            </button>
                          )}

                          {p.status !== 'REJECTED' && (
                            <button
                              className="btn btn-secondary btn-icon"
                              title="Reject Snap"
                              style={{ color: 'var(--rose)' }}
                              onClick={() => handleQuickStatus(p.id, 'REJECTED')}
                            >
                              <XCircle size={15} />
                            </button>
                          )}

                          <button
                            className="btn btn-secondary btn-icon"
                            title="Delete Record"
                            style={{ color: 'var(--rose)' }}
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <Camera size={36} className="empty-state-icon" />
                      <h4>No snap properties found</h4>
                      <p style={{ fontSize: '13px' }}>
                        TO-LET boards and sale signboards snapped by Common People will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Modal */}
      {approvalSnap && (
        <div className="modal-overlay" onClick={() => setApprovalSnap(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--gold-primary)" />
                <span>Approve Snap Property</span>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setApprovalSnap(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Approve <strong style={{ color: '#fff' }}>{approvalSnap.title}</strong> and publish it to the public website under:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div
                  onClick={() => setSelectedApprovalTier('GOLD')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedApprovalTier === 'GOLD' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                    backgroundColor: selectedApprovalTier === 'GOLD' ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>🏆</div>
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '14px' }}>Gold Category</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Standard Featured Listing</div>
                </div>

                <div
                  onClick={() => setSelectedApprovalTier('PLATINUM')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: selectedApprovalTier === 'PLATINUM' ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                    backgroundColor: selectedApprovalTier === 'PLATINUM' ? 'rgba(56, 189, 248, 0.12)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>💎</div>
                  <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '14px' }}>Premium Category</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '4px' }}>Top VIP Showcase</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
                • Spotter: <strong style={{ color: '#fff' }}>{approvalSnap.sellerName || 'Common Person'}</strong><br/>
                • Contact on Board: <strong style={{ color: '#38bdf8' }}>{approvalSnap.categorySpecs?.boardContact || approvalSnap.sellerPhone || '—'}</strong>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setApprovalSnap(null)} disabled={approving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmApproval} disabled={approving}>
                {approving ? 'Approving...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Snap Details Modal */}
      {viewSnap && (
        <div className="modal-overlay" onClick={() => setViewSnap(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} color="#34d399" />
                <span>Snap Property Full Details</span>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setViewSnap(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Photo */}
              {viewSnap.images && viewSnap.images.length > 0 && (
                <div 
                  style={{ 
                    height: '240px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    marginBottom: '18px',
                    position: 'relative',
                    cursor: 'pointer',
                    backgroundColor: '#0f1422'
                  }}
                  onClick={() => setPreviewImage(viewSnap.images[0].url)}
                >
                  <img 
                    src={viewSnap.images[0].url} 
                    alt={viewSnap.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                  />
                  <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#fff' }}>
                    Click to view full image
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Property Title</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{viewSnap.title}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Signboard Type</div>
                  <div style={{ fontSize: '14px', color: '#fbbf24', fontWeight: 600, marginTop: '2px' }}>
                    {viewSnap.categorySpecs?.boardType || 'TO-LET / RENT'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Owner Contact On Board</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#38bdf8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} />
                    <span>{viewSnap.categorySpecs?.boardContact || viewSnap.sellerPhone || 'Not captured'}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Price / Rent</div>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '2px' }}>{viewSnap.priceDisplay || 'Not specified on board'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location / City</div>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '2px' }}>{viewSnap.location}, {viewSnap.city}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Landmark / Street</div>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '2px' }}>{viewSnap.categorySpecs?.landmark || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spotter Name</div>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '2px' }}>{viewSnap.sellerName || 'Public Spotter'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spotter Contact</div>
                  <div style={{ fontSize: '14px', color: '#fff', marginTop: '2px' }}>{viewSnap.sellerPhone || viewSnap.sellerEmail}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description / Notes</div>
                  <div style={{ fontSize: '13.5px', color: '#cbd5e1', marginTop: '4px', background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                    {viewSnap.description || 'No additional notes provided.'}
                  </div>
                </div>
                {viewSnap.categorySpecs?.gpsLat && viewSnap.categorySpecs?.gpsLng && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>GPS Coordinates</div>
                    <div style={{ marginTop: '4px' }}>
                      <a 
                        href={`https://www.google.com/maps?q=${viewSnap.categorySpecs.gpsLat},${viewSnap.categorySpecs.gpsLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <MapPin size={13} color="#f87171" />
                        <span>Open in Google Maps ({viewSnap.categorySpecs.gpsLat}, {viewSnap.categorySpecs.gpsLng})</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {viewSnap.status !== 'APPROVED' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setApprovalSnap(viewSnap);
                    setSelectedApprovalTier('GOLD');
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Approve & Categorize</span>
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setViewSnap(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)} style={{ zIndex: 1100 }}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', background: 'rgba(10,13,20,0.95)', border: 'none', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <button className="btn btn-secondary btn-icon" onClick={() => setPreviewImage(null)}>✕</button>
            </div>
            <img src={previewImage} alt="Preview" style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
        </div>
      )}
    </div>
  );
};
