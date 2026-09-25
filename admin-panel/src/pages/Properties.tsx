import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  Globe, 
  Trash2, 
  Eye, 
  Edit3, 
  MapPin, 
  DollarSign, 
  Layers, 
  ExternalLink,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Image as ImageIcon,
  ZoomIn,
  Tag,
  Check
} from 'lucide-react';
import { Property, Category } from '../types';
import { api } from '../services/api';

export const Properties: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'PENDING';

  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [viewProperty, setViewProperty] = useState<Property | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editProperty, setEditProperty] = useState<Property | null>(null);
  const [approvalProperty, setApprovalProperty] = useState<Property | null>(null);
  const [selectedApprovalTier, setSelectedApprovalTier] = useState<'GOLD' | 'PLATINUM'>('GOLD');
  const [approving, setApproving] = useState<boolean>(false);

  const formatSpecKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim();
  };

  const openApproveModal = (p: Property) => {
    setApprovalProperty(p);
    setSelectedApprovalTier(p.planType === 'PLATINUM' ? 'PLATINUM' : 'GOLD');
  };

  const handleConfirmApproval = async () => {
    if (!approvalProperty) return;
    setApproving(true);
    try {
      await api.updatePropertyStatus(approvalProperty.id, 'APPROVED', selectedApprovalTier);
      setApprovalProperty(null);
      if (viewProperty && viewProperty.id === approvalProperty.id) {
        setViewProperty(null);
      }
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setApproving(false);
    }
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      let statusQuery = statusParam;
      if (statusParam === 'POSTED') {
        // Posted means approved + published
        statusQuery = 'APPROVED';
      }

      const data = await api.getProperties({
        status: statusQuery,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      });

      if (statusParam === 'POSTED') {
        setProperties(data.filter((p) => p.isPublished));
      } else {
        setProperties(data);
      }
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [statusParam, selectedCategory, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HOLD') => {
    try {
      await api.updatePropertyStatus(id, newStatus);
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleTogglePublish = async (id: string, currentPublished: boolean) => {
    try {
      await api.togglePublishProperty(id, !currentPublished);
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Publish toggle failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this property?')) return;
    try {
      await api.deleteProperty(id);
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Delete failed');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProperty) return;
    try {
      await api.updateProperty(editProperty.id, {
        title: editProperty.title,
        category: editProperty.category,
        location: editProperty.location,
        price: Number(editProperty.price),
        planType: editProperty.planType,
        description: editProperty.description,
        address: editProperty.address,
        sellerContact: editProperty.sellerContact,
        bedrooms: editProperty.bedrooms ? Number(editProperty.bedrooms) : null,
        bathrooms: editProperty.bathrooms ? Number(editProperty.bathrooms) : null,
        areaSqFt: editProperty.areaSqFt ? Number(editProperty.areaSqFt) : null,
      });
      setEditProperty(null);
      fetchProperties();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const formatPrice = (p: number) => {
    if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
    if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lac`;
    return `₹${p.toLocaleString()}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Property Inventory Management</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Review incoming submissions, approve listings, and control public website publishing
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            className="form-control" 
            style={{ width: 'auto', minWidth: '160px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <div className="search-input-wrap">
            <Search size={16} className="search-input-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by title, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Sub-Navigation Tabs */}
      <div className="tab-list">
        <button
          className={`tab-btn ${statusParam === 'PENDING' ? 'active' : ''}`}
          onClick={() => setSearchParams({ status: 'PENDING' })}
        >
          New Properties (Pending Review)
        </button>
        <button
          className={`tab-btn ${statusParam === 'APPROVED' ? 'active' : ''}`}
          onClick={() => setSearchParams({ status: 'APPROVED' })}
        >
          Approved Properties
        </button>
        <button
          className={`tab-btn ${statusParam === 'HOLD' ? 'active' : ''}`}
          onClick={() => setSearchParams({ status: 'HOLD' })}
        >
          Hold Properties
        </button>
        <button
          className={`tab-btn ${statusParam === 'POSTED' ? 'active' : ''}`}
          onClick={() => setSearchParams({ status: 'POSTED' })}
        >
          Posted Properties (Live on Web)
        </button>
      </div>

      {/* Properties Table */}
      <div className="panel">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Category</th>
                <th>Location</th>
                <th>Price</th>
                <th>Submitted By</th>
                <th>Plan Tier</th>
                <th>Status</th>
                <th>Published</th>
                <th style={{ textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>Loading properties...</td>
                </tr>
              ) : properties.length > 0 ? (
                properties.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {p.images && p.images[0] ? (
                          <img 
                            src={p.images[0].url} 
                            alt={p.title} 
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <Building2 size={20} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            ID: {p.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        {p.category}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        <MapPin size={13} style={{ color: 'var(--gold-primary)' }} />
                        <span>{p.location}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gold-primary)' }}>
                        {p.priceDisplay || formatPrice(p.price)}
                      </div>
                      {p.priceDisplay && p.price > 0 && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                        {p.sellerName || (p.owner ? p.owner.name : 'Seller Submission')}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--gold-primary)', marginTop: '2px' }}>
                        {p.sellerPhone || (p.owner ? p.owner.mobile : 'Direct Portal')}
                      </div>
                      {p.sellerEmail && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {p.sellerEmail}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${p.planType === 'PLATINUM' ? 'badge-platinum' : p.planType === 'GOLD' ? 'badge-gold' : ''}`}>
                        {p.planType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        p.status === 'APPROVED' ? 'badge-approved' : 
                        p.status === 'PENDING' ? 'badge-pending' : 
                        p.status === 'HOLD' ? 'badge-hold' : 'badge-rejected'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${p.isPublished ? 'btn-success' : 'btn-secondary'}`}
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        title={p.isPublished ? 'Click to unpublish' : 'Click to publish on Public Website'}
                        onClick={() => handleTogglePublish(p.id, p.isPublished)}
                      >
                        <Globe size={12} />
                        <span>{p.isPublished ? 'Published' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="View Details & Documents"
                          onClick={() => setViewProperty(p)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Edit Property"
                          onClick={() => setEditProperty(p)}
                        >
                          <Edit3 size={14} />
                        </button>
                        {p.status !== 'APPROVED' ? (
                          <button
                            className="btn btn-success btn-icon"
                            title="Approve Property (Select Gold or Premium Category)"
                            onClick={() => openApproveModal(p)}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Change Category (Gold / Premium)"
                            style={{ color: p.planType === 'GOLD' ? '#D4AF37' : '#c084fc' }}
                            onClick={() => openApproveModal(p)}
                          >
                            <Layers size={14} />
                          </button>
                        )}
                        {p.status !== 'HOLD' && (
                          <button
                            className="btn btn-secondary btn-icon"
                            title="Place on Hold"
                            style={{ color: '#c084fc' }}
                            onClick={() => handleStatusChange(p.id, 'HOLD')}
                          >
                            <PauseCircle size={14} />
                          </button>
                        )}
                        {p.status !== 'REJECTED' && (
                          <button
                            className="btn btn-danger btn-icon"
                            title="Reject Property"
                            onClick={() => handleStatusChange(p.id, 'REJECTED')}
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Delete Property"
                          style={{ color: 'var(--rose)' }}
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <Building2 size={36} className="empty-state-icon" />
                      <h4>No properties found in this category/status</h4>
                      <p style={{ fontSize: '13px' }}>Property listings submitted by Sellers and Dealers will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Property Modal with FULL Seller Submitted Details */}
      {viewProperty && (
        <div className="modal-overlay" onClick={() => setViewProperty(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '880px', maxHeight: '92vh' }}>
            <div className="modal-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ backgroundColor: 'rgba(212, 175, 55, 0.15)', color: 'var(--gold-primary)', border: '1px solid rgba(212, 175, 55, 0.4)' }}>
                    {viewProperty.category}
                  </span>
                  <span className={`badge ${viewProperty.planType === 'PLATINUM' ? 'badge-platinum' : viewProperty.planType === 'GOLD' ? 'badge-gold' : ''}`}>
                    {viewProperty.planType} Plan
                  </span>
                  <span className={`badge ${
                    viewProperty.status === 'APPROVED' ? 'badge-approved' : 
                    viewProperty.status === 'PENDING' ? 'badge-pending' : 
                    viewProperty.status === 'HOLD' ? 'badge-hold' : 'badge-rejected'
                  }`}>
                    {viewProperty.status}
                  </span>
                  {viewProperty.isPublished ? (
                    <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Globe size={11} /> Live on Website
                    </span>
                  ) : (
                    <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                      Hidden / Draft
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>{viewProperty.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                  <MapPin size={13} style={{ color: 'var(--gold-primary)' }} />
                  <span>{viewProperty.location}{viewProperty.city ? `, ${viewProperty.city}` : ''}</span>
                  <span style={{ color: 'var(--border-color)' }}>•</span>
                  <span>Submitted: {new Date(viewProperty.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setViewProperty(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. SELLER & SUBMITTER CONTACT DOSSIER */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(15, 20, 34, 0.95))',
                border: '1px solid rgba(212, 175, 55, 0.35)',
                borderRadius: '12px',
                padding: '16px 20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-primary)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <User size={15} />
                    <span>Seller & Submitter Information</span>
                  </div>
                  <span style={{ fontSize: '11px', background: 'rgba(212, 175, 55, 0.2)', color: 'var(--gold-primary)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    {viewProperty.owner?.role || 'REGISTERED SELLER'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Full Name</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                      {viewProperty.sellerName || viewProperty.owner?.name || 'Independent Seller'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Contact Mobile / Phone</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--gold-primary)', marginTop: '2px' }}>
                      {viewProperty.sellerPhone || viewProperty.owner?.mobile ? (
                        <a 
                          href={`tel:${viewProperty.sellerPhone || viewProperty.owner?.mobile}`}
                          style={{ color: 'var(--gold-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Phone size={13} />
                          {viewProperty.sellerPhone || viewProperty.owner?.mobile}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Email Address</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#fff', marginTop: '2px' }}>
                      {viewProperty.sellerEmail || viewProperty.owner?.email ? (
                        <a 
                          href={`mailto:${viewProperty.sellerEmail || viewProperty.owner?.email}`}
                          style={{ color: '#93c5fd', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Mail size={13} />
                          {viewProperty.sellerEmail || viewProperty.owner?.email}
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>Not provided</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Submission Record ID</div>
                    <div style={{ fontSize: '11.5px', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {viewProperty.id}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. PRICING & PROPERTY IDENTITY CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Quoted Price</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '2px' }}>
                    {viewProperty.priceDisplay || formatPrice(viewProperty.price)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Numeric Value: ₹{viewProperty.price.toLocaleString('en-IN')}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Assigned Plan Category</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: viewProperty.planType === 'GOLD' ? '#fbbf24' : '#c084fc', marginTop: '2px' }}>
                    {viewProperty.planType === 'GOLD' ? 'Gold Plan ($49/mo)' : 'Platinum VIP ($129/mo)'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Category Showcase Section
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>City & Locality</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>
                    {viewProperty.city || 'Bangalore'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {viewProperty.location}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Full Address / Survey</div>
                  <div style={{ fontSize: '13px', color: '#fff', marginTop: '4px', lineHeight: 1.4 }}>
                    {viewProperty.address || viewProperty.location || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* 3. CATEGORY-SPECIFIC SPECIFICATIONS (FULL TECHNICAL ATTRIBUTES) */}
              <div style={{ background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Layers size={16} style={{ color: 'var(--gold-primary)' }} />
                    <span>Submitted Category Specifications ({viewProperty.category})</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {viewProperty.categorySpecs && Object.keys(viewProperty.categorySpecs).length > 0
                      ? `${Object.keys(viewProperty.categorySpecs).length} Attributes Recorded`
                      : 'Standard Attributes'}
                  </span>
                </div>

                {viewProperty.categorySpecs && Object.keys(viewProperty.categorySpecs).length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                    {Object.entries(viewProperty.categorySpecs).map(([key, value]) => (
                      <div 
                        key={key} 
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          {formatSpecKey(key)}
                        </div>
                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#fff', marginTop: '2px', wordBreak: 'break-word' }}>
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value || '—')}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', padding: '10px 0' }}>
                    No custom technical attributes submitted for this listing.
                  </div>
                )}
              </div>

              {/* 4. DESCRIPTION */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Property Description
                </div>
                <div style={{
                  fontSize: '13.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.65',
                  background: 'var(--bg-input)',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  whiteSpace: 'pre-line'
                }}>
                  {viewProperty.description || 'No description provided by seller.'}
                </div>
              </div>

              {/* 5. UPLOADED PHOTOS (WITH LIGHTBOX ZOOM) */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={14} />
                    <span>Uploaded Property Photos ({viewProperty.images?.length || 0})</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click any photo to view full resolution</span>
                </div>

                {viewProperty.images && viewProperty.images.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                    {viewProperty.images.map((img, i) => (
                      <div 
                        key={img.id || i} 
                        style={{
                          position: 'relative',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          aspectRatio: '4/3',
                          background: '#000'
                        }}
                        onClick={() => setPreviewImage(img.url)}
                      >
                        <img 
                          src={img.url} 
                          alt={`Property ${i + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {i === 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            background: 'rgba(0, 0, 0, 0.75)',
                            color: 'var(--gold-primary)',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(212, 175, 55, 0.4)'
                          }}>
                            Cover Photo
                          </span>
                        )}
                        <div style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '6px',
                          background: 'rgba(0, 0, 0, 0.65)',
                          color: '#fff',
                          padding: '3px 5px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <ZoomIn size={12} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-input)', borderRadius: '10px' }}>
                    No photos uploaded for this property
                  </div>
                )}
              </div>

            </div>

            {/* MODAL FOOTER WITH INSTANT APPROVAL ACTIONS */}
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {viewProperty.status !== 'APPROVED' ? (
                  <>
                    <button 
                      className="btn btn-success"
                      onClick={() => {
                        setSelectedApprovalTier('GOLD');
                        setApprovalProperty(viewProperty);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} />
                      <span>Approve as Gold ($49/mo)</span>
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setSelectedApprovalTier('PLATINUM');
                        setApprovalProperty(viewProperty);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Layers size={16} />
                      <span>Approve as Platinum ($129/mo)</span>
                    </button>
                  </>
                ) : (
                  <button 
                    className="btn btn-secondary"
                    style={{ color: viewProperty.planType === 'GOLD' ? '#fbbf24' : '#c084fc', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => openApproveModal(viewProperty)}
                  >
                    <Layers size={16} />
                    <span>Change Plan Tier (Currently {viewProperty.planType})</span>
                  </button>
                )}

                {viewProperty.status !== 'HOLD' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      handleStatusChange(viewProperty.id, 'HOLD');
                      setViewProperty(null);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <PauseCircle size={16} />
                    <span>Place on Hold</span>
                  </button>
                )}

                {viewProperty.status !== 'REJECTED' && (
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      handleStatusChange(viewProperty.id, 'REJECTED');
                      setViewProperty(null);
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <XCircle size={16} />
                    <span>Reject Listing</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditProperty(viewProperty);
                    setViewProperty(null);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Edit3 size={15} />
                  <span>Edit Details</span>
                </button>
                <button className="btn btn-secondary" onClick={() => setViewProperty(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Full-Resolution Photo Inspection */}
      {previewImage && (
        <div 
          className="modal-overlay" 
          onClick={() => setPreviewImage(null)} 
          style={{ zIndex: 110, background: 'rgba(0, 0, 0, 0.92)' }}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
            <button 
              className="btn btn-secondary btn-icon" 
              onClick={() => setPreviewImage(null)}
              style={{ position: 'absolute', top: '-40px', right: '0', background: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
            >
              ✕
            </button>
            <img 
              src={previewImage} 
              alt="Full Preview" 
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)' }}
            />
          </div>
        </div>
      )}

      {/* Edit Property Modal */}
      {editProperty && (
        <div className="modal-overlay" onClick={() => setEditProperty(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>Edit Property Details</div>
              <button className="btn btn-secondary btn-icon" onClick={() => setEditProperty(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Property Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProperty.title}
                    onChange={(e) => setEditProperty({ ...editProperty, title: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-control"
                      value={editProperty.category}
                      onChange={(e) => setEditProperty({ ...editProperty, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Plan Tier</label>
                    <select
                      className="form-control"
                      value={editProperty.planType}
                      onChange={(e) => setEditProperty({ ...editProperty, planType: e.target.value as any })}
                    >
                      <option value="STANDARD">Standard Listing</option>
                      <option value="GOLD">Gold Plan</option>
                      <option value="PLATINUM">Platinum Plan</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Location (City / Area)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editProperty.location}
                      onChange={(e) => setEditProperty({ ...editProperty, location: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (₹ INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={editProperty.price}
                      onChange={(e) => setEditProperty({ ...editProperty, price: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    value={editProperty.description}
                    onChange={(e) => setEditProperty({ ...editProperty, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confidential Full Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProperty.address || ''}
                    onChange={(e) => setEditProperty({ ...editProperty, address: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Owner / Seller Contact</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editProperty.sellerContact || ''}
                    onChange={(e) => setEditProperty({ ...editProperty, sellerContact: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditProperty(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve Property & Category Tier Selection Modal */}
      {approvalProperty && (
        <div className="modal-overlay" onClick={() => !approving && setApprovalProperty(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} style={{ color: '#10B981' }} />
                  <span>Approve & Assign Category</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {approvalProperty.title} ({approvalProperty.category})
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-icon" 
                disabled={approving}
                onClick={() => setApprovalProperty(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: '1.5' }}>
                Select which category this approved property should belong to. The approved property will be dynamically assigned and displayed under the selected category on the public website:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Option 1: Gold */}
                <div
                  onClick={() => setSelectedApprovalTier('GOLD')}
                  style={{
                    border: `2px solid ${selectedApprovalTier === 'GOLD' ? '#D4AF37' : 'var(--border-color)'}`,
                    background: selectedApprovalTier === 'GOLD' ? 'rgba(212, 175, 55, 0.12)' : 'var(--bg-input)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      padding: '3px 8px', 
                      borderRadius: '4px',
                      background: '#D4AF37', 
                      color: '#0B1118' 
                    }}>
                      GOLD
                    </span>
                    <input 
                      type="radio" 
                      name="approvalTier" 
                      checked={selectedApprovalTier === 'GOLD'} 
                      onChange={() => setSelectedApprovalTier('GOLD')} 
                    />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    Gold Property
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Assigned and displayed dynamically under the <strong>Gold Property</strong> category on the public website.
                  </div>
                </div>

                {/* Option 2: Premium */}
                <div
                  onClick={() => setSelectedApprovalTier('PLATINUM')}
                  style={{
                    border: `2px solid ${selectedApprovalTier === 'PLATINUM' ? '#A855F7' : 'var(--border-color)'}`,
                    background: selectedApprovalTier === 'PLATINUM' ? 'rgba(168, 85, 247, 0.12)' : 'var(--bg-input)',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ 
                      fontSize: '11px', 
                      fontWeight: 800, 
                      padding: '3px 8px', 
                      borderRadius: '4px',
                      background: '#A855F7', 
                      color: '#FFFFFF' 
                    }}>
                      PREMIUM
                    </span>
                    <input 
                      type="radio" 
                      name="approvalTier" 
                      checked={selectedApprovalTier === 'PLATINUM'} 
                      onChange={() => setSelectedApprovalTier('PLATINUM')} 
                    />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    Premium Property
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    Assigned and displayed dynamically under the <strong>Premium Property</strong> category on the public website.
                  </div>
                </div>
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.04)', 
                padding: '12px 14px', 
                borderRadius: '8px', 
                fontSize: '12.5px', 
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)'
              }}>
                ℹ️ Status will be updated to <strong>APPROVED</strong>. The property will immediately reflect on the public website under <strong>{selectedApprovalTier === 'GOLD' ? 'Gold Property Category' : 'Premium Property Category'}</strong>.
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                disabled={approving}
                onClick={() => setApprovalProperty(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-success" 
                disabled={approving}
                onClick={handleConfirmApproval}
                style={{
                  background: selectedApprovalTier === 'GOLD' 
                    ? 'linear-gradient(135deg, #D4AF37 0%, #AA820A 100%)' 
                    : 'linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)',
                  color: selectedApprovalTier === 'GOLD' ? '#0B1118' : '#fff',
                  border: 'none',
                  fontWeight: 700,
                  padding: '8px 18px'
                }}
              >
                {approving ? 'Approving...' : `Approve as ${selectedApprovalTier === 'GOLD' ? 'Gold' : 'Premium'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
