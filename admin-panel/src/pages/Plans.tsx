import React, { useState, useEffect } from 'react';
import { CreditCard, Check, ShieldCheck, Edit3, Sparkles, CheckCircle2 } from 'lucide-react';
import { Plan } from '../types';
import { api } from '../services/api';

export const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    period: 'month',
    badge: '',
    description: '',
    benefits: '',
    features: '',
    accessPermissions: '',
    isActive: true,
    content: '',
  });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await api.getPlans();
      setPlans(data);
    } catch (err) {
      console.error('Failed to load plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      period: plan.period || 'month',
      badge: (plan as any).badge || (plan.code === 'GOLD' ? 'POPULAR' : 'MOST VALUABLE'),
      description: plan.description || '',
      benefits: Array.isArray(plan.benefits) ? plan.benefits.join('\n') : '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      accessPermissions: Array.isArray(plan.accessPermissions) ? plan.accessPermissions.join('\n') : '',
      isActive: plan.isActive,
      content: plan.content || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const planKey = (selectedPlan as any).planId || selectedPlan.id;
      await api.updatePlan(planKey, {
        name: formData.name,
        price: Number(formData.price),
        period: formData.period,
        badge: formData.badge,
        description: formData.description,
        benefits: formData.benefits.split('\n').map((s) => s.trim()).filter(Boolean),
        features: formData.features.split('\n').map((s) => s.trim()).filter(Boolean),
        accessPermissions: formData.accessPermissions.split('\n').map((s) => s.trim()).filter(Boolean),
        isActive: formData.isActive,
        content: formData.content,
      });

      setSuccessMsg(`Successfully updated ${formData.name}! Changes will immediately reflect on the public website.`);
      setSelectedPlan(null);
      await fetchPlans();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update plan');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Plan Management</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Configure pricing, locked property access rights, and VIP features for Gold and Platinum tiers
        </p>
      </div>

      {successMsg && (
        <div style={{ 
          backgroundColor: 'rgba(16, 185, 129, 0.15)', 
          border: '1px solid rgba(16, 185, 129, 0.3)', 
          borderRadius: '10px', 
          padding: '14px 18px', 
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34d399',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Strict 2 Plans Grid: ONLY Gold & Platinum */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {plans.map((plan) => {
          const isGold = plan.code === 'GOLD';
          const borderColor = isGold ? '#f59e0b' : '#94a3b8';
          const badgeClass = isGold ? 'badge-gold' : 'badge-platinum';

          return (
            <div 
              key={plan.id}
              className="panel"
              style={{
                border: `1px solid ${borderColor}`,
                boxShadow: isGold ? '0 10px 30px rgba(245, 158, 11, 0.15)' : '0 10px 30px rgba(148, 163, 184, 0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span className={`badge ${badgeClass}`}>{plan.code} TIER</span>
                    {plan.badge && (
                      <span className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', color: '#e2e8f0', fontSize: '10px' }}>
                        {plan.badge}
                      </span>
                    )}
                    <span className={`badge ${plan.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {plan.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{plan.name}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: isGold ? 'var(--gold-primary)' : '#fff' }}>
                    ₹{plan.price.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>per {plan.period}</div>
                </div>
              </div>

              <div className="panel-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {plan.description}
                </p>

                {/* Benefits */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Included Benefits & Access Rights
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(Array.isArray(plan.benefits) ? plan.benefits : []).map((b, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#fff' }}>
                        <Check size={16} style={{ color: isGold ? 'var(--gold-primary)' : '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Features */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Features & Permissions
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(Array.isArray(plan.features) ? plan.features : []).map((f, i) => (
                      <span key={i} className="badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', fontSize: '11px' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {plan.content && (
                  <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Custom Content</div>
                    {plan.content}
                  </div>
                )}
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: 'rgba(15, 20, 34, 0.5)' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleEditClick(plan)}
                >
                  <Edit3 size={15} />
                  <span>Configure {plan.code} Plan</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Plan Modal */}
      {selectedPlan && (
        <div className="modal-overlay" onClick={() => setSelectedPlan(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>
                Configure {selectedPlan.name} ({selectedPlan.code})
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setSelectedPlan(null)}>✕</button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Plan Display Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Price (₹ INR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Billing Period</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. month, year"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Badge Label (e.g. POPULAR, VIP)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. POPULAR, MOST VALUABLE"
                      value={formData.badge}
                      onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Benefits (One per line)</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="e.g.&#10;Direct Verified Seller Mobile Access&#10;Full Legal & Survey Plot Dimensions"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Key Features (One per line)</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="e.g.&#10;VIP Customer Support&#10;Document Verification Guarantee"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Marketing / Promotional Content</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    placeholder="Special offer or seasonal highlight text..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Plan Active & Visible to Buyers</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPlan(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Plan Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
