import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import { api } from '../services/api';

export const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and Confirm Password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setSuccess(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update administrator password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '540px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Change Admin Password</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Update executive credentials with cryptographic bcrypt salting & hashing
        </p>
      </div>

      {error && (
        <div style={{ 
          backgroundColor: 'rgba(244, 63, 94, 0.12)', 
          border: '1px solid rgba(244, 63, 94, 0.3)', 
          borderRadius: '10px', 
          padding: '12px 16px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fb7185',
          fontSize: '13.5px'
        }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ 
          backgroundColor: 'rgba(16, 185, 129, 0.15)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: '10px', 
          padding: '12px 16px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34d399',
          fontSize: '13.5px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <KeyRound size={18} style={{ color: 'var(--gold-primary)' }} />
            <span>Security Credentials</span>
          </div>
        </div>

        <div className="panel-body">
          <div className="form-group">
            <label className="form-label">Current Master Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="panel-footer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <KeyRound size={15} />
            <span>{loading ? 'Updating Credentials...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
