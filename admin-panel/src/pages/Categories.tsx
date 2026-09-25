import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit3, Trash2, Power, Image, CheckCircle2 } from 'lucide-react';
import { Category } from '../types';
import { api } from '../services/api';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
      displayOrder: categories.length + 1,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await api.updateCategory(cat.id, { isActive: !cat.isActive });
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to update category status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this category? Properties assigned to it may be affected.')) return;
    try {
      await api.deleteCategory(id);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
      } else {
        await api.createCategory(formData);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff' }}>Category Management</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Configure real estate categories reflected immediately across the Public Website and Seller submissions
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      <div className="panel">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Display Order</th>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Properties</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>Loading categories...</td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 700, color: 'var(--gold-primary)', width: '90px' }}>
                      #{cat.displayOrder}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {cat.imageUrl ? (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <Tags size={18} />
                          </div>
                        )}
                        <div style={{ fontWeight: 600, color: '#fff' }}>{cat.name}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      <code>{cat.slug}</code>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                      {cat.description || '—'}
                    </td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--gold-primary)' }}>
                        {cat.propertiesCount ?? 0} listings
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${cat.isActive ? 'badge-active' : 'badge-inactive'}`}>
                        {cat.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Edit Category"
                          onClick={() => handleOpenEdit(cat)}
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className={`btn btn-icon ${cat.isActive ? 'btn-secondary' : 'btn-success'}`}
                          title={cat.isActive ? 'Disable Category' : 'Enable Category'}
                          onClick={() => handleToggleActive(cat)}
                        >
                          <Power size={14} />
                        </button>
                        <button
                          className="btn btn-secondary btn-icon"
                          title="Delete Category"
                          style={{ color: 'var(--rose)' }}
                          onClick={() => handleDelete(cat.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Tags size={36} className="empty-state-icon" />
                      <h4>No categories found</h4>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '16px' }}>
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </div>
              <button className="btn btn-secondary btn-icon" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g., Luxury Penthouses"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    className="form-control"
                    placeholder="Brief description of this property category..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cover Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                  {formData.imageUrl && (
                    <div style={{ marginTop: '8px' }}>
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                        onError={(e: any) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <span>Active / Visible</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
