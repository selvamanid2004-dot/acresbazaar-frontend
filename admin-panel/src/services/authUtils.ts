import { AdminUser } from '../types';

export function getCurrentAdminUser(): AdminUser | null {
  try {
    const str = localStorage.getItem('admin_user');
    if (!str) return null;
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function hasModulePermission(user: AdminUser | null, moduleKey: string): boolean {
  if (!user) return false;
  
  // Super Admin has complete and unrestricted access to all modules
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  const perms = user.permissions || [];

  // Direct match
  if (perms.includes(moduleKey)) {
    return true;
  }

  // Hierarchical / Parent permission mappings:
  // Customers group
  if (moduleKey === 'customers' && (
    perms.includes('buyers') ||
    perms.includes('sellers') ||
    perms.includes('dealers') ||
    perms.includes('common_people') ||
    perms.includes('staff_management')
  )) {
    return true;
  }
  if (moduleKey === 'buyers' && perms.includes('customers')) return true;
  if (moduleKey === 'sellers' && perms.includes('customers')) return true;
  if (moduleKey === 'dealers' && perms.includes('customers')) return true;
  if (moduleKey === 'common_people' && perms.includes('customers')) return true;

  // Properties group
  if (moduleKey === 'properties' && (
    perms.includes('gold_properties') ||
    perms.includes('premium_properties') ||
    perms.includes('snap_properties') ||
    perms.includes('bookings')
  )) {
    return true;
  }
  if (moduleKey === 'gold_properties' && perms.includes('properties')) return true;
  if (moduleKey === 'premium_properties' && perms.includes('properties')) return true;
  if (moduleKey === 'snap_properties' && perms.includes('properties')) return true;
  if (moduleKey === 'bookings' && perms.includes('properties')) return true;

  // CMS & Settings group
  if (moduleKey === 'website_settings' && (
    perms.includes('contact_details') ||
    perms.includes('logo_management')
  )) {
    return true;
  }
  if (moduleKey === 'contact_details' && perms.includes('website_settings')) return true;
  if (moduleKey === 'logo_management' && perms.includes('website_settings')) return true;

  return false;
}

// Find the first authorized route for an admin/staff to redirect safely
export function getUserFirstAllowedRoute(user: AdminUser | null): string {
  if (!user) return '/login';
  if (user.role === 'SUPER_ADMIN') return '/dashboard';

  const routeMap: { key: string; route: string }[] = [
    { key: 'dashboard', route: '/dashboard' },
    { key: 'properties', route: '/properties' },
    { key: 'buyers', route: '/customers?tab=buyers' },
    { key: 'sellers', route: '/customers?tab=sellers' },
    { key: 'dealers', route: '/customers?tab=dealers' },
    { key: 'common_people', route: '/customers?tab=common' },
    { key: 'customers', route: '/customers' },
    { key: 'bookings', route: '/bookings' },
    { key: 'snap_properties', route: '/snap-properties' },
    { key: 'categories', route: '/categories' },
    { key: 'reports', route: '/reports' },
    { key: 'rewards', route: '/rewards' },
    { key: 'website_settings', route: '/website-settings' },
    { key: 'plans', route: '/plan-management' },
    { key: 'verified_partners', route: '/verified-partners' },
    { key: 'data_export', route: '/data-export' },
    { key: 'staff_management', route: '/staff-management' },
    { key: 'change_password', route: '/change-password' },
  ];

  for (const item of routeMap) {
    if (hasModulePermission(user, item.key)) {
      return item.route;
    }
  }

  return '/change-password';
}

export function getRoleBadgeStyle(role: string) {
  switch (role?.toUpperCase()) {
    case 'SUPER_ADMIN':
      return {
        label: 'Super Admin',
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.2))',
        color: '#fbbf24',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        tagBg: '#d97706'
      };
    case 'ADMIN':
    case 'ADMINISTRATOR':
      return {
        label: 'Administrator',
        bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.2))',
        color: '#60a5fa',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        tagBg: '#2563eb'
      };
    case 'STAFF':
    default:
      return {
        label: 'Staff Member',
        bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.2))',
        color: '#34d399',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        tagBg: '#059669'
      };
  }
}
