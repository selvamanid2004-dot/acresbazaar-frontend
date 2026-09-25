import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, Clock, XCircle, DollarSign, User, Building2 } from 'lucide-react';
import { Reward } from '../types';
import { api } from '../services/api';

export const Rewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const data = await api.getRewards(statusFilter || undefined);
      setRewards(data);
    } catch (err) {
      console.error('Failed to load rewards', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED') => {
    try {
      await api.updateRewardStatus(id, newStatus);
      fetchRewards();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Reward & Incentive Management</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Approve, payout, and track referral bonuses, dealer commissions, and loyalty rewards
          </p>
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="PAID">Paid / Disbursed</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      <div className="panel">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User / Beneficiary</th>
                <th>Associated Property</th>
                <th>Reward Reason</th>
                <th>Points / Value</th>
                <th>Amount (₹)</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Admin Status Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading rewards...</td>
                </tr>
              ) : rewards.length > 0 ? (
                rewards.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{r.userName || r.user?.name || 'Spotter / Member'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.userEmail || r.user?.email || 'External'}</div>
                    </td>
                    <td>
                      {r.propertyTitle || r.property?.title ? (
                        <div>
                          <div style={{ fontSize: '13px', color: '#fff' }}>{r.propertyTitle || r.property?.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--gold-primary)' }}>{r.rewardTitle || 'Spotter Milestone'}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Spotter Reward</span>
                      )}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {r.reason?.includes('Bank:') ? (
                        <div style={{ fontSize: '12px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '6px 10px', borderRadius: '6px' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>🏦 Verified Bank Account Info:</span>
                          </div>
                          <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.4', fontSize: '11.5px' }}>{r.reason}</div>
                        </div>
                      ) : (
                        r.reason
                      )}
                    </td>
                    <td>
                      <span className="badge badge-gold" style={{ fontSize: '12px' }}>
                        +{r.points} Pts
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#34d399' }}>
                        ₹{r.amount.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${
                        r.status === 'PAID' ? 'badge-paid' :
                        r.status === 'APPROVED' ? 'badge-approved' :
                        r.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {r.status === 'PENDING' && (
                          <button
                            className="btn btn-success btn-sm"
                            title="Approve Reward"
                            onClick={() => handleStatusChange(r.id, 'APPROVED')}
                          >
                            Approve
                          </button>
                        )}
                        {r.status === 'APPROVED' && (
                          <button
                            className="btn btn-primary btn-sm"
                            title="Mark as Paid"
                            onClick={() => handleStatusChange(r.id, 'PAID')}
                          >
                            Mark Paid
                          </button>
                        )}
                        {r.status !== 'REJECTED' && r.status !== 'PAID' && (
                          <button
                            className="btn btn-danger btn-sm"
                            title="Reject"
                            onClick={() => handleStatusChange(r.id, 'REJECTED')}
                          >
                            Reject
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
                      <Award size={36} className="empty-state-icon" />
                      <h4>No reward records found</h4>
                      <p style={{ fontSize: '13px' }}>Customer commissions and loyalty points will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
