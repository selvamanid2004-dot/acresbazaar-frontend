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

/**
 * Check if the user has access to a top-level module
 */
export function hasModulePermission(user: AdminUser | null, moduleKey: string): boolean {
  if (!user) return false;
  
  // Super Admin has complete and unrestricted access to all modules
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  const perms = user.permissions || [];

  // Direct match for module or any action inside the module
  if (perms.includes(moduleKey) || perms.some(p => p.startsWith(`${moduleKey}.`))) {
    return true;
  }

  // Hierarchical / Parent permission mappings:
  // Customers group
  if (moduleKey === 'customers' && (
    perms.includes('buyers') || perms.some(p => p.startsWith('buyers.')) ||
    perms.includes('sellers') || perms.some(p => p.startsWith('sellers.')) ||
    perms.includes('dealers') || perms.some(p => p.startsWith('dealers.')) ||
    perms.includes('common_people') || perms.some(p => p.startsWith('common_people.')) ||
    perms.includes('staff_management') || perms.some(p => p.startsWith('staff_management.'))
  )) {
    return true;
  }
  if (moduleKey === 'buyers' && (perms.includes('customers') || perms.some(p => p.startsWith('customers.')))) return true;
  if (moduleKey === 'sellers' && (perms.includes('customers') || perms.some(p => p.startsWith('customers.')))) return true;
  if (moduleKey === 'dealers' && (perms.includes('customers') || perms.some(p => p.startsWith('customers.')))) return true;
  if (moduleKey === 'common_people' && (perms.includes('customers') || perms.some(p => p.startsWith('customers.')))) return true;

  // Properties group
  if (moduleKey === 'properties' && (
    perms.includes('gold_properties') || perms.some(p => p.startsWith('gold_properties.')) ||
    perms.includes('premium_properties') || perms.some(p => p.startsWith('premium_properties.')) ||
    perms.includes('snap_properties') || perms.some(p => p.startsWith('snap_properties.')) ||
    perms.includes('bookings') || perms.some(p => p.startsWith('bookings.'))
  )) {
    return true;
  }
  if (moduleKey === 'gold_properties' && (perms.includes('properties') || perms.some(p => p.startsWith('properties.')))) return true;
  if (moduleKey === 'premium_properties' && (perms.includes('properties') || perms.some(p => p.startsWith('properties.')))) return true;
  if (moduleKey === 'snap_properties' && (perms.includes('properties') || perms.some(p => p.startsWith('properties.')))) return true;
  if (moduleKey === 'bookings' && (perms.includes('properties') || perms.some(p => p.startsWith('properties.')))) return true;

  // CMS & Settings group
  if (moduleKey === 'website_settings' && (
    perms.includes('contact_details') || perms.some(p => p.startsWith('contact_details.')) ||
    perms.includes('logo_management') || perms.some(p => p.startsWith('logo_management.'))
  )) {
    return true;
  }
  if (moduleKey === 'contact_details' && (perms.includes('website_settings') || perms.some(p => p.startsWith('website_settings.')))) return true;
  if (moduleKey === 'logo_management' && (perms.includes('website_settings') || perms.some(p => p.startsWith('website_settings.')))) return true;

  return false;
}

/**
 * Check if the user has permission for a specific granular action e.g. "properties.delete", "rewards.approve"
 */
export function hasActionPermission(user: AdminUser | null, actionCode: string): boolean {
  if (!user) return false;

  // Super Admin has unrestricted access to all actions
  if (user.role === 'SUPER_ADMIN') {
    return true;
  }

  const perms = user.permissions || [];

  // Direct action code match
  if (perms.includes(actionCode)) {
    return true;
  }

  if (actionCode.includes('.')) {
    const [moduleName, actionName] = actionCode.split('.');

    // If user has full access to the module
    if (perms.includes(moduleName)) {
      return true;
    }

    // Hierarchical checks
    if (['gold_properties', 'premium_properties', 'snap_properties'].includes(moduleName)) {
      if (perms.includes('properties') || perms.includes(`properties.${actionName}`)) return true;
    }

    if (['buyers', 'sellers', 'dealers', 'common_people'].includes(moduleName)) {
      if (perms.includes('customers') || perms.includes(`customers.${actionName}`)) return true;
    }

    if (['contact_details', 'logo_management'].includes(moduleName)) {
      if (perms.includes('website_settings') || perms.includes(`website_settings.${actionName}`)) return true;
    }
  }

  return false;
}

/**
 * Shorthand helper for module and action name
 */
export function canPerform(user: AdminUser | null, moduleName: string, actionName: string): boolean {
  return hasActionPermission(user, `${moduleName}.${actionName}`);
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
