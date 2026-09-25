import {
  AdminUser,
  Customer,
  Property,
  PropertyBooking,
  Category,
  Plan,
  Reward,
  Report,
  VerifiedPartner,
  DashboardStats,
  ChatConversation,
  CalendarEvent,
  WebsiteSetting
} from '../types';

export const DEMO_ADMIN_USER: AdminUser = {
  id: '968a086c-e23d-42cb-bb6b-01c469db8b1e',
  email: 'admin@acresbazaar.com',
  name: 'Executive Administrator (Demo)',
  role: 'SUPER_ADMIN'
};

export const DEMO_STATS: DashboardStats = {
  totalProperties: 91,
  newProperties: 12,
  totalCustomers: 87,
  newCustomers: 15,
  postedProperties: 48
};

export const DEMO_CHATS: ChatConversation[] = [
  {
    id: 'chat-1',
    userName: 'Vikram Malhotra',
    userEmail: 'vikram.m@investments.com',
    lastMessage: 'Is the title verification report available for the Bellandur Commercial Tower?',
    lastMessageAt: new Date(Date.now() - 15 * 60000).toISOString(),
    unread: true,
    propertyTitle: 'Prime Tech Commercial Tower',
    messages: [
      {
        id: 'msg-1',
        senderId: 'user-1',
        senderName: 'Vikram Malhotra',
        senderRole: 'BUYER',
        message: 'Hello, I submitted an inquiry for the Bellandur Commercial Tower.',
        createdAt: new Date(Date.now() - 45 * 60000).toISOString()
      },
      {
        id: 'msg-2',
        senderId: 'user-1',
        senderName: 'Vikram Malhotra',
        senderRole: 'BUYER',
        message: 'Is the title verification report available for the Bellandur Commercial Tower?',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString()
      }
    ]
  },
  {
    id: 'chat-2',
    userName: 'Ananya Sharma',
    userEmail: 'ananya.sharma@designstudio.in',
    lastMessage: 'I would like to schedule a site visit for Saturday at 11 AM.',
    lastMessageAt: new Date(Date.now() - 120 * 60000).toISOString(),
    unread: false,
    propertyTitle: 'Green Meadows Luxury Villa',
    messages: [
      {
        id: 'msg-3',
        senderId: 'user-2',
        senderName: 'Ananya Sharma',
        senderRole: 'BUYER',
        message: 'I would like to schedule a site visit for Saturday at 11 AM.',
        createdAt: new Date(Date.now() - 120 * 60000).toISOString()
      }
    ]
  }
];

export const DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Rajesh K. Verma',
    email: 'rajesh.verma@techcorp.in',
    mobile: '+91 98450 11223',
    role: 'BUYER',
    status: 'ACTIVE',
    planType: 'PLATINUM',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-18T12:00:00.000Z',
    propertiesCount: 0
  },
  {
    id: 'cust-2',
    name: 'Brigade Horizon Realty',
    email: 'contact@brigadehorizon.com',
    mobile: '+91 97410 44556',
    role: 'DEALER',
    status: 'ACTIVE',
    planType: 'PLATINUM',
    agencyName: 'Horizon Realty Advisors',
    createdAt: '2026-08-15T09:30:00.000Z',
    updatedAt: '2026-09-19T14:20:00.000Z',
    propertiesCount: 14
  },
  {
    id: 'cust-3',
    name: 'Sunita Reddy',
    email: 'sunita.reddy@gmail.com',
    mobile: '+91 99001 88990',
    role: 'SELLER',
    status: 'ACTIVE',
    planType: 'GOLD',
    createdAt: '2026-09-10T11:15:00.000Z',
    updatedAt: '2026-09-20T16:00:00.000Z',
    propertiesCount: 3
  },
  {
    id: 'cust-4',
    name: 'Karthik Somayaji',
    email: 'karthik.spotter@outlook.com',
    mobile: '+91 91234 56789',
    role: 'COMMON_PEOPLE',
    status: 'ACTIVE',
    planType: 'STANDARD',
    createdAt: '2026-09-12T08:00:00.000Z',
    updatedAt: '2026-09-21T09:00:00.000Z',
    propertiesCount: 6
  }
];

