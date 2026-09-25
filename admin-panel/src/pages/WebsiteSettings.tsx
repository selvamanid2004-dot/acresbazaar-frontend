import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
  Home,
  Info,
  Briefcase,
  PhoneCall,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export const WebsiteSettings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('group') || 'home';

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentUploadTargetRef = useRef<{ key: string; group: string }>({ key: '', group: '' });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings(activeTab);
      const mapped: Record<string, string> = {};
      data.forEach((s) => {
        mapped[s.key] = s.value;
      });
      setSettings(mapped);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [activeTab]);

  const handleFieldChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        group: activeTab,
      }));

      // Ensure dual-key synchronization for common aliases across modules
      if (activeTab === 'home') {
        if (settings.hero_title) payload.push({ key: 'hero_headline', value: settings.hero_title, group: 'home' });
        if (settings.hero_subtitle) payload.push({ key: 'hero_subheading', value: settings.hero_subtitle, group: 'home' });
      } else if (activeTab === 'about') {
        if (settings.about_title) payload.push({ key: 'about_headline', value: settings.about_title, group: 'about' });
        if (settings.about_description) payload.push({ key: 'about_story', value: settings.about_description, group: 'about' });
      } else if (activeTab === 'service') {
        if (settings.service_title) payload.push({ key: 'service_overview', value: settings.service_title, group: 'service' });
      } else if (activeTab === 'contact') {
        if (settings.contact_email) payload.push({ key: 'email', value: settings.contact_email, group: 'contact' });
        if (settings.contact_phone) payload.push({ key: 'phone', value: settings.contact_phone, group: 'contact' });
      } else if (activeTab === 'logo') {
        if (settings.website_logo) payload.push({ key: 'logo_url', value: settings.website_logo, group: 'logo' });
      }

      await api.updateSettings(payload);
      setSuccessMsg(`CMS changes for ${activeTab.toUpperCase()} saved! Changes are live on the public website.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Trigger native file picker for any image field
  const triggerImageUpload = (key: string, group: string) => {
    currentUploadTargetRef.current = { key, group };
    fileInputRef.current?.click();
  };

  // Process selected image file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { key, group } = currentUploadTargetRef.current;
    if (!key) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (PNG, JPG, WEBP, or SVG)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert('File size exceeds 20MB limit. Please select a smaller image.');
      return;
    }

    setUploadingKey(key);
    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        setUploadingKey(null);
        return;
      }

      try {
        let resUrl = '';
        if (key === 'website_logo' || key === 'logo_url') {
          const res = await api.uploadLogo(base64Data, file.name);
          resUrl = res.logoUrl || base64Data;
          setSettings((prev) => ({
            ...prev,
            website_logo: resUrl,
            logo_url: resUrl,
          }));
          // Sync to localStorage so Angular website header auto-refreshes via storage event
          localStorage.setItem('aura_website_logo', resUrl);
        } else {
          const res = await api.uploadImage(base64Data, key, group);
          resUrl = res.imageUrl || base64Data;
          setSettings((prev) => ({
            ...prev,
            [key]: resUrl,
          }));
        }
        setSuccessMsg(`✅ Logo uploaded & saved! The website header will reflect the new logo immediately.`);
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to upload image');
      } finally {
        setUploadingKey(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Are you sure you want to remove the current logo?')) return;
    setUploadingKey('website_logo');
    try {
      await api.removeLogo();
      setSettings((prev) => ({
        ...prev,
        website_logo: '',
        logo_url: '',
      }));
      setSuccessMsg('Logo removed successfully. Public website will revert to default brand icon.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove logo');
    } finally {
      setUploadingKey(null);
    }
  };

  // Delete any banner image by key — clears from DB and local state
  const handleDeleteBanner = async (key: string, group: string) => {
    if (!window.confirm(`Are you sure you want to delete this banner image? The page will revert to its default background.`)) return;
    setUploadingKey(key);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.updateSettings([{ key, value: '', group }]);
      setSettings((prev) => ({ ...prev, [key]: '' }));
      setSuccessMsg(`✅ Banner deleted successfully. The page will now use its default background.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete banner');
    } finally {
      setUploadingKey(null);
    }
  };

  const currentLogo = settings.website_logo || settings.logo_url || '';

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Hidden File Input used by all image upload buttons */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={24} style={{ color: 'var(--gold-primary)' }} />
            <span>CMS Pages & Dynamic Content</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configure banners, logo, and page text dynamically across Home, About, Services, and Contact pages. All updates reflect instantly on the public website.
          </p>
        </div>

        <a
          href="http://localhost:4200"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
        >
          <ExternalLink size={14} />
          <span>View Public Website</span>
        </a>
      </div>

      {/* Notification Banners */}
      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#34d399',
          fontWeight: 600,
          fontSize: '13.5px',
        }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#fb7185',
          fontWeight: 600,
          fontSize: '13.5px',
        }}>
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="tab-list" style={{ marginBottom: '24px' }}>
        <button
          className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setSearchParams({ group: 'home' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Home size={15} />
          <span>Home Page</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setSearchParams({ group: 'about' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Info size={15} />
          <span>About Page</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'service' ? 'active' : ''}`}
          onClick={() => setSearchParams({ group: 'service' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Briefcase size={15} />
          <span>Services Page</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`}
          onClick={() => setSearchParams({ group: 'contact' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PhoneCall size={15} />
          <span>Contact Page</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'logo' ? 'active' : ''}`}
          onClick={() => setSearchParams({ group: 'logo' })}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Sparkles size={15} />
          <span>Logo & Branding</span>
        </button>
      </div>

      {/* Form Panel */}
      <form onSubmit={handleSave} className="panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px' }}>
          <div className="panel-title" style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--gold-primary)', textTransform: 'uppercase' }}>
              {activeTab === 'home' && 'Home Page CMS & Banners'}
              {activeTab === 'about' && 'About Us Page CMS & Banner'}
              {activeTab === 'service' && 'Services Page CMS & Banner'}
              {activeTab === 'contact' && 'Contact Us Page CMS & Banner'}
              {activeTab === 'logo' && 'Website Logo & Identity CMS'}
            </span>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving || !!uploadingKey}>
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="panel-body" style={{ padding: '24px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading CMS configuration for {activeTab}...
            </div>
          ) : (
            <div>
              {/* ========================================================================= */}
              {/* TAB 1: HOME PAGE CMS */}
              {/* ========================================================================= */}
              {activeTab === 'home' && (
                <div>
                  {/* Hero Banner Box */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={18} color="var(--gold-primary)" />
                      <span>Home Hero Banner & Visuals</span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 320px) 1fr', gap: '20px', alignItems: 'start' }}>
                      {/* Image Preview & Upload Button */}
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Banner Preview:</div>
                        <div style={{
                          width: '100%',
                          height: '160px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#0d1322',
                          border: '1.5px solid var(--border-color)',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {settings.hero_image ? (
                            <img
                              src={settings.hero_image}
                              alt="Hero Banner"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Default Hero Background</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => triggerImageUpload('hero_image', 'home')}
                          disabled={!!uploadingKey}
                          style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                        >
                          <Upload size={14} />
                          <span>{uploadingKey === 'hero_image' ? 'Uploading...' : 'Upload Banner Image'}</span>
                        </button>
                        {settings.hero_image && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner('hero_image', 'home')}
                            disabled={!!uploadingKey}
                            style={{
                              width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center',
                              alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                              color: '#f87171', transition: 'all 0.2s'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>{uploadingKey === 'hero_image' ? 'Deleting...' : 'Delete Banner'}</span>
                          </button>
                        )}
                      </div>

                      {/* Fields */}
                      <div>
                        <div className="form-group">
                          <label className="form-label">Banner Image URL (or paste external URL)</label>
                          <input
                            type="url"
                            className="form-control"
                            value={settings.hero_image || ''}
                            placeholder="https://images.unsplash.com/..."
                            onChange={(e) => handleFieldChange('hero_image', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Hero Badge / Pre-title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={settings.hero_badge || 'Exclusive Pre-Launch'}
                            onChange={(e) => handleFieldChange('hero_badge', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Headlines */}
                  <div className="form-group">
                    <label className="form-label">Hero Main Title / Headline *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.hero_title || settings.hero_headline || "Find a Property You'll Love"}
                      onChange={(e) => {
                        handleFieldChange('hero_title', e.target.value);
                        handleFieldChange('hero_headline', e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hero Subtitle / Description *</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      value={settings.hero_subtitle || settings.hero_subheading || 'Discover residential properties, premium plots, villas and apartments in the locations you prefer.'}
                      onChange={(e) => {
                        handleFieldChange('hero_subtitle', e.target.value);
                        handleFieldChange('hero_subheading', e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Search Bar Placeholder</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.hero_search_placeholder || 'Search by city, luxury community, or RERA plot...'}
                        onChange={(e) => handleFieldChange('hero_search_placeholder', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Hero Starting Price Label</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.hero_price_label || 'Starting at $450,000'}
                        onChange={(e) => handleFieldChange('hero_price_label', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Secondary Call to Action Banner (Above Contact Section) */}
                  <div style={{
                    marginTop: '28px',
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={18} color="var(--gold-primary)" />
                      <span>Footer Pre-Contact CTA Banner (Above Contact Section)</span>
                    </h3>

                    <div className="form-group">
                      <label className="form-label">CTA Banner Headline</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.cta_heading || 'Find Your Next Property Today'}
                        onChange={(e) => handleFieldChange('cta_heading', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CTA Banner Subtitle</label>
                      <textarea
                        rows={2}
                        className="form-control"
                        value={settings.cta_sub || 'Connect with verified sellers, licensed dealers, and ground property scouts across top locations.'}
                        onChange={(e) => handleFieldChange('cta_sub', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">CTA Action Button Text</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.cta_btn_text || 'Explore Properties'}
                        onChange={(e) => handleFieldChange('cta_btn_text', e.target.value)}
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '11.5px', marginTop: '4px', display: 'block' }}>
                        Note: "Post Your Property" has been permanently removed from this banner as requested.
                      </small>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: ABOUT PAGE CMS */}
              {/* ========================================================================= */}
              {activeTab === 'about' && (
                <div>
                  {/* About Banner Box */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={18} color="var(--gold-primary)" />
                      <span>About Page Hero Banner Image</span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 320px) 1fr', gap: '20px', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Banner Preview:</div>
                        <div style={{
                          width: '100%',
                          height: '140px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#0d1322',
                          border: '1.5px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {settings.about_banner_img ? (
                            <img
                              src={settings.about_banner_img}
                              alt="About Banner"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Default Navy Banner</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => triggerImageUpload('about_banner_img', 'about')}
                          disabled={!!uploadingKey}
                          style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                        >
                          <Upload size={14} />
                          <span>{uploadingKey === 'about_banner_img' ? 'Uploading...' : 'Upload About Banner'}</span>
                        </button>
                        {settings.about_banner_img && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner('about_banner_img', 'about')}
                            disabled={!!uploadingKey}
                            style={{
                              width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center',
                              alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                              color: '#f87171', transition: 'all 0.2s'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>{uploadingKey === 'about_banner_img' ? 'Deleting...' : 'Delete Banner'}</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="form-group">
                          <label className="form-label">Banner Image URL</label>
                          <input
                            type="url"
                            className="form-control"
                            value={settings.about_banner_img || ''}
                            placeholder="https://..."
                            onChange={(e) => handleFieldChange('about_banner_img', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Header Tag Badge</label>
                          <input
                            type="text"
                            className="form-control"
                            value={settings.about_tag || 'COMPANY PROFILE'}
                            onChange={(e) => handleFieldChange('about_tag', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">About Page Main Headline *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.about_title || settings.about_headline || 'About AcresBazaar'}
                      onChange={(e) => {
                        handleFieldChange('about_title', e.target.value);
                        handleFieldChange('about_headline', e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hero Subheading / Tagline</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      value={settings.about_description || 'Making Property Discovery Simple, Transparent and Rewarding.'}
                      onChange={(e) => handleFieldChange('about_description', e.target.value)}
                    />
                  </div>

                  {/* Who We Are Story */}
                  <div className="form-group">
                    <label className="form-label">"Who We Are" Lead Statement *</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      value={settings.who_we_are_lead || 'AcresBazaar is a modern real-estate property discovery platform designed to bring buyers, property owners, dealers and property scouts together in one digital ecosystem.'}
                      onChange={(e) => handleFieldChange('who_we_are_lead', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">"Who We Are" Detailed Narrative</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      value={settings.who_we_are_body || 'Our goal is to make discovering properties easier by bringing property opportunities, detailed listings and useful property information into a single platform.'}
                      onChange={(e) => handleFieldChange('who_we_are_body', e.target.value)}
                    />
                  </div>

                  {/* Mission & Vision */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Our Mission Statement</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        value={settings.about_mission || 'To simplify the way people discover and connect with real-estate opportunities while creating better visibility for property owners and new opportunities for property scouts.'}
                        onChange={(e) => handleFieldChange('about_mission', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Our Vision Statement</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        value={settings.about_vision || 'To build a trusted and community-driven property discovery network where every genuine property opportunity can reach the right buyer.'}
                        onChange={(e) => handleFieldChange('about_vision', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 3: SERVICES PAGE CMS */}
              {/* ========================================================================= */}
              {activeTab === 'service' && (
                <div>
                  {/* Services Banner Box */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={18} color="var(--gold-primary)" />
                      <span>Services Page Hero Banner Image</span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 320px) 1fr', gap: '20px', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Banner Preview:</div>
                        <div style={{
                          width: '100%',
                          height: '140px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#0d1322',
                          border: '1.5px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {settings.service_banner_img ? (
                            <img
                              src={settings.service_banner_img}
                              alt="Services Banner"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Default Services Banner</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => triggerImageUpload('service_banner_img', 'service')}
                          disabled={!!uploadingKey}
                          style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                        >
                          <Upload size={14} />
                          <span>{uploadingKey === 'service_banner_img' ? 'Uploading...' : 'Upload Services Banner'}</span>
                        </button>
                        {settings.service_banner_img && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner('service_banner_img', 'service')}
                            disabled={!!uploadingKey}
                            style={{
                              width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center',
                              alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                              color: '#f87171', transition: 'all 0.2s'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>{uploadingKey === 'service_banner_img' ? 'Deleting...' : 'Delete Banner'}</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="form-group">
                          <label className="form-label">Banner Image URL</label>
                          <input
                            type="url"
                            className="form-control"
                            value={settings.service_banner_img || ''}
                            placeholder="https://..."
                            onChange={(e) => handleFieldChange('service_banner_img', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Badge / Category Tag</label>
                          <input
                            type="text"
                            className="form-control"
                            value={settings.services_tag || 'REAL ESTATE SOLUTIONS'}
                            onChange={(e) => handleFieldChange('services_tag', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Services Main Headline *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.service_title || settings.service_overview || 'Our Services'}
                      onChange={(e) => {
                        handleFieldChange('service_title', e.target.value);
                        handleFieldChange('service_overview', e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Services Subheading</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      value={settings.services_subheading || 'Everything you need to discover, list and connect with real-estate opportunities.'}
                      onChange={(e) => handleFieldChange('services_subheading', e.target.value)}
                    />
                  </div>

                  {/* 4 Modular Services */}
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '24px', marginBottom: '12px' }}>
                    Service Offerings (Cards)
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Service 1 (Residential & Plots)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.service_1 || 'Search and discover residential properties, plots, villas, apartments and other real-estate opportunities.'}
                        onChange={(e) => handleFieldChange('service_1', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Service 2 (Gold Property Listings)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.service_2 || 'Discover property opportunities collected through our nationwide Property Scout network.'}
                        onChange={(e) => handleFieldChange('service_2', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Service 3 (Premium Property Listings)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.service_3 || 'Explore detailed properties with comprehensive information, images, and authorized dealer support.'}
                        onChange={(e) => handleFieldChange('service_3', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Service 4 (Property Scout Network)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.service_4 || 'Enable everyday community discoveries to become rewarded real-world property opportunities.'}
                        onChange={(e) => handleFieldChange('service_4', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 4: CONTACT PAGE CMS */}
              {/* ========================================================================= */}
              {activeTab === 'contact' && (
                <div>
                  {/* Contact Banner Box */}
                  <div style={{
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '24px'
                  }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={18} color="var(--gold-primary)" />
                      <span>Contact Page Hero Banner Image</span>
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 320px) 1fr', gap: '20px', alignItems: 'start' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Banner Preview:</div>
                        <div style={{
                          width: '100%',
                          height: '140px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#0d1322',
                          border: '1.5px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {settings.contact_banner_img ? (
                            <img
                              src={settings.contact_banner_img}
                              alt="Contact Banner"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Default Contact Banner</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => triggerImageUpload('contact_banner_img', 'contact')}
                          disabled={!!uploadingKey}
                          style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                        >
                          <Upload size={14} />
                          <span>{uploadingKey === 'contact_banner_img' ? 'Uploading...' : 'Upload Contact Banner'}</span>
                        </button>
                        {settings.contact_banner_img && (
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner('contact_banner_img', 'contact')}
                            disabled={!!uploadingKey}
                            style={{
                              width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center',
                              alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)',
                              color: '#f87171', transition: 'all 0.2s'
                            }}
                          >
                            <Trash2 size={13} />
                            <span>{uploadingKey === 'contact_banner_img' ? 'Deleting...' : 'Delete Banner'}</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <div className="form-group">
                          <label className="form-label">Banner Image URL</label>
                          <input
                            type="url"
                            className="form-control"
                            value={settings.contact_banner_img || ''}
                            placeholder="https://..."
                            onChange={(e) => handleFieldChange('contact_banner_img', e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Badge / Sub-label</label>
                          <input
                            type="text"
                            className="form-control"
                            value={settings.contact_tag || 'SUPPORT & INQUIRIES'}
                            onChange={(e) => handleFieldChange('contact_tag', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Page Headline *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.contact_title || 'Get In Touch With AcresBazaar'}
                      onChange={(e) => handleFieldChange('contact_title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Subtitle</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      value={settings.contact_subtitle || 'Have questions about property listings, buyer plans, or spotter rewards? Our team is here to assist you 24/7.'}
                      onChange={(e) => handleFieldChange('contact_subtitle', e.target.value)}
                    />
                  </div>

                  {/* Operational Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Support Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        value={settings.contact_email || 'support@acresbazaar.com'}
                        onChange={(e) => handleFieldChange('contact_email', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Helpline Phone Number *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.contact_phone || '+91 8000-123-456'}
                        onChange={(e) => handleFieldChange('contact_phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Corporate Office Address *</label>
                    <textarea
                      rows={2}
                      className="form-control"
                      value={settings.contact_address || 'Executive Tower 4, Central Business District, Bengaluru, KA 560001'}
                      onChange={(e) => handleFieldChange('contact_address', e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Operating Hours</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.contact_hours || 'Mon - Sat: 9:00 AM - 7:30 PM IST'}
                        onChange={(e) => handleFieldChange('contact_hours', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">WhatsApp Helpline / Chat</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.contact_whatsapp || '+91 8000-123-456'}
                        onChange={(e) => handleFieldChange('contact_whatsapp', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 5: LOGO & BRANDING CMS */}
              {/* ========================================================================= */}
              {activeTab === 'logo' && (
                <div>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Public Website Brand Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.brand_name || settings.website_name || 'AcresBazaar'}
                      onChange={(e) => {
                        handleFieldChange('brand_name', e.target.value);
                        handleFieldChange('website_name', e.target.value);
                      }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label">Brand Tagline / Subtitle</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.brand_sub || 'PREMIUM PROPERTIES'}
                      onChange={(e) => handleFieldChange('brand_sub', e.target.value)}
                    />
                  </div>

                  {/* Logo Management Box */}
                  <div style={{
                    padding: '24px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '24px'
                  }}>
                    <label className="form-label" style={{ fontSize: '14px', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={18} color="var(--gold-primary)" />
                      <span>Official Brand Logo (Header & Footer)</span>
                    </label>

                    {/* Current Logo Preview */}
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Current Logo Preview:</div>
                      {currentLogo ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '16px 24px',
                          background: '#ffffff',
                          borderRadius: '10px',
                          border: '2px solid rgba(245, 158, 11, 0.4)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                          <img
                            src={currentLogo}
                            alt="Current Brand Logo"
                            style={{ maxHeight: '60px', maxWidth: '240px', objectFit: 'contain' }}
                            onError={(e: any) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          padding: '20px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px dashed var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-muted)',
                          fontSize: '13px'
                        }}>
                          No custom logo uploaded. Default brand icon is active on Public Website header and footer.
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => triggerImageUpload('website_logo', 'logo')}
                        disabled={uploadingKey === 'website_logo'}
                      >
                        <Upload size={16} />
                        <span>{uploadingKey === 'website_logo' ? 'Uploading Logo...' : currentLogo ? 'Replace Logo Image' : 'Upload Logo Image'}</span>
                      </button>

                      {currentLogo && (
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={handleRemoveLogo}
                          disabled={uploadingKey === 'website_logo'}
                        >
                          <Trash2 size={16} />
                          <span>Remove Logo</span>
                        </button>
                      )}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Or Paste Direct Logo Image URL:</label>
                      <input
                        type="url"
                        className="form-control"
                        value={settings.website_logo || ''}
                        placeholder="https://..."
                        onChange={(e) => {
                          handleFieldChange('website_logo', e.target.value);
                          handleFieldChange('logo_url', e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="panel-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving || !!uploadingKey}>
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
