import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5001/api';

export const DataExport: React.FC = () => {
  const [selectedEntity, setSelectedEntity] = useState('properties');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [filterOption, setFilterOption] = useState('ALL');
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const entities = [
    { id: 'customers', label: 'All Customers Directory', desc: 'Registered buyers, sellers, and dealers' },
    { id: 'buyers', label: 'Buyers Only', desc: 'Active buyer profiles and inquiry accounts' },
    { id: 'sellers', label: 'Sellers Only', desc: 'Property owners with active or pending listings' },
    { id: 'dealers', label: 'Dealers & Agencies', desc: 'Licensed institutional brokers and agencies' },
    { id: 'properties', label: 'Property Inventory', desc: 'All listings, categories, prices, and approval states' },
    { id: 'categories', label: 'Categories Master List', desc: 'Public categories, display orders, and listing counts' },
    { id: 'rewards', label: 'Rewards & Commissions', desc: 'Referral ledger, points earned, and payment disbursements' },
    { id: 'reports', label: 'Audit & Moderation Reports', desc: 'Grievances, resolution logs, and compliance records' },
  ];

  const handleExport = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsDownloading(true);

    try {
      const token = localStorage.getItem('admin_token') || '';
      if (!token) {
        setErrorMsg('You are not authenticated. Please log in again.');
        setIsDownloading(false);
        return;
      }

      const params = new URLSearchParams({ format: exportFormat, token });
      if (filterOption && filterOption !== 'ALL') {
        params.set('filter', filterOption);
      }

      const url = `${API_BASE}/export/${selectedEntity}?${params.toString()}`;

      // Use fetch so we can detect errors properly, then trigger download
      const response = await fetch(url);

      if (!response.ok) {
        let msg = `Export failed: ${response.statusText} (${response.status})`;
        try {
          const err = await response.json();
          msg = err.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const ext = exportFormat === 'csv' ? 'csv' : 'pdf';
      const filename = `${selectedEntity}_export_${new Date().toISOString().slice(0, 10)}.${ext}`;

      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      setSuccessMsg(`✅ ${selectedEntity.charAt(0).toUpperCase() + selectedEntity.slice(1)} data exported successfully as ${ext.toUpperCase()}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during export. Is the backend running?');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ maxWidth: '820px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Data Export Engine</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Export operational databases and financial registries in standard PDF and CSV formats
        </p>
      </div>

      {/* Error / Success Banners */}
      {errorMsg && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
          borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
          color: '#fca5a5', fontSize: '13px', lineHeight: '1.5'
        }}>
          <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0, color: '#f87171' }} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
          color: '#86efac', fontSize: '13px'
        }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0, color: '#4ade80' }} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="panel" style={{ marginBottom: '24px' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Download size={18} style={{ color: 'var(--gold-primary)' }} />
            <span>Select Target Dataset</span>
          </div>
        </div>

        <div className="panel-body">
          {/* Entity Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '28px' }}>
            {entities.map((item) => {
              const isSelected = selectedEntity === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => { setSelectedEntity(item.id); setFilterOption('ALL'); setErrorMsg(null); setSuccessMsg(null); }}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    border: `1px solid ${isSelected ? 'var(--gold-primary)' : 'var(--border-color)'}`,
                    background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-input)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? 'var(--gold-primary)' : '#fff' }}>
                      {item.label}
                    </span>
                    {isSelected && <CheckCircle2 size={16} color="var(--gold-primary)" />}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {item.desc}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Export Format and Filter Options */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <label className="form-label">Export Format</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className={`btn ${exportFormat === 'csv' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setExportFormat('csv')}
                >
                  <FileSpreadsheet size={16} />
                  <span>CSV Spreadsheet</span>
                </button>
                <button
                  type="button"
                  className={`btn ${exportFormat === 'pdf' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setExportFormat('pdf')}
                >
                  <FileText size={16} />
                  <span>PDF Document</span>
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Pre-Export Status Filter</label>
              <select
                className="form-control"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
              >
                <option value="ALL">All Records (Full Export)</option>
                {selectedEntity === 'properties' && (
                  <>
                    <option value="APPROVED">Only Approved Listings</option>
                    <option value="PENDING">Only Pending Submissions</option>
                    <option value="HOLD">Only On Hold</option>
                  </>
                )}
                {selectedEntity === 'customers' && (
                  <>
                    <option value="ACTIVE">Only Active Accounts</option>
                    <option value="INACTIVE">Only Deactivated Accounts</option>
                  </>
                )}
                {selectedEntity === 'rewards' && (
                  <>
                    <option value="PAID">Only Disbursed / Paid</option>
                    <option value="PENDING">Only Pending Approval</option>
                  </>
                )}
                {selectedEntity === 'reports' && (
                  <>
                    <option value="PENDING">Only Unresolved / Pending</option>
                    <option value="RESOLVED">Only Resolved</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="panel-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {exportFormat === 'pdf' ? '⚠️ PDF preview limited to 40 rows — use CSV for full export' : 'CSV exports contain all matching records'}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isDownloading}
            style={{ minWidth: '200px', justifyContent: 'center' }}
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generating File...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download {exportFormat.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
