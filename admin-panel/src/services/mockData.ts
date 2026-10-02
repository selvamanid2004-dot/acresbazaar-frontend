import { 
  AdminUser, 
  ModulePermission, 
  Customer, 
  Property, 
  Category, 
  Plan, 
  Reward, 
  Report, 
  VerifiedPartner, 
  DashboardStats, 
  ChatConversation, 
  CalendarEvent, 
  WebsiteSetting, 
  PropertyBooking 
} from '../types';

export const DEMO_MODULE_PERMISSIONS: ModulePermission[] = [
  { id: 'dashboard', name: 'Dashboard', group: 'Core & Analytics', description: 'View executive dashboard summary, metrics, and calendar overview' },
  { id: 'buyers', name: 'Buyers', group: 'Customer Management', description: 'View and manage registered property buyers' },
  { id: 'sellers', name: 'Sellers', group: 'Customer Management', description: 'View and manage property sellers and individual owners' },
  { id: 'dealers', name: 'Dealers', group: 'Customer Management', description: 'View and manage registered real estate dealers and agencies' },
  { id: 'common_people', name: 'Community Partners', group: 'Customer Management', description: 'View and manage community partners submitting property snaps' },
  { id: 'properties', name: 'Properties', group: 'Property Operations', description: 'Full management of properties (New, Approved, Hold, Rejected)' },
  { id: 'gold_properties', name: 'Gold Properties', group: 'Property Operations', description: 'Manage featured Gold Plan property listings' },
  { id: 'premium_properties', name: 'Premium Properties', group: 'Property Operations', description: 'Manage Platinum & Premium Plan property listings' },
  { id: 'snap_properties', name: 'Snap Properties', group: 'Property Operations', description: 'Review and approve properties snapped by community partners' },
  { id: 'bookings', name: 'Booked Properties / Deals', group: 'Property Operations', description: 'Manage property bookings, deals, and reservation statuses' },
  { id: 'categories', name: 'Category Management', group: 'Content & CMS', description: 'Create, update, and manage property categories and icons' },
  { id: 'website_settings', name: 'Website Content / CMS', group: 'Content & CMS', description: 'Manage Home, About, and Service CMS content and banners' },
  { id: 'contact_details', name: 'Contact Details', group: 'Content & CMS', description: 'Update phone, email, address, and social media channels' },
  { id: 'logo_management', name: 'Logo Management', group: 'Content & CMS', description: 'Upload, modify, and manage portal logo and branding' },
  { id: 'reports', name: 'Reports', group: 'Operations & Moderation', description: 'Review and resolve reported properties and user complaints' },
  { id: 'rewards', name: 'Rewards', group: 'Operations & Moderation', description: 'Manage partner rewards, bounties, and dealer points payout' },
  { id: 'verified_partners', name: 'Verified Partners / Hub', group: 'Operations & Moderation', description: 'Approve and manage verified dealer and builder partnerships' },
  { id: 'plans', name: 'Plan Management', group: 'Operations & Moderation', description: 'Manage Gold and Platinum pricing plans and subscription features' },
  { id: 'data_export', name: 'Data Download / Export', group: 'System & Security', description: 'Download CSV and PDF reports for customers, properties, and bookings' },
  { id: 'profile_settings', name: 'Admin Profile', group: 'System & Security', description: 'Modify your administrator account profile and change password' }
];

export const DEMO_ADMIN_USER: AdminUser = {
  id: 'admin-super-1',
  email: 'admin@acresbazaar.com',
  name: 'Executive Administrator',
  role: 'SUPER_ADMIN',
  isActive: true,
  permissions: DEMO_MODULE_PERMISSIONS.map(m => m.id)
};

export const DEMO_STAFF_USERS: AdminUser[] = [
  {
    id: 'admin-super-1',
    email: 'admin@acresbazaar.com',
    name: 'Executive Administrator',
    role: 'SUPER_ADMIN',
    isActive: true,
    permissions: DEMO_MODULE_PERMISSIONS.map(m => m.id),
    createdAt: '2026-09-01T08:00:00.000Z'
  },
  {
    id: 'admin-staff-2',
    email: 'staff@acresbazaar.com',
    name: 'Operations Staff',
    role: 'ADMIN',
    isActive: true,
    permissions: ['dashboard', 'properties', 'bookings', 'rewards', 'categories', 'snap_properties'],
    createdAt: '2026-09-10T11:30:00.000Z'
  }
];