export const DEMO_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    title: 'Green Meadows Luxury Villa',
    description: 'Bespoke 4 BHK luxury architectural villa with private infinity pool and landscaped zen gardens.',
    category: 'Villas',
    location: 'Whitefield, Bangalore',
    city: 'Bangalore',
    price: 28500000,
    priceDisplay: '₹ 2.85 Cr',
    status: 'APPROVED',
    planType: 'PLATINUM',
    sellerName: 'Sunita Reddy',
    sellerPhone: '+91 99001 88990',
    sellerEmail: 'sunita.reddy@gmail.com',
    sellerContact: 'Sunita Reddy (+91 99001 88990)',
    isPublished: true,
    featured: true,
    images: [
      { id: 'img-1', url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-10T11:30:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z'
  },
  {
    id: 'prop-2',
    title: 'Prime Tech Commercial Tower',
    description: 'Grade-A corporate office floor with leasable space, 100% power backup, and LEED Platinum certification.',
    category: 'Commercial Spaces',
    location: 'Bellandur, Bangalore',
    city: 'Bangalore',
    price: 55000000,
    priceDisplay: '₹ 5.50 Cr',
    status: 'PENDING',
    planType: 'PLATINUM',
    sellerName: 'Brigade Horizon Realty',
    sellerPhone: '+91 97410 44556',
    sellerEmail: 'contact@brigadehorizon.com',
    sellerContact: 'Brigade Horizon Realty (+91 97410 44556)',
    isPublished: false,
    featured: false,
    images: [
      { id: 'img-2', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-19T11:00:00.000Z'
  },
  {
    id: 'prop-3',
    title: 'Emerald Palms Gated Plot #42',
    description: 'BDA-approved residential corner parcel in a gated layout with 40-ft wide blacktop roads.',
    category: 'Plot / Land',
    location: 'Sarjapur Road, Bangalore',
    city: 'Bangalore',
    price: 12500000,
    priceDisplay: '₹ 1.25 Cr',
    status: 'APPROVED',
    planType: 'GOLD',
    sellerName: 'Horizon Realty Advisors',
    sellerPhone: '+91 97410 44556',
    sellerEmail: 'contact@brigadehorizon.com',
    sellerContact: 'Horizon Realty Advisors (+91 97410 44556)',
    isPublished: true,
    featured: false,
    images: [
      { id: 'img-3', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80', isCover: true, order: 1 }
    ],
    createdAt: '2026-09-12T14:00:00.000Z',
    updatedAt: '2026-09-20T15:30:00.000Z'
  }
];

export const DEMO_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'All Residential', slug: 'all-residential', description: 'Luxury homes, villas, and apartments', isActive: true, displayOrder: 1, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-2', name: 'Plot / Land', slug: 'plots-land', description: 'Exclusive gated layouts and approved plots', isActive: true, displayOrder: 2, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-3', name: 'Villas', slug: 'villas', description: 'Private estate residences and luxury villas', isActive: true, displayOrder: 3, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-4', name: 'Apartments', slug: 'apartments', description: 'High-rise sky residences and penthouses', isActive: true, displayOrder: 4, createdAt: '2026-09-01T00:00:00.000Z' },
  { id: 'cat-5', name: 'Commercial Spaces', slug: 'commercial-spaces', description: 'Grade-A corporate towers and retail', isActive: true, displayOrder: 5, createdAt: '2026-09-01T00:00:00.000Z' }
];

export const DEMO_PLANS: Plan[] = [
  {
    id: 'plan-gold',
    planId: 'gold',
    name: 'Gold Scout Plan',
    code: 'GOLD',
    price: 4999,
    period: '30 Days',
    badge: 'Popular',
    description: 'Essential tier with verified listings and direct owner contact information.',
    benefits: ['Access to Verified Gold Listings', 'Direct Owner Numbers', 'Standard Legal Verification'],
    features: ['Up to 25 Property Contact Unlocks', 'Dedicated Support', '30-Day Validity'],
    accessPermissions: ['gold_view', 'direct_contact'],
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  },
  {
    id: 'plan-plat',
    planId: 'platinum',
    name: 'Platinum Executive Plan',
    code: 'PLATINUM',
    price: 14999,
    period: '90 Days',
    badge: 'Executive VIP',
    description: 'Ultra-exclusive tier for off-market, luxury villas, and vetted developer plots.',
    benefits: ['Full Access to Platinum Listings', 'Zero Hidden Details', 'Title & RERA Dossier', 'Concierge Service'],
    features: ['Unlimited Property Unlocks', 'Personal Concierge', 'Priority Pre-Launch Access'],
    accessPermissions: ['platinum_view', 'vip_concierge', 'escrow_advisory'],
    isActive: true,
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z'
  }
];

export const DEMO_REWARDS: Reward[] = [
  {
    id: 'rew-1',
    userName: 'Karthik Somayaji',
    userEmail: 'karthik.spotter@outlook.com',
    userRole: 'COMMON_PEOPLE',
    propertyTitle: 'Off-Market Heritage Bungalow in Malleshwaram',
    rewardTitle: 'Spotter Bounty #SP-1092',
    points: 500,
    amount: 5000,
    reason: 'Verified plot snap leading to successful dealer onboarding',
    status: 'APPROVED',
    createdAt: '2026-09-18T10:00:00.000Z'
  }
];

export const DEMO_REPORTS: Report[] = [];

export const DEMO_PARTNERS: VerifiedPartner[] = [
  {
    id: 'part-1',
    name: 'Prestige Estates Project Liaison',
    type: 'DEVELOPER',
    company: 'Prestige Group Ltd.',
    mobile: '+91 99887 66554',
    email: 'channel@prestigeconstructions.com',
    status: 'VERIFIED',
    registrationDate: '2026-08-20'
  },
  {
    id: 'part-2',
    name: 'Sobha Channel Partners',
    type: 'AGENCY',
    company: 'Sobha Developers Accredited',
    mobile: '+91 99443 32211',
    email: 'partners@sobha.in',
    status: 'VERIFIED',
    registrationDate: '2026-08-25'
  }
];

export const DEMO_BOOKINGS: PropertyBooking[] = [
  {
    id: 'book-1',
    propertyId: 'prop-1',
    propertyTitle: 'Green Meadows Luxury Villa',
    propertyCategory: 'Villas',
    propertyPrice: 28500000,
    planType: 'PLATINUM',
    bookerRole: 'BUYER',
    bookerName: 'Rajesh K. Verma',
    bookerEmail: 'rajesh.verma@techcorp.in',
    bookerPhone: '+91 98450 11223',
    bookingStatus: 'CONFIRMED',
    bookingDate: '2026-09-22',
    createdAt: '2026-09-20T10:00:00.000Z'
  }
];

export const DEMO_SETTINGS: WebsiteSetting[] = [
  { id: 's-1', key: 'website_name', value: 'AcresBazaar | Luxury Real Estate & Prime Properties', group: 'home' },
  { id: 's-2', key: 'hero_headline', value: 'Discover Architectural Masterpieces & Prime Land Parcels', group: 'home' },
  { id: 's-3', key: 'hero_subheading', value: 'Curated portfolio of prime plots, designer villas, and high-yield commercial assets.', group: 'home' },
  { id: 's-4', key: 'contact_email', value: 'concierge@acresbazaar.com', group: 'contact' },
  { id: 's-5', key: 'contact_phone', value: '+91 98450 00000', group: 'contact' }
];

export const DEMO_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Site Visit: Green Meadows Villa (Buyer: Rajesh K. Verma)',
    date: new Date().toISOString().slice(0, 10),
    type: 'INSPECTION',
    completed: false
  },
  {
    id: 'evt-2',
    title: 'Legal Title Document Review: Bellandur Tech Tower',
    date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    type: 'DEADLINE',
    completed: false
  }
];
