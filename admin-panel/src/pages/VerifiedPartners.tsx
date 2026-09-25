import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Phone, 
  Mail, 
  ShoppingBag, 
  Award, 
  Home, 
  Search, 
  Filter, 
  ArrowUpRight,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { VerifiedPartner, PropertyBooking, Property, Reward } from '../types';
import { api } from '../services/api';

export const VerifiedPartners: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'listings' | 'rewards' | 'partners'>('bookings');
  
  // Tab 1: Dealer Bookings
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [loadingBookings, setLoadingBookings] = useState<boolean>(true);

  // Tab 2: Dealer Listings
  const [listings, setListings] = useState<Property[]>([]);
  const [listingStatusFilter, setListingStatusFilter] = useState<string>('ALL');
  const [listingSearch, setListingSearch] = useState<string>('');
  const [loadingListings, setLoadingListings] = useState<boolean>(true);

  // Tab 3: Dealer Rewards
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardStatusFilter, setRewardStatusFilter] = useState<string>('ALL');
  const [loadingRewards, setLoadingRewards] = useState<boolean>(true);

  // Tab 4: Partners
  const [partners, setPartners] = useState<VerifiedPartner[]>([]);
  const [partnerStatusFilter, setPartnerStatusFilter] = useState('');
  const [loadingPartners, setLoadingPartners] = useState<boolean>(true);

  // Load Bookings
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await api.getDealerBookings(planFilter, bookingSearch);
      setBookings(data);
    } catch (err) {
      console.error('Failed to load dealer bookings', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Load Listings
  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const data = await api.getDealerListings(listingStatusFilter, listingSearch);
      setListings(data);
    } catch (err) {
      console.error('Failed to load dealer listings', err);
    } finally {
      setLoadingListings(false);
    }
  };

  // Load Rewards
  const fetchRewards = async () => {
    setLoadingRewards(true);
    try {
      const data = await api.getDealerRewards(rewardStatusFilter);
      setRewards(data);
    } catch (err) {
      console.error('Failed to load dealer rewards', err);
    } finally {
      setLoadingRewards(false);
    }
  };

  // Load Partners
  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const data = await api.getPartners(partnerStatusFilter || undefined);
      setPartners(data);
    } catch (err) {
      console.error('Failed to load partners', err);
    } finally {
      setLoadingPartners(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
    else if (activeTab === 'listings') fetchListings();
    else if (activeTab === 'rewards') fetchRewards();
    else if (activeTab === 'partners') fetchPartners();
  }, [activeTab, planFilter, bookingSearch, listingStatusFilter, listingSearch, rewardStatusFilter, partnerStatusFilter]);

  // Status Handlers
  const handleBookingStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.updateBookingStatus(id, newStatus);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const handleListingStatusChange = async (id: string, newStatus: 'PENDING' | 'APPROVED' | 'HOLD' | 'REJECTED') => {
    try {
      await api.updatePropertyStatus(id, newStatus);
      fetchListings();
    } catch (err: any) {
      alert(err.message || 'Failed to update listing status');
    }
  };

  const handleRewardStatusChange = async (id: string, newStatus: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED') => {
    try {
      await api.updateRewardStatus(id, newStatus);
      fetchRewards();
    } catch (err: any) {
      alert(err.message || 'Failed to update reward status');
    }
  };

  const handlePartnerStatusChange = async (id: string, newStatus: 'PENDING' | 'VERIFIED' | 'REJECTED') => {
    try {
      await api.updatePartnerStatus(id, newStatus);
      fetchPartners();
    } catch (err: any) {
      alert(err.message || 'Partner status update failed');
    }
  };

  // Stats Calculations
  const goldBookingsCount = bookings.filter(b => (b.planType || '').toUpperCase().includes('GOLD')).length;
  const premiumBookingsCount = bookings.filter(b => !(b.planType || '').toUpperCase().includes('GOLD')).length;

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: '0 0 6px 0' }}>
            Dealers & Partner Command Center
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
            Monitor dealer property purchases under Gold & Premium plans, verified selling inventory, and milestone reward disbursements.
          </p>
        </div>

        {/* Global Summary Pill */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="badge badge-gold" style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShoppingBag size={14} />
            <span>{bookings.length} Dealer Bookings</span>
          </div>
          <div className="badge badge-verified" style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Home size={14} />
            <span>{listings.length} Dealer Listings</span>
          </div>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px 8px 0 0', fontWeight: 600 }}
          onClick={() => setActiveTab('bookings')}
        >
          <ShoppingBag size={16} />
          <span>Properties Booked / Purchased</span>
          <span className="badge badge-gold" style={{ marginLeft: '4px', fontSize: '11px' }}>{bookings.length}</span>
        </button>

        <button
          className={`btn ${activeTab === 'listings' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px 8px 0 0', fontWeight: 600 }}
          onClick={() => setActiveTab('listings')}
        >
          <Home size={16} />
          <span>Properties Listed for Sale</span>
          <span className="badge" style={{ marginLeft: '4px', fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>{listings.length}</span>
        </button>

        <button
          className={`btn ${activeTab === 'rewards' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px 8px 0 0', fontWeight: 600 }}
          onClick={() => setActiveTab('rewards')}
        >
          <Award size={16} />
          <span>Dealer Rewards & Payouts</span>
          <span className="badge badge-verified" style={{ marginLeft: '4px', fontSize: '11px' }}>{rewards.length}</span>
        </button>

        <button
          className={`btn ${activeTab === 'partners' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '8px 8px 0 0', fontWeight: 600 }}
          onClick={() => setActiveTab('partners')}
        >
          <ShieldCheck size={16} />
          <span>Accredited Partners Network</span>
          <span className="badge" style={{ marginLeft: '4px', fontSize: '11px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>{partners.length}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DEALER BOOKINGS & PURCHASES */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div>
          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div className="panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Gold Plan Bookings</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#E2C044' }}>{goldBookingsCount}</div>
              </div>
            </div>

            <div className="panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Premium Plan Bookings</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8' }}>{premiumBookingsCount}</div>
              </div>
            </div>

          </div>

          {/* Filter & Search Bar */}
          <div className="panel" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Plan:</span>
              <div style={{ display: 'inline-flex', background: 'var(--bg-card-secondary)', borderRadius: '8px', padding: '2px' }}>
                <button
                  className={`btn btn-sm ${planFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px', border: 'none', padding: '6px 14px' }}
                  onClick={() => setPlanFilter('ALL')}
                >
                  All Plans
                </button>
                <button
                  className={`btn btn-sm ${planFilter === 'GOLD' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px', border: 'none', padding: '6px 14px', color: planFilter === 'GOLD' ? '#0A1118' : '#D4AF37' }}
                  onClick={() => setPlanFilter('GOLD')}
                >
                  Gold Plan
                </button>
                <button
                  className={`btn btn-sm ${planFilter === 'PREMIUM' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px', border: 'none', padding: '6px 14px', color: planFilter === 'PREMIUM' ? '#0A1118' : '#38bdf8' }}
                  onClick={() => setPlanFilter('PREMIUM')}
                >
                  Premium Plan
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '350px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search property, dealer, or agency..."
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="panel">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property Details</th>
                    <th>Plan Tier</th>
                    <th>Dealer / Agency</th>
                    <th>Contact Details</th>
                    <th>Booking Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBookings ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading dealer bookings...</td>
                    </tr>
                  ) : bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{b.propertyTitle}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {b.propertyCategory || 'Property'} &bull; Ref: {b.propertyId.substring(0, 8)}
                          </div>
                        </td>
                        <td>
                          <span 
                            className={`badge ${b.planType === 'GOLD' ? 'badge-gold' : 'badge-verified'}`}
                            style={{ fontSize: '11px', fontWeight: 800 }}
                          >
                            {b.planType === 'GOLD' ? 'GOLD PLAN' : 'PREMIUM PLAN'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{b.dealerName}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            <Building2 size={12} color="var(--gold-primary)" />
                            <span>{b.dealerCompany || 'Independent Agency'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            <div>{b.dealerPhone}</div>
                            <div style={{ color: 'var(--text-muted)' }}>{b.dealerEmail}</div>
                          </div>
                        </td>
                        <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          {new Date(b.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span className={`badge ${
                            b.bookingStatus === 'CONFIRMED' || b.bookingStatus === 'COMPLETED' ? 'badge-verified' :
                            b.bookingStatus === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <select
                            className="form-control"
                            style={{ width: 'auto', display: 'inline-block', fontSize: '12px', padding: '4px 8px', height: 'auto' }}
                            value={b.bookingStatus}
                            onChange={(e) => handleBookingStatusChange(b.id, e.target.value)}
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <ShoppingBag size={40} className="empty-state-icon" />
                          <h4>No dealer bookings found</h4>
                          <p style={{ fontSize: '13px' }}>Properties booked by dealers under Gold or Premium plans will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DEALER LISTINGS FOR SALE */}
      {/* ========================================================================= */}
      {activeTab === 'listings' && (
        <div>
          {/* Controls Bar */}
          <div className="panel" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by Status:</span>
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '160px' }}
                value={listingStatusFilter}
                onChange={(e) => setListingStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved / Published</option>
                <option value="HOLD">On Hold</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '350px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search title, dealer, or agency..."
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Listings Table */}
          <div className="panel">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Property Title & Location</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Dealer Agency</th>
                    <th>Plan Tier</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th style={{ textAlign: 'right' }}>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingListings ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading dealer listings...</td>
                    </tr>
                  ) : listings.length > 0 ? (
                    listings.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{p.title}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.location} {p.city ? `(${p.city})` : ''}</div>
                        </td>
                        <td>
                          <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#E2C044' }}>
                          {p.priceDisplay || `₹${(p.price || 0).toLocaleString('en-IN')}`}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{p.dealerCompany || p.sellerName || 'Dealer Partner'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.sellerPhone || p.sellerEmail}</div>
                        </td>
                        <td>
                          <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                            {p.planType || 'PLATINUM'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            p.status === 'APPROVED' ? 'badge-verified' :
                            p.status === 'PENDING' ? 'badge-pending' :
                            p.status === 'HOLD' ? 'badge-gold' : 'badge-rejected'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          {new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {p.status !== 'APPROVED' && (
                              <button
                                className="btn btn-success btn-sm"
                                title="Approve & Publish Listing"
                                onClick={() => handleListingStatusChange(p.id, 'APPROVED')}
                              >
                                <CheckCircle2 size={14} />
                                <span>Approve</span>
                              </button>
                            )}
                            {p.status !== 'HOLD' && (
                              <button
                                className="btn btn-warning btn-sm"
                                title="Place on Hold"
                                onClick={() => handleListingStatusChange(p.id, 'HOLD')}
                              >
                                <Clock size={14} />
                                <span>Hold</span>
                              </button>
                            )}
                            {p.status !== 'REJECTED' && (
                              <button
                                className="btn btn-danger btn-sm"
                                title="Reject Listing"
                                onClick={() => handleListingStatusChange(p.id, 'REJECTED')}
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <Home size={40} className="empty-state-icon" />
                          <h4>No dealer listings found</h4>
                          <p style={{ fontSize: '13px' }}>Properties submitted for sale by authorized dealers will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEALER REWARDS & PAYOUTS */}
      {/* ========================================================================= */}
      {activeTab === 'rewards' && (
        <div>
          {/* Filter Bar */}
          <div className="panel" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Reward Status:</span>
              <select
                className="form-control"
                style={{ width: 'auto', minWidth: '160px' }}
                value={rewardStatusFilter}
                onChange={(e) => setRewardStatusFilter(e.target.value)}
              >
                <option value="ALL">All Reward Requests</option>
                <option value="PENDING">Pending Approval</option>
                <option value="APPROVED">Approved (Ready to Disburse)</option>
                <option value="PAID">Paid / Disbursed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Dealers earn <strong>+250 pts</strong> for listing properties & <strong>+500 pts</strong> for bookings under Gold/Premium plans.
            </div>
          </div>

          {/* Rewards Table */}
          <div className="panel">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Dealer / Recipient</th>
                    <th>Reward Title & Activity</th>
                    <th>Points</th>
                    <th>Payout Amount</th>
                    <th>Bank Details / Note</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Admin Payout Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRewards ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading dealer rewards...</td>
                    </tr>
                  ) : rewards.length > 0 ? (
                    rewards.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{r.userName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.userEmail}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff', fontSize: '13.5px' }}>{r.rewardTitle}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gold-primary)' }}>{r.propertyTitle || 'Agency Incentive'}</div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#38bdf8' }}>
                          +{r.points} pts
                        </td>
                        <td style={{ fontWeight: 700, color: '#34d399' }}>
                          {r.amount ? `₹${r.amount.toLocaleString('en-IN')}` : '-'}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                          {r.reason || 'Auto-credited upon transaction milestone'}
                        </td>
                        <td>
                          <span className={`badge ${
                            r.status === 'PAID' || r.status === 'APPROVED' ? 'badge-verified' :
                            r.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {r.status === 'PENDING' && (
                              <button
                                className="btn btn-warning btn-sm"
                                title="Approve Payout Claim"
                                onClick={() => handleRewardStatusChange(r.id, 'APPROVED')}
                              >
                                <CheckCircle2 size={14} />
                                <span>Approve</span>
                              </button>
                            )}
                            {r.status !== 'PAID' && (
                              <button
                                className="btn btn-success btn-sm"
                                title="Mark Reward Disbursed / Paid"
                                onClick={() => handleRewardStatusChange(r.id, 'PAID')}
                              >
                                <DollarSign size={14} />
                                <span>Mark Paid</span>
                              </button>
                            )}
                            {r.status !== 'REJECTED' && r.status !== 'PAID' && (
                              <button
                                className="btn btn-danger btn-sm"
                                title="Reject Reward Request"
                                onClick={() => handleRewardStatusChange(r.id, 'REJECTED')}
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8}>
                        <div className="empty-state">
                          <Award size={40} className="empty-state-icon" />
                          <h4>No dealer rewards found</h4>
                          <p style={{ fontSize: '13px' }}>Points and payout requests from dealer transactions will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACCREDITED PARTNERS NETWORK */}
      {/* ========================================================================= */}
      {activeTab === 'partners' && (
        <div>
          <div className="panel" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Accredited institutional brokerages, builders, and escrow legal advisors.
            </span>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '180px' }}
              value={partnerStatusFilter}
              onChange={(e) => setPartnerStatusFilter(e.target.value)}
            >
              <option value="">All Verification States</option>
              <option value="PENDING">Pending Verification</option>
              <option value="VERIFIED">Verified Partners</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="panel">
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Partner Name</th>
                    <th>Specialization</th>
                    <th>Company / Agency</th>
                    <th>Contact Details</th>
                    <th>Verification Status</th>
                    <th>Registration Date</th>
                    <th style={{ textAlign: 'right' }}>Admin Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingPartners ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading partner applications...</td>
                    </tr>
                  ) : partners.length > 0 ? (
                    partners.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                        </td>
                        <td>
                          <span className="badge badge-gold" style={{ fontSize: '11px' }}>
                            {p.type}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '13.5px' }}>
                            <Building2 size={14} color="var(--gold-primary)" />
                            <span>{p.company}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                            <div>{p.mobile}</div>
                            <div style={{ color: 'var(--text-muted)' }}>{p.email}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            p.status === 'VERIFIED' ? 'badge-verified' :
                            p.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                          {new Date(p.registrationDate).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {p.status !== 'VERIFIED' && (
                              <button
                                className="btn btn-success btn-sm"
                                title="Verify Partner"
                                onClick={() => handlePartnerStatusChange(p.id, 'VERIFIED')}
                              >
                                <CheckCircle2 size={14} />
                                <span>Verify</span>
                              </button>
                            )}
                            {p.status !== 'REJECTED' && (
                              <button
                                className="btn btn-danger btn-sm"
                                title="Reject Application"
                                onClick={() => handlePartnerStatusChange(p.id, 'REJECTED')}
                              >
                                <XCircle size={14} />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-state">
                          <ShieldCheck size={36} className="empty-state-icon" />
                          <h4>No partners found</h4>
                          <p style={{ fontSize: '13px' }}>Institutional brokerages and builders will appear here.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
