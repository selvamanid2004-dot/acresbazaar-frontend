import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookmarkCheck, 
  Search, 
  Filter, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Eye, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { PropertyBooking } from '../types';
import { api } from '../services/api';

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoleTab, setActiveRoleTab] = useState<'ALL' | 'BUYER' | 'DEALER'>('ALL');
  const [planFilter, setPlanFilter] = useState<'ALL' | 'GOLD' | 'PLATINUM'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<PropertyBooking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getBookings({
        role: activeRoleTab !== 'ALL' ? activeRoleTab : undefined,
        planType: planFilter !== 'ALL' ? planFilter : undefined,
        search: searchTerm || undefined
      });
      setBookings(data);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeRoleTab, planFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = bookings.length;
    const buyerBookings = bookings.filter(b => b.bookerRole === 'BUYER');
    const dealerBookings = bookings.filter(b => b.bookerRole === 'DEALER');
    const goldCount = bookings.filter(b => (b.planType || '').toUpperCase().includes('GOLD')).length;
    const platCount = bookings.filter(b => (b.planType || '').toUpperCase().includes('PLATINUM') || (b.planType || '').toUpperCase().includes('PREMIUM')).length;

    return {
      total,
      buyerCount: buyerBookings.length,
      dealerCount: dealerBookings.length,
      goldCount,
      platCount
    };
  }, [bookings]);

  return (
    <div className="bookings-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '10px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookmarkCheck size={24} color="#60a5fa" />
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Property Bookings Module
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Full mapping of registered sellers, properties, and buyers/dealers who booked them
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={fetchBookings} 
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* Total Bookings */}
        <div className="panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Bookings</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{metrics.total}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>All booked properties</div>
          </div>
        </div>

        {/* Buyer Bookings */}
        <div className="panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(15, 23, 42, 0.8))' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
            <User size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Buyer Bookings</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{metrics.buyerCount}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Registered buyers booked</div>
          </div>
        </div>

        {/* Dealer Bookings */}
        <div className="panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(15, 23, 42, 0.8))' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e2c044' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#e2c044', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dealer Bookings</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{metrics.dealerCount}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Authorized dealers booked</div>
          </div>
        </div>
        </div>


      {/* Filter and Navigation Tabs */}
      <div className="panel" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px', marginBottom: '14px' }}>
          
          {/* Main Module Tabs: All vs Buyers vs Dealers */}
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.6)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={() => setActiveRoleTab('ALL')}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeRoleTab === 'ALL' ? '#2563eb' : 'transparent',
                color: activeRoleTab === 'ALL' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              All Bookings ({bookings.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveRoleTab('BUYER')}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeRoleTab === 'BUYER' ? '#059669' : 'transparent',
                color: activeRoleTab === 'BUYER' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              👤 Buyer Bookings
            </button>

            <button
              type="button"
              onClick={() => setActiveRoleTab('DEALER')}
              style={{
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: 'none',
                background: activeRoleTab === 'DEALER' ? '#d97706' : 'transparent',
                color: activeRoleTab === 'DEALER' ? '#fff' : '#94a3b8',
                transition: 'all 0.2s ease'
              }}
            >
              🤝 Dealer Bookings
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', maxWidth: '380px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '34px', fontSize: '13px', height: '36px' }}
                placeholder="Search by property, buyer, dealer, seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ padding: '0 12px', height: '36px' }}>
              Search
            </button>
          </form>
        </div>

        {/* Secondary Filters: Plan & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          
          {/* Plan Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Plan Tier:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['ALL', 'GOLD', 'PLATINUM'] as const).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setPlanFilter(plan)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: planFilter === plan ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                    background: planFilter === plan ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                    color: planFilter === plan ? '#60a5fa' : '#94a3b8'
                  }}
                >
                  {plan === 'ALL' ? 'All Plans' : plan === 'GOLD' ? 'Gold Plan' : 'Platinum Plan'}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bookings Table / Listing View */}
      <div className="panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 16px' }}>Property Details</th>
                <th style={{ padding: '14px 16px' }}>Uploaded By (Seller)</th>
                <th style={{ padding: '14px 16px' }}>Booked By (Client)</th>
                <th style={{ padding: '14px 16px' }}>Plan</th>
                <th style={{ padding: '14px 16px' }}>Booking Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                    Loading property bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <BookmarkCheck size={32} style={{ opacity: 0.3, margin: '0 auto 10px auto', display: 'block' }} />
                    No property bookings found matching current filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const isBuyer = booking.bookerRole === 'BUYER';
                  const isDealer = booking.bookerRole === 'DEALER';
                  const isGold = (booking.planType || '').toUpperCase().includes('GOLD');

                  return (
                    <tr 
                      key={booking.id}
                      style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Property Column */}
                      <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '13.5px' }}>
                            {booking.propertyTitle}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#94a3b8' }}>
                            <span style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '1px 6px', borderRadius: '4px' }}>
                              {booking.propertyCategory || 'Property'}
                            </span>
                            {booking.propertyPrice ? (
                              <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                                ₹{booking.propertyPrice.toLocaleString('en-IN')}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Uploaded By (Seller) Column */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '13px' }}>
                            {booking.sellerName || 'Registered Seller'}
                          </span>
                          {booking.sellerPhone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#94a3b8' }}>
                              <Phone size={11} /> {booking.sellerPhone}
                            </span>
                          )}
                          {booking.sellerEmail && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                              <Mail size={11} /> {booking.sellerEmail}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Booked By Column */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span 
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: isBuyer ? 'rgba(16, 185, 129, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                                color: isBuyer ? '#34d399' : '#fbbf24',
                                border: isBuyer ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(217, 119, 6, 0.4)'
                              }}
                            >
                              {isBuyer ? 'BUYER' : 'DEALER'}
                            </span>
                            <span style={{ fontWeight: 600, color: '#fff', fontSize: '13px' }}>
                              {booking.bookerName || booking.dealerName || 'Customer'}
                            </span>
                          </div>

                          {isDealer && (booking.dealerCompany || '') && (
                            <span style={{ fontSize: '11.5px', color: '#f59e0b', fontWeight: 500 }}>
                              🏢 {booking.dealerCompany}
                            </span>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11.5px', color: '#94a3b8' }}>
                            {(booking.bookerPhone || booking.dealerPhone) && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Phone size={11} /> {booking.bookerPhone || booking.dealerPhone}
                              </span>
                            )}
                            {(booking.bookerEmail || booking.dealerEmail) && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                                <Mail size={11} /> {booking.bookerEmail || booking.dealerEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Plan Column */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span 
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              width: 'fit-content',
                              background: isGold ? 'rgba(234, 179, 8, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                              color: isGold ? '#facc15' : '#c084fc',
                              border: isGold ? '1px solid rgba(234, 179, 8, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)'
                            }}
                          >
                            {isGold ? 'Gold Plan' : 'Platinum VIP'}
                          </span>
                        </div>
                      </td>

                      {/* Booking Date */}
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#cbd5e1' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="#64748b" />
                          <span>{new Date(booking.bookingDate || booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Actions Column */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setSelectedBooking(booking)}
                          style={{ padding: '5px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="Inspect Mapping & Full Dossier"
                        >
                          <Eye size={13} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED INSPECTION MODAL */}
      {selectedBooking && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="panel"
            style={{
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                    background: selectedBooking.bookerRole === 'BUYER' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                    color: selectedBooking.bookerRole === 'BUYER' ? '#34d399' : '#fbbf24',
                    border: selectedBooking.bookerRole === 'BUYER' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(217, 119, 6, 0.4)'
                  }}
                >
                  {selectedBooking.bookerRole === 'BUYER' ? 'Registered Buyer Booking' : 'Authorized Dealer Booking'}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  {selectedBooking.propertyTitle}
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Booking Ref: #{selectedBooking.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#94a3b8',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* FLOW DIAGRAM MAPPING */}
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Complete Transaction Mapping Flow
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center' }}>
                
                {/* Step 1: Seller Box */}
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '4px' }}>
                    1. Uploaded By Seller
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                    {selectedBooking.sellerName || 'Verified Seller'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    📞 {selectedBooking.sellerPhone || 'N/A'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                    ✉️ {selectedBooking.sellerEmail || 'N/A'}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#64748b' }}>
                  <ArrowRight size={20} />
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                    {selectedBooking.planType}
                  </span>
                </div>

                {/* Step 2: Booker Box */}
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: selectedBooking.bookerRole === 'BUYER' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(217, 119, 6, 0.4)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: selectedBooking.bookerRole === 'BUYER' ? '#34d399' : '#fbbf24', textTransform: 'uppercase', marginBottom: '4px' }}>
                    2. Booked By {selectedBooking.bookerRole}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>
                    {selectedBooking.bookerName || selectedBooking.dealerName}
                  </div>
                  {selectedBooking.dealerCompany && (
                    <div style={{ fontSize: '11px', color: '#f59e0b' }}>
                      🏢 {selectedBooking.dealerCompany}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    📞 {selectedBooking.bookerPhone || selectedBooking.dealerPhone}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                    ✉️ {selectedBooking.bookerEmail || selectedBooking.dealerEmail}
                  </div>
                </div>

              </div>
            </div>

            {/* Details Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '20px' }}>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Property Listed Price</span>
                <strong style={{ fontSize: '15px', color: '#38bdf8' }}>
                  ₹{(selectedBooking.propertyPrice || 0).toLocaleString('en-IN')}
                </strong>
              </div>



              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Plan Membership Assigned</span>
                <strong style={{ fontSize: '14px', color: (selectedBooking.planType || '').toUpperCase().includes('GOLD') ? '#facc15' : '#c084fc' }}>
                  {selectedBooking.planType} Plan
                </strong>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Booking Timestamp</span>
                <strong style={{ fontSize: '13px', color: '#e2e8f0' }}>
                  {new Date(selectedBooking.bookingDate || selectedBooking.createdAt).toLocaleString('en-IN')}
                </strong>
              </div>

            </div>

            {/* Notes */}
            {selectedBooking.notes && (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Client Notes / Specifications:</span>
                <p style={{ fontSize: '13px', color: '#f8fafc', margin: 0, lineHeight: 1.5 }}>
                  {selectedBooking.notes}
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedBooking(null)}
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
