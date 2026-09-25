import { 
  AdminUser, 
  Customer, 
  Property, 
  Category, 
  Plan, 
  Reward, 
  Report, 
  VerifiedPartner, 
  DashboardStats, 
  ChatConversation, 
  ChatMessage,
  CalendarEvent, 
  WebsiteSetting,
  PropertyBooking 
} from '../types';
import {
  DEMO_ADMIN_USER,
  DEMO_STATS,
  DEMO_CHATS,
  DEMO_CUSTOMERS,
  DEMO_PROPERTIES,
  DEMO_CATEGORIES,
  DEMO_PLANS,
  DEMO_REWARDS,
  DEMO_REPORTS,
  DEMO_PARTNERS,
  DEMO_BOOKINGS,
  DEMO_SETTINGS,
  DEMO_CALENDAR_EVENTS
} from './mockData';

// Prefer configured VITE_API_URL or live Render cloud backend
const API_BASE = (
  (import.meta as any).env?.VITE_API_URL ||
  (typeof window !== 'undefined' && (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1'))
    ? 'https://acresbazaar-backend.onrender.com/api'
    : '/api')
).replace(/\/$/, '');

export function isDemoSession(): boolean {
  return localStorage.getItem('admin_is_demo') === 'true' || 
         localStorage.getItem('admin_token')?.startsWith('demo_') === true;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    // If relative proxy failed or threw network error, attempt direct port 5001 fallback
    if (API_BASE !== 'http://localhost:5001/api') {
      try {
        res = await fetch(`http://localhost:5001/api${endpoint}`, {
          ...options,
          headers,
        });
      } catch {
        throw new Error('BACKEND_OFFLINE: Unable to connect to Backend Server (port 5001). Please ensure backend is running (run-backend.bat).');
      }
    } else {
      throw new Error('BACKEND_OFFLINE: Unable to connect to Backend Server (port 5001). Please ensure backend is running (run-backend.bat).');
    }
  }

  // Handle gateway errors from Vite proxy when backend is down
  if (res.status === 502 || res.status === 504) {
    throw new Error('BACKEND_OFFLINE: Backend API is not responding on port 5001. Please make sure the backend server is running (run-backend.bat).');
  }

  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_is_demo');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.statusText}`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Check live connection to backend server
  async checkBackendHealth(): Promise<{ ok: boolean; message?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      
      const res = await fetch(`${API_BASE}/settings`, { 
        signal: controller.signal 
      }).catch(async () => {
        return await fetch('http://localhost:5001/api/settings', { signal: controller.signal });
      });

      clearTimeout(timeoutId);
      return { ok: res.ok || res.status === 401 || res.status === 200 };
    } catch (err: any) {
      return { ok: false, message: err.message };
    }
  },

  // Instant Demo Login
  loginDemo(): { access_token: string; user: AdminUser } {
    localStorage.setItem('admin_token', 'demo_super_admin_token_2026');
    localStorage.setItem('admin_user', JSON.stringify(DEMO_ADMIN_USER));
    localStorage.setItem('admin_is_demo', 'true');
    return {
      access_token: 'demo_super_admin_token_2026',
      user: DEMO_ADMIN_USER,
    };
  },

  // Auth
  async login(email: string, password: string): Promise<{ access_token: string; user: AdminUser }> {
    localStorage.removeItem('admin_is_demo');
    const res: any = await request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return {
      access_token: res.token || res.access_token,
      user: res.admin || res.user,
    };
  },

  async getMe(): Promise<AdminUser> {
    if (isDemoSession()) return DEMO_ADMIN_USER;
    const res: any = await request('/auth/admin/me');
    return res.admin || res;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (isDemoSession()) {
      return { success: true, message: 'Password updated successfully (Demo Mode).' };
    }
    return request('/auth/admin/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    if (isDemoSession()) return DEMO_STATS;
    try {
      const res: any = await request('/dashboard/stats');
      return res.stats || DEMO_STATS;
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) {
        console.warn('Backend offline, displaying demo stats');
        return DEMO_STATS;
      }
      throw err;
    }
  },

  async getRecentChats(): Promise<ChatConversation[]> {
    if (isDemoSession()) return DEMO_CHATS;
    try {
      const res: any = await request('/chats/recent');
      return res.chats || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_CHATS;
      throw err;
    }
  },

  async getCalendarEvents(monthStr?: string): Promise<CalendarEvent[]> {
    if (isDemoSession()) return DEMO_CALENDAR_EVENTS;
    try {
      let q = '';
      if (monthStr && monthStr.includes('-')) {
        const [year, month] = monthStr.split('-');
        q = `?year=${year}&month=${month}`;
      }
      const res: any = await request(`/calendar${q}`);
      const events = res.events || [];
      return events.map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.eventDate ? e.eventDate.slice(0, 10) : '',
        type: e.eventType || 'REMINDER',
        completed: !!e.isCompleted
      }));
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_CALENDAR_EVENTS;
      throw err;
    }
  },

  async createCalendarEvent(data: { title: string; date: string; type?: string }): Promise<CalendarEvent> {
    if (isDemoSession()) {
      return {
        id: `demo-evt-${Date.now()}`,
        title: data.title,
        date: data.date,
        type: (data.type as any) || 'REMINDER',
        completed: false
      };
    }
    const res: any = await request('/calendar', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        eventDate: data.date,
        eventType: data.type || 'REMINDER'
      }),
    });
    const e = res.event || res;
    return {
      id: e.id,
      title: e.title,
      date: e.eventDate ? e.eventDate.slice(0, 10) : '',
      type: e.eventType || 'REMINDER',
      completed: !!e.isCompleted
    };
  },

  async toggleCalendarEvent(id: string): Promise<CalendarEvent> {
    if (isDemoSession()) {
      const found = DEMO_CALENDAR_EVENTS.find(e => e.id === id);
      if (found) found.completed = !found.completed;
      return found || DEMO_CALENDAR_EVENTS[0];
    }
    const res: any = await request(`/calendar/${id}/toggle`, {
      method: 'PATCH',
    });
    const e = res.event || res;
    return {
      id: e.id,
      title: e.title,
      date: e.eventDate ? e.eventDate.slice(0, 10) : '',
      type: e.eventType || 'REMINDER',
      completed: !!e.isCompleted
    };
  },

  // Customers
  async getCustomers(params?: { role?: string; isNew?: boolean; search?: string }): Promise<Customer[]> {
    if (isDemoSession()) {
      let list = [...DEMO_CUSTOMERS];
      if (params?.role) list = list.filter(c => c.role === params.role);
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
      }
      return list;
    }
    try {
      const query = new URLSearchParams();
      if (params?.role) query.set('role', params.role);
      if (params?.isNew !== undefined) query.set('isNew', String(params.isNew));
      if (params?.search) query.set('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const res: any = await request(`/customers${qs}`);
      const list = res.customers || [];
      return list.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile || '',
        role: u.role || 'BUYER',
        status: u.isActive ? 'ACTIVE' : 'INACTIVE',
        planType: u.planType || 'STANDARD',
        agencyName: u.agencyName || null,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        propertiesCount: u._count?.properties || 0,
      }));
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_CUSTOMERS;
      throw err;
    }
  },

  async getCustomer(id: string): Promise<Customer> {
    if (isDemoSession()) {
      return DEMO_CUSTOMERS.find(c => c.id === id) || DEMO_CUSTOMERS[0];
    }
    const res: any = await request(`/customers/${id}`);
    const u = res.customer || res;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile || '',
      role: u.role || 'BUYER',
      status: u.isActive ? 'ACTIVE' : 'INACTIVE',
      planType: u.planType || 'STANDARD',
      agencyName: u.agencyName || null,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      properties: u.properties || [],
      propertiesCount: u.properties?.length || u._count?.properties || 0,
    };
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    if (isDemoSession()) {
      const c = DEMO_CUSTOMERS.find(item => item.id === id) || DEMO_CUSTOMERS[0];
      Object.assign(c, data);
      return c;
    }
    const res: any = await request(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.customer || res;
  },

  async toggleCustomerStatus(id: string, status: string): Promise<Customer> {
    if (isDemoSession()) {
      const c = DEMO_CUSTOMERS.find(item => item.id === id) || DEMO_CUSTOMERS[0];
      c.status = status as any;
      return c;
    }
    const res: any = await request(`/customers/${id}/toggle-status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.customer || res;
  },

  async deleteCustomer(id: string): Promise<{ success: boolean }> {
    if (isDemoSession()) return { success: true };
    return request(`/customers/${id}`, {
      method: 'DELETE',
    });
  },

  // Properties
  async getProperties(params?: { status?: string; category?: string; planType?: string; search?: string }): Promise<Property[]> {
    if (isDemoSession()) {
      let list = [...DEMO_PROPERTIES];
      if (params?.status) list = list.filter(p => p.status === params.status);
      if (params?.category) list = list.filter(p => p.category === params.category);
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(p => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
      }
      return list;
    }
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.category) query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const res: any = await request(`/properties/admin/all${qs}`);
      const list = res.properties || [];
      return list.map((p: any) => {
        let parsedSpecs: Record<string, any> = {};
        try {
          if (typeof p.categorySpecs === 'string') {
            parsedSpecs = JSON.parse(p.categorySpecs);
          } else if (p.categorySpecs && typeof p.categorySpecs === 'object') {
            parsedSpecs = p.categorySpecs;
          }
        } catch {}

        const sellerDisplayName = p.sellerName || p.seller?.name || 'Registered Seller';
        const sellerDisplayPhone = p.sellerPhone || p.seller?.mobile || '';
        const sellerDisplayEmail = p.sellerEmail || p.seller?.email || '';

        return {
          id: p.id,
          title: p.title,
          description: p.description || '',
          category: p.category,
          location: p.location,
          city: p.city || '',
          address: p.address || p.location || '',
          price: p.price,
          priceDisplay: p.priceDisplay || (p.price ? `₹${p.price.toLocaleString('en-IN')}` : ''),
          status: p.status,
          planType: p.planType || 'PLATINUM',
          isPublished: p.status === 'APPROVED',
          featured: false,
          sellerId: p.sellerId || p.seller?.id,
          sellerName: sellerDisplayName,
          sellerPhone: sellerDisplayPhone,
          sellerEmail: sellerDisplayEmail,
          sellerContact: sellerDisplayPhone ? `${sellerDisplayName} (${sellerDisplayPhone})` : sellerDisplayName,
          categorySpecs: parsedSpecs,
          specs: parsedSpecs,
          owner: p.seller || (sellerDisplayName ? {
            id: p.sellerId || 'seller',
            name: sellerDisplayName,
            email: sellerDisplayEmail,
            mobile: sellerDisplayPhone,
            role: 'SELLER'
          } : null),
          images: (p.images || []).map((img: any) => ({
            id: img.id,
            url: img.imageUrl,
            isCover: img.isPrimary,
            order: img.displayOrder
          })),
          createdAt: p.createdAt,
          updatedAt: p.updatedAt || p.createdAt
        };
      });
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_PROPERTIES;
      throw err;
    }
  },

  async getSnapProperties(params?: { status?: string; search?: string }): Promise<Property[]> {
    if (isDemoSession()) {
      return DEMO_PROPERTIES.filter(p => p.planType !== 'PLATINUM');
    }
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      query.set('isSnap', 'true');
      const qs = query.toString() ? `?${query.toString()}` : '';
      const res: any = await request(`/properties/admin/all${qs}`);
      const list = res.properties || [];
      return list.map((p: any) => {
        let parsedSpecs: Record<string, any> = {};
        try {
          if (typeof p.categorySpecs === 'string') {
            parsedSpecs = JSON.parse(p.categorySpecs);
          } else if (p.categorySpecs && typeof p.categorySpecs === 'object') {
            parsedSpecs = p.categorySpecs;
          }
        } catch {}

        const sellerDisplayName = p.sellerName || p.seller?.name || 'Spotter (Common People)';
        const sellerDisplayPhone = p.sellerPhone || p.seller?.mobile || '';
        const sellerDisplayEmail = p.sellerEmail || p.seller?.email || '';

        return {
          id: p.id,
          title: p.title,
          description: p.description || '',
          category: p.category,
          location: p.location,
          city: p.city || '',
          address: p.address || p.location || '',
          price: p.price,
          priceDisplay: p.priceDisplay || (p.price ? `₹${p.price.toLocaleString('en-IN')}` : ''),
          status: p.status,
          planType: p.planType || 'PLATINUM',
          isPublished: p.status === 'APPROVED',
          featured: false,
          sellerId: p.sellerId || p.seller?.id,
          sellerName: sellerDisplayName,
          sellerPhone: sellerDisplayPhone,
          sellerEmail: sellerDisplayEmail,
          categorySpecs: parsedSpecs,
          specs: parsedSpecs,
          images: (p.images || []).map((img: any) => ({
            id: img.id,
            url: img.imageUrl || img.url,
            isCover: !!img.isPrimary,
            order: img.displayOrder || 0
          })),
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      });
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_PROPERTIES.filter(p => p.planType !== 'PLATINUM');
      throw err;
    }
  },

  async getProperty(id: string): Promise<Property> {
    if (isDemoSession()) {
      return DEMO_PROPERTIES.find(p => p.id === id) || DEMO_PROPERTIES[0];
    }
    const res: any = await request(`/properties/${id}`);
    const p = res.property || res;
    let parsedSpecs: Record<string, any> = {};
    try {
      if (typeof p.categorySpecs === 'string') {
        parsedSpecs = JSON.parse(p.categorySpecs);
      } else if (p.categorySpecs && typeof p.categorySpecs === 'object') {
        parsedSpecs = p.categorySpecs;
      }
    } catch {}

    const sellerDisplayName = p.sellerName || p.seller?.name || 'Registered Seller';
    const sellerDisplayPhone = p.sellerPhone || p.seller?.mobile || '';
    const sellerDisplayEmail = p.sellerEmail || p.seller?.email || '';

    return {
      id: p.id,
      title: p.title,
      description: p.description || '',
      category: p.category,
      location: p.location,
      city: p.city || '',
      address: p.address || p.location || '',
      price: p.price,
      priceDisplay: p.priceDisplay || (p.price ? `₹${p.price.toLocaleString('en-IN')}` : ''),
      status: p.status,
      planType: p.planType || 'PLATINUM',
      isPublished: p.status === 'APPROVED',
      featured: false,
      sellerId: p.sellerId || p.seller?.id,
      sellerName: sellerDisplayName,
      sellerPhone: sellerDisplayPhone,
      sellerEmail: sellerDisplayEmail,
      sellerContact: sellerDisplayPhone ? `${sellerDisplayName} (${sellerDisplayPhone})` : sellerDisplayName,
      categorySpecs: parsedSpecs,
      specs: parsedSpecs,
      owner: p.seller || (sellerDisplayName ? {
        id: p.sellerId || 'seller',
        name: sellerDisplayName,
        email: sellerDisplayEmail,
        mobile: sellerDisplayPhone,
        role: 'SELLER'
      } : null),
      images: (p.images || []).map((img: any) => ({
        id: img.id,
        url: img.imageUrl,
        isCover: img.isPrimary,
        order: img.displayOrder
      })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt || p.createdAt
    };
  },

  async createProperty(data: any): Promise<Property> {
    if (isDemoSession()) {
      const newProp: Property = {
        id: `demo-prop-${Date.now()}`,
        title: data.title || 'Demo Property',
        description: data.description || '',
        category: data.category || 'Villas',
        location: data.location || 'Bangalore',
        city: data.city || 'Bangalore',
        price: data.price || 10000000,
        priceDisplay: `₹ ${(data.price || 10000000).toLocaleString('en-IN')}`,
        status: 'PENDING',
        planType: data.planType || 'PLATINUM',
        isPublished: false,
        featured: false,
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DEMO_PROPERTIES.unshift(newProp);
      return newProp;
    }
    const res: any = await request('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.property || res;
  },

  async updateProperty(id: string, data: any): Promise<Property> {
    if (isDemoSession()) {
      const p = DEMO_PROPERTIES.find(item => item.id === id) || DEMO_PROPERTIES[0];
      Object.assign(p, data);
      return p;
    }
    const res: any = await request(`/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.property || res;
  },

  async updatePropertyStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HOLD', planType?: 'GOLD' | 'PLATINUM' | 'PREMIUM'): Promise<Property> {
    if (isDemoSession()) {
      const p = DEMO_PROPERTIES.find(item => item.id === id) || DEMO_PROPERTIES[0];
      p.status = status;
      if (planType) p.planType = planType as any;
      p.isPublished = status === 'APPROVED';
      return p;
    }
    const res: any = await request(`/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, planType }),
    });
    return res.property || res;
  },

  async togglePublishProperty(id: string, isPublished: boolean): Promise<Property> {
    const status = isPublished ? 'HOLD' : 'APPROVED';
    return this.updatePropertyStatus(id, status);
  },

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    if (isDemoSession()) return { success: true };
    return request(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // Property Bookings (Buyers & Dealers)
  async getBookings(params?: { role?: string; planType?: string; search?: string; status?: string }): Promise<PropertyBooking[]> {
    if (isDemoSession()) return DEMO_BOOKINGS;
    try {
      const query = new URLSearchParams();
      if (params?.role && params.role !== 'ALL') query.set('role', params.role);
      if (params?.planType && params.planType !== 'ALL') query.set('planType', params.planType);
      if (params?.status && params.status !== 'ALL') query.set('status', params.status);
      if (params?.search && params.search.trim()) query.set('search', params.search.trim());
      const qs = query.toString() ? `?${query.toString()}` : '';
      const res: any = await request(`/properties/admin/bookings${qs}`);
      return res.bookings || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_BOOKINGS;
      throw err;
    }
  },

  async updateBookingStatus(id: string, status: string): Promise<PropertyBooking> {
    if (isDemoSession()) {
      const b = DEMO_BOOKINGS.find(item => item.id === id) || DEMO_BOOKINGS[0];
      b.bookingStatus = status as any;
      return b;
    }
    const res: any = await request(`/properties/admin/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.booking || res;
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    if (isDemoSession()) return DEMO_CATEGORIES;
    try {
      const res: any = await request('/categories');
      return res.categories || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_CATEGORIES;
      throw err;
    }
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    if (isDemoSession()) {
      const newCat: Category = {
        id: `demo-cat-${Date.now()}`,
        name: data.name || 'New Category',
        slug: data.slug || `cat-${Date.now()}`,
        description: data.description || '',
        isActive: true,
        displayOrder: DEMO_CATEGORIES.length + 1,
        createdAt: new Date().toISOString()
      };
      DEMO_CATEGORIES.push(newCat);
      return newCat;
    }
    const res: any = await request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.category || res;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    if (isDemoSession()) {
      const c = DEMO_CATEGORIES.find(item => item.id === id) || DEMO_CATEGORIES[0];
      Object.assign(c, data);
      return c;
    }
    const res: any = await request(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.category || res;
  },

  async deleteCategory(id: string): Promise<{ success: boolean }> {
    if (isDemoSession()) return { success: true };
    return request(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // Plans
  async getPlans(): Promise<Plan[]> {
    if (isDemoSession()) return DEMO_PLANS;
    try {
      const res: any = await request('/plans');
      return res.plans || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_PLANS;
      throw err;
    }
  },

  async updatePlan(id: string, data: Partial<Plan>): Promise<Plan> {
    if (isDemoSession()) {
      const p = DEMO_PLANS.find(item => item.id === id) || DEMO_PLANS[0];
      Object.assign(p, data);
      return p;
    }
    const res: any = await request(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.plan || res;
  },

  // Rewards
  async getRewards(status?: string): Promise<Reward[]> {
    if (isDemoSession()) return DEMO_REWARDS;
    try {
      const q = status ? `?status=${status}` : '';
      const res: any = await request(`/rewards${q}`);
      return res.rewards || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_REWARDS;
      throw err;
    }
  },

  async updateRewardStatus(id: string, status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED'): Promise<Reward> {
    if (isDemoSession()) {
      const r = DEMO_REWARDS.find(item => item.id === id) || DEMO_REWARDS[0];
      r.status = status;
      return r;
    }
    const res: any = await request(`/rewards/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.reward || res;
  },

  // Reports
  async getReports(status?: string): Promise<Report[]> {
    if (isDemoSession()) return DEMO_REPORTS;
    try {
      const q = status ? `?status=${status}` : '';
      const res: any = await request(`/reports${q}`);
      return res.reports || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_REPORTS;
      throw err;
    }
  },

  async updateReportStatus(id: string, status: 'PENDING' | 'RESOLVED' | 'REJECTED'): Promise<Report> {
    if (isDemoSession()) {
      return { id, category: 'General', reason: 'Review', description: '', status, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    }
    const res: any = await request(`/reports/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.report || res;
  },

  // Verified Partners
  async getPartners(status?: string): Promise<VerifiedPartner[]> {
    if (isDemoSession()) return DEMO_PARTNERS;
    try {
      const q = status ? `?status=${status}` : '';
      const res: any = await request(`/partners${q}`);
      return res.partners || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_PARTNERS;
      throw err;
    }
  },

  async updatePartnerStatus(id: string, status: 'PENDING' | 'VERIFIED' | 'REJECTED'): Promise<VerifiedPartner> {
    if (isDemoSession()) {
      const p = DEMO_PARTNERS.find(item => item.id === id) || DEMO_PARTNERS[0];
      p.status = status;
      return p;
    }
    const res: any = await request(`/partners/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.partner || res;
  },

  // Dealer Tracking & Management (Bookings, Listings, Rewards)
  async getDealerBookings(planType?: string, search?: string): Promise<PropertyBooking[]> {
    if (isDemoSession()) return DEMO_BOOKINGS;
    try {
      const params = new URLSearchParams();
      if (planType && planType !== 'ALL') params.set('planType', planType);
      if (search && search.trim()) params.set('search', search.trim());
      const query = params.toString() ? `?${params.toString()}` : '';
      const res: any = await request(`/properties/admin/bookings${query}`);
      return res.bookings || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_BOOKINGS;
      throw err;
    }
  },

  async getDealerListings(status?: string, search?: string): Promise<Property[]> {
    if (isDemoSession()) return DEMO_PROPERTIES;
    try {
      const params = new URLSearchParams({ role: 'DEALER' });
      if (status && status !== 'ALL') params.set('status', status);
      if (search && search.trim()) params.set('search', search.trim());
      const res: any = await request(`/properties/admin/all?${params.toString()}`);
      return res.properties || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_PROPERTIES;
      throw err;
    }
  },

  async getDealerRewards(status?: string): Promise<Reward[]> {
    if (isDemoSession()) return DEMO_REWARDS;
    try {
      const params = new URLSearchParams({ role: 'DEALER' });
      if (status && status !== 'ALL') params.set('status', status);
      const res: any = await request(`/rewards?${params.toString()}`);
      return res.rewards || [];
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) return DEMO_REWARDS;
      throw err;
    }
  },

  // Website Settings
  async getSettings(group?: string): Promise<WebsiteSetting[]> {
    if (isDemoSession()) {
      return group ? DEMO_SETTINGS.filter(s => s.group === group) : DEMO_SETTINGS;
    }
    try {
      const endpoint = group ? `/settings/group/${group}` : '/settings';
      const res: any = await request(endpoint);
      const list = res.list || (Array.isArray(res.settings) ? res.settings : []);
      return list.map((s: any) => ({
        id: s.id,
        key: s.key,
        value: s.value,
        group: s.group,
        description: s.description || null
      }));
    } catch (err: any) {
      if (err.message?.includes('BACKEND_OFFLINE')) {
        return group ? DEMO_SETTINGS.filter(s => s.group === group) : DEMO_SETTINGS;
      }
      throw err;
    }
  },

  async updateSettings(settings: { key: string; value: string; group?: string }[]): Promise<{ success: boolean }> {
    return request('/settings', {
      method: 'POST',
      body: JSON.stringify({ items: settings }),
    });
  },

  async uploadLogo(image: string, fileName?: string): Promise<{ success: boolean; logoUrl: string }> {
    return request('/settings/upload-logo', {
      method: 'POST',
      body: JSON.stringify({ image, fileName }),
    });
  },

  async uploadImage(image: string, key: string, group: string = 'home'): Promise<{ success: boolean; imageUrl: string }> {
    return request('/settings/upload-image', {
      method: 'POST',
      body: JSON.stringify({ image, key, group }),
    });
  },

  async removeLogo(): Promise<{ success: boolean; logoUrl: string }> {
    return request('/settings/logo', {
      method: 'DELETE',
    });
  },

  // Chats
  async getChat(id: string): Promise<ChatConversation> {
    const res: any = await request(`/chats/${id}`);
    const c = res.chat || res;
    return {
      id: c.id,
      userName: c.userName,
      userEmail: c.userEmail,
      lastMessage: c.lastMessage || '',
      lastMessageAt: c.lastMessageAt || c.createdAt,
      unread: c.unread !== undefined ? c.unread : true,
      propertyTitle: c.propertyTitle,
      messages: (c.messages || []).map((m: any) => ({
        id: m.id,
        senderId: m.senderId || 'user',
        senderName: m.senderRole === 'admin' ? 'Admin Executive' : c.userName,
        senderRole: m.senderRole === 'admin' ? 'ADMIN' : 'USER',
        message: m.message,
        createdAt: m.createdAt
      }))
    };
  },

  async sendChatMessage(conversationId: string, message: string): Promise<ChatMessage> {
    const res: any = await request(`/chats/${conversationId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ text: message }),
    });
    const msg = res.message || res;
    return {
      id: msg.id,
      senderId: 'admin',
      senderName: 'Admin Executive',
      senderRole: 'ADMIN',
      message: msg.message,
      createdAt: msg.createdAt
    };
  },

  // Export URLs
  getExportUrl(entity: string, format: 'csv' | 'pdf', filter?: string): string {
    const token = localStorage.getItem('admin_token') || '';
    const q = new URLSearchParams({ token, format });
    if (filter) q.set('filter', filter);
    return `${API_BASE}/export/${entity}?${q.toString()}`;
  },
};
