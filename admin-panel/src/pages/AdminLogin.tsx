import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert, ArrowRight, Building2, Server, RefreshCw, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);

  const checkBackend = async () => {
    setCheckingBackend(true);
    try {
      const status = await api.checkBackendHealth();
      setBackendOnline(status.ok);
    } catch {
      setBackendOnline(false);
    } finally {
      setCheckingBackend(false);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email.trim(), password);
      localStorage.setItem('admin_token', res.access_token);
      localStorage.setItem('admin_user', JSON.stringify(res.user));
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('BACKEND_OFFLINE') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setBackendOnline(false);
        setError('Backend server is offline (port 5001). Please start it via run-backend.bat, or explore in Demo Mode.');
      } else {
        setError(msg || 'Invalid administrator credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    api.loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="login-screen">
      <div className="login-card" style={{ maxWidth: '460px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div 
            style={{ 
              width: '56px', 
              height: '56px', 
              background: 'linear-gradient(135deg, #d97706, #fbbf24)', 
              borderRadius: '16px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)',
              marginBottom: '14px'
            }}
          >
            <Building2 size={28} color="#0a0d14" />
          </div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
            AcresBazaar Admin
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Authorized Executive Administration Portal
          </p>

          {/* Live Backend Status Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '20px', fontSize: '11.5px', background: backendOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', border: `1px solid ${backendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, color: backendOnline ? '#34d399' : '#f87171' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: backendOnline === null ? '#fbbf24' : backendOnline ? '#34d399' : '#ef4444', display: 'inline-block' }} />
            <span>
              {checkingBackend ? 'Checking Backend API...' : backendOnline === null ? 'Detecting Port 5001...' : backendOnline ? 'Backend Online (Port 5001 Connected)' : 'Backend Offline (Port 5001 Unreachable)'}
            </span>
            <button 
              type="button" 
              onClick={checkBackend}
              title="Re-check backend status"
              disabled={checkingBackend}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px', display: 'inline-flex', alignItems: 'center' }}
            >
              <RefreshCw size={12} className={checkingBackend ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Backend Offline Guidance Box */}
        {backendOnline === false && (
          <div 
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.12)', 
              border: '1px solid rgba(245, 158, 11, 0.35)', 
              borderRadius: '10px', 
              padding: '14px', 
              marginBottom: '20px',
              fontSize: '12.5px',
              color: '#fef3c7'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#fbbf24', marginBottom: '6px' }}>
              <AlertTriangle size={17} style={{ flexShrink: 0 }} />
              <span>Backend API Not Running</span>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              The admin panel connects to the NestJS server on port 5001. Launch it via <code style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '2px 5px', borderRadius: '4px', color: '#fbbf24' }}>run-backend.bat</code>, or continue in Demo Mode.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ flex: 1, padding: '6px 10px', fontSize: '11.5px', justifyContent: 'center' }}
                onClick={checkBackend}
                disabled={checkingBackend}
              >
                <RefreshCw size={13} className={checkingBackend ? 'animate-spin' : ''} />
                <span>Retry Connection</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1, padding: '6px 10px', fontSize: '11.5px', justifyContent: 'center' }}
                onClick={handleDemoAccess}
              >
                <Sparkles size={13} />
                <span>Enter Demo Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {error && !error.includes('Backend server is offline') && (
          <div 
            style={{ 
              backgroundColor: 'rgba(244, 63, 94, 0.12)', 
              border: '1px solid rgba(244, 63, 94, 0.3)', 
              borderRadius: '10px', 
              padding: '12px 16px', 
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#fb7185'
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="admin@acresbazaar.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginBottom: '10px' }}
            disabled={loading}
          >
            <span>{loading ? 'Authenticating...' : 'Access Executive Portal'}</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}
            onClick={handleDemoAccess}
          >
            <Sparkles size={15} />
            <span>Instant Demo / Offline Preview</span>
          </button>
        </form>

        {/* Quick Demo Credentials Box */}
        <div style={{
          marginTop: '20px',
          padding: '12px 14px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div>
            <div style={{ color: '#fbbf24', fontWeight: 600 }}>Default Admin Credentials:</div>
            <div>admin&#64;acresbazaar.com &bull; Admin&#64;123</div>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: '4px 10px', fontSize: '11px' }}
            onClick={() => {
              setEmail('admin@acresbazaar.com');
              setPassword('Admin@123');
            }}
          >
            Auto Fill
          </button>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-muted)' }}>
          Strictly restricted access • All activities monitored & logged
        </div>
      </div>
    </div>
  );
};