// Exact Match to Database Stats
export const DEMO_STATS: DashboardStats = {
  totalProperties: 10,
  newProperties: 1,
  totalCustomers: 5,
  newCustomers: 0,
  postedProperties: 7
};

export const DEMO_CHATS: ChatConversation[] = [
  {
    id: 'chat-1',
    userName: 'Rajesh Kumar',
    userEmail: 'buyer@acresbazaar.com',
    lastMessage: 'Is the title verification report available for the Green Meadows Villa?',
    lastMessageAt: new Date(Date.now() - 15 * 60000).toISOString(),
    unread: true,
    propertyTitle: 'Green Meadows Luxury 4 BHK Villa',
    messages: [
      {
        id: 'msg-1',
        senderId: 'usr-buyer-1',
        senderName: 'Rajesh Kumar',
        senderRole: 'BUYER',
        message: 'Hello, I submitted a booking inquiry for Green Meadows Luxury Villa.',
        createdAt: new Date(Date.now() - 45 * 60000).toISOString()
      },
      {
        id: 'msg-2',
        senderId: 'usr-buyer-1',
        senderName: 'Rajesh Kumar',
        senderRole: 'BUYER',
        message: 'Is the title verification report available for the Green Meadows Villa?',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString()
      }
    ]
  }
];

// Exact 5 Customers matching database
export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'usr-buyer-1',
    name: 'Rajesh Kumar',
    email: 'buyer@acresbazaar.com',
    mobile: '+91 98401 11223',
    role: 'BUYER',
    status: 'ACTIVE',
    planType: 'GOLD',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-18T12:00:00.000Z',
    propertiesCount: 0
  },
  {
    id: 'usr-seller-2',
    name: 'Sunita Reddy',
    email: 'seller@acresbazaar.com',
    mobile: '+91 99001 88990',
    role: 'SELLER',
    status: 'ACTIVE',
    planType: 'PLATINUM',
    createdAt: '2026-09-10T11:15:00.000Z',
    updatedAt: '2026-09-20T16:00:00.000Z',
    propertiesCount: 3
  },
  {
    id: 'usr-dealer-3',
    name: 'Vikram Sharma (Horizon Realty)',
    email: 'dealer@acresbazaar.com',
    mobile: '+91 97410 44556',
    role: 'DEALER',
    status: 'ACTIVE',
    planType: 'PLATINUM',
    agencyName: 'Horizon Realty Advisors',
    createdAt: '2026-08-15T09:30:00.000Z',
    updatedAt: '2026-09-19T14:20:00.000Z',
    propertiesCount: 4
  },
  {
    id: 'usr-partner-4',
    name: 'Ramesh Spotter Partner',
    email: 'partner@acresbazaar.com',
    mobile: '+91 98401 22334',
    role: 'COMMON_PEOPLE',
    status: 'ACTIVE',
    planType: 'STANDARD',
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-21T09:00:00.000Z',
    propertiesCount: 1
  },
  {
    id: 'usr-investor-5',
    name: 'Priya Sundaram (VIP Investor)',
    email: 'investor@acresbazaar.com',
    mobile: '+91 98840 55667',
    role: 'BUYER',
    status: 'ACTIVE',
    planType: 'PLATINUM',
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-22T12:00:00.000Z',
    propertiesCount: 0
  }
];

