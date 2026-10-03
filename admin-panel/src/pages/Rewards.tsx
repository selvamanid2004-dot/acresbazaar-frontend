import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  DollarSign, 
  User, 
  Building2, 
  Search, 
  Settings, 
  Filter, 
  Calendar, 
  CreditCard, 
  ArrowUpRight, 
  Eye, 
  RefreshCw,
  Coins,
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { RewardClaim, RewardConfig, ClaimsSummary, PartnerProfileData } from '../types';
import { api } from '../services/api';
import { getCurrentAdminUser, canPerform } from '../services/authUtils';

export const Rewards: React.FC = () => {
  const currentAdmin = getCurrentAdminUser();
  const canApprove = canPerform(currentAdmin, 'rewards', 'approve');
  const canReject = canPerform(currentAdmin, 'rewards', 'reject');
  const canProcess = canPerform(currentAdmin, 'rewards', 'process');
  const canMarkPaid = canPerform(currentAdmin, 'rewards', 'mark_paid') || canPerform(currentAdmin, 'rewards', 'payment');
  const canConfig = canPerform(currentAdmin, 'rewards', 'settings') || canPerform(currentAdmin, 'rewards', 'config');

  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [summary, setSummary] = useState<ClaimsSummary>({
    totalPartnerPointsIssued: 0,
    totalPointsRedeemed: 0,
    pendingClaimsCount: 0,
    totalRewardsPaid: 0,
    totalRewardAmountPaid: 0
  });
  const [config, setConfig] = useState<RewardConfig>({
    pointsPerReward: 500,
    rewardAmountInInr: 500,
    pointsPerProperty: 20,
    conversionRateText: '500 Points = ₹500',
    ratePerPoint: 1
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedPartnerProfile, setSelectedPartnerProfile] = useState<PartnerProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [paymentModalClaim, setPaymentModalClaim] = useState<RewardClaim | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const [rejectModalClaim, setRejectModalClaim] = useState<RewardClaim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingReject, setProcessingReject] = useState(false);

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editConfig, setEditConfig] = useState({
    pointsPerReward: 500,
    rewardAmountInInr: 500,
    pointsPerProperty: 20
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const fetchClaimsAndSummary = async () => {
    setLoading(true);
    try {
      const data = await api.getRewardClaims({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setClaims(data.claims);
      setSummary(data.summary);
      if (data.config) {
        setConfig(data.config);
        setEditConfig({
          pointsPerReward: data.config.pointsPerReward,
          rewardAmountInInr: data.config.rewardAmountInInr,
          pointsPerProperty: data.config.pointsPerProperty
        });
      }
    } catch (err) {
      console.error('Failed to load claims & summary', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimsAndSummary();
  }, [statusFilter, searchQuery, startDate, endDate]);

  const handleOpenPartnerProfile = async (email: string) => {
    setLoadingProfile(true);
    setSelectedPartnerProfile(null);
    try {
      const profile = await api.getPartnerProfile(email);
      setSelectedPartnerProfile(profile);
    } catch (err: any) {
      alert(err.message || 'Failed to load partner profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await api.updateRewardConfig(editConfig);
      setConfig(res.config);
      setIsConfigOpen(false);
      alert('Reward conversion configuration updated successfully!');
      fetchClaimsAndSummary();
    } catch (err: any) {
      alert(err.message || 'Failed to update reward configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalClaim) return;
    if (!paymentRef.trim()) {
      alert('Please enter a Transaction Reference / UTR Number for payment record.');
      return;
    }

    setProcessingPayment(true);
    try {
      const res = await api.processRewardClaim(paymentModalClaim.id, {
        status: 'PAID',
        paymentReference: paymentRef.trim(),
        adminNotes: paymentNotes.trim() || undefined
      });
      alert(res.message || 'Payment marked as Paid successfully!');
      setPaymentModalClaim(null);
      setPaymentRef('');
      setPaymentNotes('');
      fetchClaimsAndSummary();
    } catch (err: any) {
      alert(err.message || 'Failed to mark payment as paid');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalClaim) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejecting the reward claim.');
      return;
    }

    setProcessingReject(true);
    try {
      const res = await api.processRewardClaim(rejectModalClaim.id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim()
      });
      alert(res.message || 'Claim rejected and points released back to Partner.');
      setRejectModalClaim(null);
      setRejectionReason('');
      fetchClaimsAndSummary();
    } catch (err: any) {
      alert(err.message || 'Failed to reject claim');
    } finally {
      setProcessingReject(false);
    }
  };

  const handleSetStatus = async (id: string, status: 'PROCESSING' | 'APPROVED') => {
    try {
      await api.processRewardClaim(id, { status });
      fetchClaimsAndSummary();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-gold">PARTNER REWARDS & PAYOUTS</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Reward Claims & Points Management</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Review Partner reward claims, verify bank details, disburse cash payouts, and configure points conversion rates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {canConfig && (
            <button 
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => setIsConfigOpen(true)}
            >
              <Settings size={16} />
              <span>Reward Settings (500 pts = ₹{config.rewardAmountInInr})</span>
            </button>
          )}

          <button 
            className="btn btn-secondary"
            onClick={fetchClaimsAndSummary}
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 5 Required Summary Metrics Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon gold-icon">
            <Coins size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Total Points Issued</span>
            <span className="stat-val" style={{ color: 'var(--gold-primary)' }}>
              {summary.totalPartnerPointsIssued.toLocaleString()} <small style={{ fontSize: '12px', color: '#94A3B8' }}>pts</small>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple-icon">
            <CreditCard size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Total Points Redeemed</span>
            <span className="stat-val" style={{ color: '#c084fc' }}>
              {summary.totalPointsRedeemed.toLocaleString()} <small style={{ fontSize: '12px', color: '#94A3B8' }}>pts</small>
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber-icon">
            <Clock size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Pending Claims</span>
            <span className="stat-val" style={{ color: '#f59e0b' }}>
              {summary.pendingClaimsCount}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Total Rewards Paid</span>
            <span className="stat-val" style={{ color: '#10b981' }}>
              {summary.totalRewardsPaid}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon emerald-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-meta">
            <span className="stat-label">Total Amount Paid</span>
            <span className="stat-val" style={{ color: '#34d399' }}>
              ₹{summary.totalRewardAmountPaid.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="panel" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status Filter */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="PROCESSING">Processing Payment</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid / Disbursed</option>
              <option value="REJECTED">Rejected / Points Refunded</option>
            </select>
          </div>

          {/* Search Query */}
          <div className="search-input-wrap" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={16} className="search-input-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by Claim ID, Partner, Bank A/C, IFSC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Date Range Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <input
              type="date"
              className="form-control"
              style={{ width: '140px' }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              title="Start Date"
            />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '140px' }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              title="End Date"
            />
            {(statusFilter || searchQuery || startDate || endDate) && (
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => { setStatusFilter(''); setSearchQuery(''); setStartDate(''); setEndDate(''); }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reward Claims Table */}
      <div className="panel">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
            Partner Reward Claims ({claims.length})
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Active Rate: <strong>{config.conversionRateText}</strong> (₹{config.ratePerPoint} / pt) · Approval: +{config.pointsPerProperty} pts/property
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Partner Details</th>
                <th>Redeemed Points</th>
                <th>Reward Amount</th>
                <th>Bank & Payment Details</th>
                <th>Claim Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading reward claims...</td>
                </tr>
              ) : claims.length > 0 ? (
                claims.map((claim) => (
                  <tr key={claim.id}>
                    {/* Claim ID */}
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontFamily: 'monospace', fontSize: '13px' }}>
                        {claim.claimNumber}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {claim.conversionRate || 'Standard Rate'}
                      </div>
                    </td>

                    {/* Partner Details */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{claim.partnerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{claim.partnerEmail}</div>
                      {claim.partnerPhone && (
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>📞 {claim.partnerPhone}</div>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 6px', fontSize: '10px', marginTop: '4px' }}
                        onClick={() => handleOpenPartnerProfile(claim.partnerEmail)}
                      >
                        <Eye size={11} style={{ marginRight: '3px' }} /> View Profile & Ledger
                      </button>
                    </td>

                    {/* Redeemed Points */}
                    <td>
                      <span className="badge badge-gold" style={{ fontSize: '12px' }}>
                        {claim.redeemedPoints.toLocaleString()} Pts
                      </span>
                    </td>

                    {/* Reward Amount */}
                    <td>
                      <div style={{ fontWeight: 800, color: '#34d399', fontSize: '14px' }}>
                        ₹{claim.rewardAmount.toLocaleString('en-IN')}
                      </div>
                    </td>

                    {/* Bank Details */}
                    <td>
                      <div style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.06)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '8px 10px', borderRadius: '6px', maxWidth: '260px' }}>
                        <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '2px' }}>
                          🏦 {claim.bankName}
                        </div>
                        <div style={{ color: '#e2e8f0', fontSize: '11.5px' }}>
                          <strong>A/C:</strong> {claim.bankAccountNumber}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                          <strong>IFSC:</strong> {claim.ifscCode} | <strong>Holder:</strong> {claim.bankAccountHolder}
                        </div>
                        {claim.upiId && (
                          <div style={{ color: '#a7f3d0', fontSize: '11px', marginTop: '2px' }}>
                            <strong>UPI:</strong> {claim.upiId}
                          </div>
                        )}
                        {claim.paymentReference && (
                          <div style={{ color: '#34d399', fontSize: '11px', marginTop: '4px', borderTop: '1px dashed rgba(52, 211, 153, 0.3)', paddingTop: '3px' }}>
                            <strong>Payment Ref:</strong> {claim.paymentReference}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Claim Date */}
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div>{new Date(claim.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: '10.5px' }}>{new Date(claim.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>

                    {/* Status */}
                    <td>
                      <span className={`badge ${
                        claim.status === 'PAID' ? 'badge-paid' :
                        claim.status === 'APPROVED' ? 'badge-approved' :
                        claim.status === 'PROCESSING' ? 'badge-pending' :
                        claim.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                      }`}>
                        {claim.status}
                      </span>
                      {claim.rejectionReason && (
                        <div style={{ fontSize: '10.5px', color: '#f87171', marginTop: '3px', maxWidth: '140px' }} title={claim.rejectionReason}>
                          Reason: {claim.rejectionReason}
                        </div>
                      )}
                    </td>

                    {/* Admin Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {claim.status === 'PENDING' && (
                          <>
                            {canProcess && (
                              <button
                                className="btn btn-secondary btn-sm"
                                title="Mark as Processing"
                                onClick={() => handleSetStatus(claim.id, 'PROCESSING')}
                              >
                                Process
                              </button>
                            )}
                            {canMarkPaid && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ background: '#10b981', borderColor: '#059669' }}
                                title="Disburse Payout & Mark Paid"
                                onClick={() => {
                                  setPaymentModalClaim(claim);
                                  setPaymentRef(`UTR-${Date.now().toString().slice(-8)}`);
                                  setPaymentNotes('');
                                }}
                              >
                                Mark as Paid
                              </button>
                            )}
                            {canReject && (
                              <button
                                className="btn btn-danger btn-sm"
                                title="Reject Claim & Release Points"
                                onClick={() => {
                                  setRejectModalClaim(claim);
                                  setRejectionReason('');
                                }}
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}

                        {claim.status === 'PROCESSING' && (
                          <>
                            {canMarkPaid && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ background: '#10b981', borderColor: '#059669' }}
                                title="Disburse Payout & Mark Paid"
                                onClick={() => {
                                  setPaymentModalClaim(claim);
                                  setPaymentRef(`UTR-${Date.now().toString().slice(-8)}`);
                                  setPaymentNotes('');
                                }}
                              >
                                Mark as Paid
                              </button>
                            )}
                            {canReject && (
                              <button
                                className="btn btn-danger btn-sm"
                                title="Reject Claim & Release Points"
                                onClick={() => {
                                  setRejectModalClaim(claim);
                                  setRejectionReason('');
                                }}
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}

                        {claim.status === 'APPROVED' && (
                          canMarkPaid && (
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ background: '#10b981', borderColor: '#059669' }}
                              title="Disburse Payout & Mark Paid"
                              onClick={() => {
                                setPaymentModalClaim(claim);
                                setPaymentRef(`UTR-${Date.now().toString().slice(-8)}`);
                                setPaymentNotes('');
                              }}
                            >
                              Mark as Paid
                            </button>
                          )
                        )}

                        {claim.status === 'PAID' && (
                          <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle2 size={13} /> Paid by {claim.processedByAdminName || 'Admin'}
                          </span>
                        )}

                        {claim.status === 'REJECTED' && (
                          <span style={{ fontSize: '11px', color: '#f87171', fontWeight: 600 }}>
                            Points Released
                          </span>
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
                      <h4>No reward claims found</h4>
                      <p style={{ fontSize: '13px' }}>When Partners submit claims for 500+ points, they will appear here for review and disbursement.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: MARK AS PAID (DISBURSE PAYMENT)                                  */}
      {/* ========================================================================= */}
      {paymentModalClaim && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign color="#10b981" />
                <span>Mark Reward Claim as Paid</span>
              </h3>
              <button className="close-btn" onClick={() => setPaymentModalClaim(null)}>×</button>
            </div>

            <form onSubmit={handleConfirmPayment}>
              <div className="modal-body">
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Claim Number:</span>
                    <strong style={{ color: '#fff' }}>{paymentModalClaim.claimNumber}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Beneficiary Partner:</span>
                    <strong style={{ color: '#fff' }}>{paymentModalClaim.partnerName} ({paymentModalClaim.partnerEmail})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Redeemed Points:</span>
                    <strong style={{ color: 'var(--gold-primary)' }}>{paymentModalClaim.redeemedPoints} Points</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed rgba(16, 185, 129, 0.3)' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Payout Amount:</span>
                    <strong style={{ color: '#10b981', fontSize: '18px' }}>₹{paymentModalClaim.rewardAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
                    🏦 Destination Bank Account:
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#fff' }}>
                    {paymentModalClaim.bankName} · A/C: {paymentModalClaim.bankAccountNumber}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                    IFSC: {paymentModalClaim.ifscCode} · Holder: {paymentModalClaim.bankAccountHolder}
                    {paymentModalClaim.upiId ? ` · UPI: ${paymentModalClaim.upiId}` : ''}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Bank Reference / Transaction ID / UTR Number <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. UTR19283746501 or IMPS Ref"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Enter the bank UTR or IMPS reference after manually transferring the amount to the partner's account.
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Admin Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    placeholder="Internal remarks regarding this payout..."
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentModalClaim(null)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ background: '#10b981', borderColor: '#059669' }}
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Recording Payment...' : 'Confirm & Mark as Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: REJECT REWARD CLAIM (RELEASE RESERVED POINTS)                     */}
      {/* ========================================================================= */}
      {rejectModalClaim && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                <XCircle color="#ef4444" />
                <span>Reject Reward Claim</span>
              </h3>
              <button className="close-btn" onClick={() => setRejectModalClaim(null)}>×</button>
            </div>

            <form onSubmit={handleConfirmReject}>
              <div className="modal-body">
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                  <p style={{ fontSize: '13px', color: '#fca5a5', margin: 0 }}>
                    Rejecting Claim <strong>#{rejectModalClaim.claimNumber}</strong> will automatically <strong>release {rejectModalClaim.redeemedPoints} Reserved Points back to {rejectModalClaim.partnerName}'s Available Wallet</strong> balance.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Rejection Reason <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Invalid bank account IFSC code / Name mismatch on bank account"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    This reason will be visible to the partner in their Points Wallet history.
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setRejectModalClaim(null)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-danger"
                  disabled={processingReject}
                >
                  {processingReject ? 'Rejecting...' : 'Confirm Rejection & Release Points'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CONFIGURABLE REWARD CONVERSION SETTINGS                          */}
      {/* ========================================================================= */}
      {isConfigOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Settings color="var(--gold-primary)" />
                <span>Configure Reward Conversion Rates</span>
              </h3>
              <button className="close-btn" onClick={() => setIsConfigOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSaveConfig}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Configure the point threshold and monetary rupee value for partner reward redemptions.
                </p>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Minimum Points Required For Milestone
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min={100}
                    step={50}
                    value={editConfig.pointsPerReward}
                    onChange={(e) => setEditConfig({ ...editConfig, pointsPerReward: Number(e.target.value) })}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Default standard: 500 Points.
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Reward Cash Payout Amount (₹)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min={50}
                    step={50}
                    value={editConfig.rewardAmountInInr}
                    onChange={(e) => setEditConfig({ ...editConfig, rewardAmountInInr: Number(e.target.value) })}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Monetary cash payout disbursed to partner per milestone.
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" style={{ fontWeight: 600 }}>
                    Points Awarded Per Approved Property
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={editConfig.pointsPerProperty}
                    onChange={(e) => setEditConfig({ ...editConfig, pointsPerProperty: Number(e.target.value) })}
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
                    Points credited when Admin approves a partner's submitted property (Default: 20 Points).
                  </small>
                </div>

                <div style={{ background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.25)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 700, color: 'var(--gold-primary)', fontSize: '13px' }}>
                    Conversion Formula Preview:
                  </div>
                  <div style={{ color: '#fff', fontSize: '14px', marginTop: '4px' }}>
                    {editConfig.pointsPerReward} Points = <strong>₹{editConfig.rewardAmountInInr.toLocaleString('en-IN')}</strong> (Rate: ₹{(editConfig.rewardAmountInInr / (editConfig.pointsPerReward || 1)).toFixed(2)} / point)
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    E.g. 1,000 Points = ₹{((1000 / (editConfig.pointsPerReward || 1)) * editConfig.rewardAmountInInr).toLocaleString('en-IN')} | 1,500 Points = ₹{((1500 / (editConfig.pointsPerReward || 1)) * editConfig.rewardAmountInInr).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsConfigOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingConfig}>
                  {savingConfig ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: FULL PARTNER PROFILE & LEDGER VIEW                               */}
      {/* ========================================================================= */}
      {selectedPartnerProfile && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User color="var(--gold-primary)" />
                <span>Partner Profile & Points Ledger · {selectedPartnerProfile.partner.name}</span>
              </h3>
              <button className="close-btn" onClick={() => setSelectedPartnerProfile(null)}>×</button>
            </div>

            <div className="modal-body">
              {/* Partner Overview Header */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>PARTNER NAME</div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>{selectedPartnerProfile.partner.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{selectedPartnerProfile.partner.email}</div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AVAILABLE POINTS</div>
                  <div style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '18px' }}>
                    {selectedPartnerProfile.wallet.availablePoints} <small style={{ fontSize: '11px', color: '#94A3B8' }}>pts</small>
                  </div>
                  <div style={{ fontSize: '11px', color: '#f59e0b' }}>
                    Reserved: {selectedPartnerProfile.wallet.reservedPoints} pts
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL EARNED / REDEEMED</div>
                  <div style={{ fontWeight: 700, color: '#34d399', fontSize: '13px' }}>
                    Earned: +{selectedPartnerProfile.wallet.totalEarnedPoints} pts
                  </div>
                  <div style={{ fontSize: '12px', color: '#c084fc' }}>
                    Redeemed: -{selectedPartnerProfile.wallet.totalRedeemedPoints} pts
                  </div>
                </div>

                {selectedPartnerProfile.bankDetail && (
                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.25)' }}>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>SAVED BANK ACCOUNT</div>
                    <div style={{ fontSize: '12px', color: '#fff', fontWeight: 600 }}>{selectedPartnerProfile.bankDetail.bankName}</div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1' }}>A/C: {selectedPartnerProfile.bankDetail.accountNumber} · IFSC: {selectedPartnerProfile.bankDetail.ifscCode}</div>
                  </div>
                )}
              </div>

              {/* Section 1: Property Contributions */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} color="var(--gold-primary)" />
                  <span>Property Contributions ({selectedPartnerProfile.properties.length})</span>
                </h4>
                <div className="table-responsive" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table className="custom-table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Property Title</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Points Awarded</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPartnerProfile.properties.length > 0 ? (
                        selectedPartnerProfile.properties.map((p) => (
                          <tr key={p.id}>
                            <td style={{ fontWeight: 600, color: '#fff' }}>{p.title}</td>
                            <td>{p.category}</td>
                            <td>{p.location}</td>
                            <td>₹{p.price.toLocaleString('en-IN')}</td>
                            <td>
                              <span className={`badge ${p.status === 'APPROVED' ? 'badge-approved' : p.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'}`} style={{ fontSize: '10px' }}>
                                {p.status}
                              </span>
                            </td>
                            <td>
                              {p.pointsAwarded ? (
                                <span style={{ color: '#10b981', fontWeight: 700 }}>+20 Pts Awarded</span>
                              ) : p.status === 'APPROVED' ? (
                                <span style={{ color: '#f59e0b' }}>Pending Crediting</span>
                              ) : (
                                <span style={{ color: '#94a3b8' }}>0 Pts (Pending Approval)</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                            No property listings submitted by this partner yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2: Complete Points Ledger History */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText size={16} color="var(--gold-primary)" />
                  <span>Points Transaction Ledger History</span>
                </h4>
                <div className="table-responsive" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                  <table className="custom-table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Transaction Type</th>
                        <th>Description</th>
                        <th>Points</th>
                        <th>Balance (Before → After)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPartnerProfile.ledger.length > 0 ? (
                        selectedPartnerProfile.ledger.map((tx) => (
                          <tr key={tx.id}>
                            <td style={{ color: 'var(--text-muted)' }}>
                              {new Date(tx.createdAt).toLocaleString()}
                            </td>
                            <td>
                              <span className={`badge ${
                                tx.transactionType === 'PROPERTY_APPROVED' ? 'badge-approved' :
                                tx.transactionType === 'REWARD_PAID' ? 'badge-paid' :
                                tx.transactionType === 'REWARD_RESERVED' ? 'badge-pending' : 'badge-gold'
                              }`} style={{ fontSize: '10px' }}>
                                {tx.transactionType.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td style={{ color: '#e2e8f0' }}>{tx.description}</td>
                            <td>
                              <strong style={{ color: tx.points >= 0 ? '#10b981' : '#f87171' }}>
                                {tx.points >= 0 ? `+${tx.points}` : tx.points} Pts
                              </strong>
                            </td>
                            <td style={{ color: '#94a3b8' }}>
                              {tx.balanceBefore} → <strong style={{ color: '#fff' }}>{tx.balanceAfter}</strong>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                            No points ledger records for this partner yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedPartnerProfile(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
