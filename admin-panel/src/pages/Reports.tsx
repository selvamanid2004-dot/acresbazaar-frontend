import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Eye, Building2, User } from 'lucide-react';
import { Report } from '../types';
import { api } from '../services/api';

export const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports(statusFilter || undefined);
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: 'PENDING' | 'RESOLVED' | 'REJECTED') => {
    try {
      await api.updateReportStatus(id, newStatus);
      fetchReports();
      if (selectedReport?.id === id) {
        setSelectedReport(null);
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Reports & Grievance Desk</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Investigate reported listings, inaccurate price flags, and customer moderation tickets
          </p>
        </div>

        <select
          className="form-control"
          style={{ width: 'auto', minWidth: '180px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending Investigation</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected / Dismissed</option>
        </select>
      </div>

      <div className="panel">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Reporting User</th>
                <th>Subject Property</th>
                <th>Issue Category</th>
                <th>Reason Summary</th>
                <th>Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Resolution Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Loading reports...</td>
                </tr>
              ) : reports.length > 0 ? (
                reports.map((rep) => (
                  <tr key={rep.id}>
                    <td style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--gold-primary)' }}>
                      #{rep.id.slice(0, 8)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{rep.user ? rep.user.name : 'Anonymous User'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rep.user ? rep.user.email : 'Public Visitor'}</div>
                    </td>
                    <td>
                      {rep.property ? (
                        <div>
                          <div style={{ fontSize: '13px', color: '#fff', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {rep.property.title}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--gold-primary)' }}>{rep.property.category}</div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>General Platform</span>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
                        {rep.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rep.reason}
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${
                        rep.status === 'RESOLVED' ? 'badge-resolved' :
                        rep.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'
                      }`}>
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="View Report Details"
                          onClick={() => setSelectedReport(rep)}
                        >
                          <Eye size={14} />
                        </button>
                        {rep.status !== 'RESOLVED' && (
                          <button
                            className="btn btn-success btn-icon"
                            title="Resolve Issue"
                            onClick={() => handleStatusChange(rep.id, 'RESOLVED')}
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {rep.status !== 'REJECTED' && (
                          <button
                            className="btn btn-danger btn-icon"
                            title="Dismiss / Reject"
                            onClick={() => handleStatusChange(rep.id, 'REJECTED')}
                          >
                            <XCircle size={14} />
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
                      <AlertCircle size={36} className="empty-state-icon" />
                      <h4>No reports found</h4>
                      <p style={{ fontSize: '13px' }}>User moderation reports and inquiries will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Report Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>Report Investigation #{selectedReport.id.slice(0, 8)}</div>
                <div style={{ fontSize: '12px', color: 'var(--gold-primary)' }}>Category: {selectedReport.category}</div>
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setSelectedReport(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reason</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', marginTop: '2px' }}>{selectedReport.reason}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Description / Evidence</div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '4px', lineHeight: '1.6' }}>
                  {selectedReport.description}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reported Property</div>
                  <div style={{ fontSize: '13px', color: '#fff', marginTop: '2px' }}>
                    {selectedReport.property ? selectedReport.property.title : 'General listing flag'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reporting User</div>
                  <div style={{ fontSize: '13px', color: '#fff', marginTop: '2px' }}>
                    {selectedReport.user ? `${selectedReport.user.name} (${selectedReport.user.email})` : 'Anonymous'}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {selectedReport.status !== 'RESOLVED' && (
                <button 
                  className="btn btn-success"
                  onClick={() => handleStatusChange(selectedReport.id, 'RESOLVED')}
                >
                  <CheckCircle2 size={16} />
                  <span>Mark Resolved</span>
                </button>
              )}
              {selectedReport.status !== 'REJECTED' && (
                <button 
                  className="btn btn-danger"
                  onClick={() => handleStatusChange(selectedReport.id, 'REJECTED')}
                >
                  <XCircle size={16} />
                  <span>Dismiss Report</span>
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setSelectedReport(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