// Exact 10 Properties matching database
export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-villa-1',
    title: 'Green Meadows Luxury 4 BHK Villa',
    description: 'Bespoke 4 BHK luxury architectural villa with private infinity pool, landscaped zen gardens, and Italian marble flooring in prime Whitefield.',
    category: 'Villas',
    location: 'Whitefield, Bangalore',
    city: 'Bangalore',
    price: 28500000,
    priceDisplay: '₹ 2.85 Cr',
    status: 'APPROVED',
    planType: 'PLATINUM',
    sellerName: 'Sunita Reddy',
    sellerPhone: '+91 99001 88990',
    sellerEmail: 'seller@acresbazaar.com',
    sellerContact: 'Sunita Reddy (+91 99001 88990)',
    isPublished: true,
    featured: true,
    images: [
      { id: 'img-1-1', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-10T11:30:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z'
  },
  {
    id: 'prop-plot-2',
    title: 'Emerald Palms Gated Residential Plots',
    description: 'BDA-approved residential corner parcel in a premier gated layout with 40-ft wide blacktop roads and underground utilities.',
    category: 'Plots',
    location: 'Sarjapur Road, Bangalore',
    city: 'Bangalore',
    price: 12500000,
    priceDisplay: '₹ 1.25 Cr',
    status: 'APPROVED',
    planType: 'GOLD',
    sellerName: 'Vikram Sharma (Horizon Realty)',
    sellerPhone: '+91 97410 44556',
    sellerEmail: 'dealer@acresbazaar.com',
    sellerContact: 'Horizon Realty Advisors (+91 97410 44556)',
    isPublished: true,
    featured: true,
    images: [
      { id: 'img-2-1', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-12T14:00:00.000Z',
    updatedAt: '2026-09-20T15:30:00.000Z'
  },
  {
    id: 'prop-apt-3',
    title: 'Skyline Zenith Heights 3 BHK Apartment',
    description: 'Spacious 3 BHK modern skyline apartment with panoramic balcony view, premium Italian marble, and EV charging bays.',
    category: 'Apartments / Flats',
    location: 'Indiranagar 100ft Road, Bangalore',
    city: 'Bangalore',
    price: 18500000,
    priceDisplay: '₹ 1.85 Cr',
    status: 'APPROVED',
    planType: 'PLATINUM',
    sellerName: 'Vikram Sharma (Horizon Realty)',
    sellerPhone: '+91 97410 44556',
    sellerEmail: 'dealer@acresbazaar.com',
    sellerContact: 'Prestige Realty Network (+91 97410 44556)',
    isPublished: true,
    featured: true,
    images: [
      { id: 'img-3-1', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-14T09:00:00.000Z',
    updatedAt: '2026-09-21T11:00:00.000Z'
  },
  {
    id: 'prop-comm-4',
    title: 'Prime Tech Corporate Office Floor',
    description: 'Grade-A corporate office floor with leasable space, 100% power backup, and LEED Platinum certification.',
    category: 'Commercial Spaces',
    location: 'Bellandur ORR, Bangalore',
    city: 'Bangalore',
    price: 55000000,
    priceDisplay: '₹ 5.50 Cr',
    status: 'APPROVED',
    planType: 'PLATINUM',
    sellerName: 'Vikram Sharma (Horizon Realty)',
    sellerPhone: '+91 97410 44556',
    sellerEmail: 'dealer@acresbazaar.com',
    sellerContact: 'Brigade Horizon Commercial (+91 97410 44556)',
    isPublished: true,
    featured: false,
    images: [
      { id: 'img-4-1', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-19T11:00:00.000Z'
  },
  {
    id: 'prop-house-5',
    title: 'Silver Oak Luxury Duplex Bungalow',
    description: 'Independent 4 BHK triplex bungalow with private terrace lounge, bespoke teakwood finishings, and landscaped courtyard.',
    category: 'Independent Houses',
    location: 'Koramangala 4th Block, Bangalore',
    city: 'Bangalore',
    price: 34000000,
    priceDisplay: '₹ 3.40 Cr',
    status: 'APPROVED',
    planType: 'GOLD',
    sellerName: 'Sunita Reddy',
    sellerPhone: '+91 99001 88990',
    sellerEmail: 'seller@acresbazaar.com',
    sellerContact: 'Sunita Reddy (+91 99001 88990)',
    isPublished: true,
    featured: true,
    images: [
      { id: 'img-5-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-16T10:00:00.000Z',
    updatedAt: '2026-09-22T14:00:00.000Z'
  },
  {
    id: 'prop-farm-6',
    title: 'Whispering Palms Organic Agro Estate',
    description: '3.5-acre lush organic coconut and teak agro farm with clear patta title, drip irrigation pipeline, and scenic country cottage.',
    category: 'Farm Lands',
    location: 'Mysore Road, Mandya',
    city: 'Mandya',
    price: 16500000,
    priceDisplay: '₹ 1.65 Cr',
    status: 'APPROVED',
    planType: 'PLATINUM',
    sellerName: 'Sunita Reddy',
    sellerPhone: '+91 99001 88990',
    sellerEmail: 'seller@acresbazaar.com',
    sellerContact: 'Sunita Reddy (+91 99001 88990)',
    isPublished: true,
    featured: false,
    images: [
      { id: 'img-6-1', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-17T11:00:00.000Z',
    updatedAt: '2026-09-23T16:00:00.000Z'
  },
  {
    id: 'prop-snap-pending-7',
    title: 'Partner Spot TO-LET & Sale Villa in Anna Nagar',
    description: 'Community partner submission: Prime corner villa spotted with direct owner banner for quick sale or long-term lease. Pending admin field verification.',
    category: 'Villas',
    location: 'Anna Nagar, Chennai',
    city: 'Chennai',
    price: 9500000,
    priceDisplay: '₹ 95 Lakhs',
    status: 'PENDING',
    planType: 'PLATINUM',
    sellerName: 'Ramesh Spotter Partner',
    sellerPhone: '+91 98401 22334',
    sellerEmail: 'partner@acresbazaar.com',
    sellerContact: 'Ramesh Partner (+91 98401 22334)',
    isPublished: false,
    featured: false,
    categorySpecs: {
      isSnap: true,
      boardType: 'TO-LET / SALE',
      boardContact: '+91 98401 22334',
      landmark: 'Near 2nd Avenue'
    },
    images: [
      { id: 'img-7-1', url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-25T08:00:00.000Z',
    updatedAt: '2026-09-25T08:00:00.000Z'
  },
  {
    id: 'prop-hold-8',
    title: 'Lakeview Executive Residence (Under Legal Review)',
    description: 'High-profile lake-facing villa listing placed on temporary administrative hold pending updated mutation and tax clearance documents.',
    category: 'Villas',
    location: 'Hebbal, Bangalore',
    city: 'Bangalore',
    price: 31000000,
    priceDisplay: '₹ 3.10 Cr',
    status: 'HOLD',
    planType: 'PLATINUM',
    sellerName: 'Vikram Sharma (Horizon Realty)',
    sellerPhone: '+91 97410 44556',
    sellerEmail: 'dealer@acresbazaar.com',
    sellerContact: 'Aditya Realty Consultants (+91 97410 44556)',
    isPublished: false,
    featured: false,
    images: [
      { id: 'img-8-1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-26T12:00:00.000Z'
  },
  {
    id: 'prop-rejected-9',
    title: 'Heritage Enclave Parcel (Incomplete Documentation)',
    description: 'Plot listing rejected during validation due to mismatch in layout survey numbers and non-RERA registered development scheme.',
    category: 'Plots',
    location: 'Devanahalli, Bangalore',
    city: 'Bangalore',
    price: 8500000,
    priceDisplay: '₹ 85 Lakhs',
    status: 'REJECTED',
    planType: 'GOLD',
    sellerName: 'Sunita Reddy',
    sellerPhone: '+91 99001 88990',
    sellerEmail: 'seller@acresbazaar.com',
    sellerContact: 'Sunita Reddy (+91 99001 88990)',
    isPublished: false,
    featured: false,
    images: [
      { id: 'img-9-1', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-19T14:00:00.000Z',
    updatedAt: '2026-09-27T15:00:00.000Z'
  },
  {
    id: 'prop-dealer-10',
    title: 'Royal Palms Premium Gated Community Villa',
    description: 'Ultra-modern 3 BHK Mediterranean style villa located in high-growth IT corridor with private backyard and modular kitchen.',
    category: 'Villas',
    location: 'OMR Road, Chennai',
    city: 'Chennai',
    price: 14500000,
    priceDisplay: '₹ 1.45 Cr',
    status: 'APPROVED',
    planType: 'GOLD',
    sellerName: 'Vikram Sharma (Horizon Realty)',
    sellerPhone: '+91 97410 44556',
    sellerEmail: 'dealer@acresbazaar.com',
    sellerContact: 'Apex Properties & Builders (+91 97410 44556)',
    isPublished: true,
    featured: true,
    images: [
      { id: 'img-10-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-20T15:00:00.000Z',
    updatedAt: '2026-09-28T16:00:00.000Z'
  }
];

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Plots & Land', slug: 'plots', description: 'Verified residential, commercial & industrial land parcels', isActive: true, displayOrder: 1, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-2', name: 'Villas', slug: 'villas', description: 'Exclusive luxury gated community & independent villas', isActive: true, displayOrder: 2, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-3', name: 'Apartments / Flats', slug: 'apartments', description: 'Multi-storey premium apartments & high-rise residences', isActive: true, displayOrder: 3, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-4', name: 'Independent Houses', slug: 'independent-houses', description: 'Individual duplex, triplex homes with clear land titles', isActive: true, displayOrder: 4, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-5', name: 'Commercial Spaces', slug: 'commercial', description: 'Grade-A corporate office floors, retail showrooms & tech parks', isActive: true, displayOrder: 5, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-6', name: 'Farm Lands', slug: 'farm-lands', description: 'Scenic managed agro farmlands & country estate parcels', isActive: true, displayOrder: 6, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-7', name: 'Layouts', slug: 'layouts', description: 'Township master developments and plotted enclave projects', isActive: true, displayOrder: 7, createdAt: '2026-09-01T00:00:00.000Z' }
];

export const DEMO_PLANS: Plan[] = [
  {
    id: 'plan-gold',
    planId: 'gold',
    name: 'Gold Membership Plan',
    code: 'GOLD',
    price: 1000,
    period: '30 Days',
    badge: 'Popular',
    description: 'Essential tier with verified listings and direct owner contact information.',
    benefits: ['Access to Verified Gold Listings', 'Direct Owner Numbers', 'Standard Legal Verification'],
    features: ['Up to 25 Property Contact Unlocks', 'Dedicated Support', '30-Day Validity'],
    accessPermissions: ['gold_view', 'direct_contact'],
    isActive: true,
    content: 'Gold Plan Tier',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  },
  {
    id: 'plan-platinum',
    planId: 'platinum',
    name: 'Platinum VIP Membership Plan',
    code: 'PLATINUM',
    price: 3000,
    period: '30 Days',
    badge: 'VIP All-Access',
    description: 'Unlimited VIP dossiers, direct negotiation concierge, and zero brokerage.',
    benefits: ['Unlimited Platinum & Gold Properties', 'Direct Developer & Owner Concierge', 'Legal Audit Dossiers'],
    features: ['Unlimited Direct Contacts', 'Dedicated Relationship Manager', 'Zero Brokerage Guarantee'],
    accessPermissions: ['platinum_view', 'vip_concierge'],
    isActive: true,
    content: 'Platinum VIP Tier',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z'
  }
];

export const DEMO_REWARDS: Reward[] = [
  {
    id: 'rew-1',
    userName: 'Ramesh Spotter Partner',
    userEmail: 'partner@acresbazaar.com',
    userRole: 'COMMON_PEOPLE',
    propertyTitle: 'Partner Spot TO-LET & Sale Villa in Anna Nagar',
    rewardTitle: 'Partner Milestone #PT-1092',
    points: 100,
    amount: 1000,
    reason: 'Verified TO-LET signboard snap leading to active listing',
    status: 'PENDING',
    createdAt: '2026-09-25T10:00:00.000Z'
  }
];

export const DEMO_REPORTS: Report[] = [];

export const DEMO_PARTNERS: VerifiedPartner[] = [
  {
    id: 'partner-1',
    name: 'Vikram Sharma',
    type: 'Agency',
    company: 'Horizon Realty Advisors',
    mobile: '+91 97410 44556',
    email: 'dealer@acresbazaar.com',
    status: 'VERIFIED',
    registrationDate: '2026-08-15T09:30:00.000Z'
  }
];

export const DEMO_BOOKINGS: PropertyBooking[] = [
  {
    id: 'book-1',
    propertyId: 'prop-villa-1',
    propertyTitle: 'Green Meadows Luxury 4 BHK Villa',
    propertyCategory: 'Villas',
    propertyPrice: 28500000,
    planType: 'PLATINUM',
    bookerRole: 'BUYER',
    bookerId: 'usr-buyer-1',
    bookerName: 'Rajesh Kumar',
    bookerEmail: 'buyer@acresbazaar.com',
    bookerPhone: '+91 98401 11223',
    sellerId: 'usr-seller-2',
    sellerName: 'Sunita Reddy',
    sellerEmail: 'seller@acresbazaar.com',
    sellerPhone: '+91 99001 88990',
    bookingStatus: 'CONFIRMED',
    bookingAmount: 50000,
    notes: 'Scheduled for private site inspection with owner on weekend',
    bookingDate: '2026-09-28T10:00:00.000Z',
    createdAt: '2026-09-28T10:00:00.000Z',
    updatedAt: '2026-09-28T10:00:00.000Z'
  }
];

export const DEMO_SETTINGS: WebsiteSetting[] = [
  { id: 'set-1', key: 'website_name', value: 'AcresBazaar', group: 'home' },
  { id: 'set-2', key: 'hero_title', value: 'India\'s Most Trusted Direct Real Estate Marketplace', group: 'home' },
  { id: 'set-3', key: 'contact_email', value: 'support@acresbazaar.com', group: 'contact' },
  { id: 'set-4', key: 'contact_phone', value: '+91 98401 99999', group: 'contact' },
  { id: 'set-5', key: 'website_logo', value: '/uploads/logo-1790851863558.jpg', group: 'logo' },
  { id: 'set-6', key: 'logo_url', value: '/uploads/logo-1790851863558.jpg', group: 'logo' }
];

export const DEMO_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Site Inspection - Green Meadows Luxury Villa',
    date: new Date(Date.now() + 86400000 * 2).toISOString(),
    type: 'INSPECTION',
    completed: false
  }
];
