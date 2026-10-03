export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | string;
  isActive?: boolean;
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ModulePermission {
  id: string;
  name: string;
  group: string;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'BUYER' | 'SELLER' | 'DEALER' | 'COMMON_PEOPLE' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  planType: 'STANDARD' | 'GOLD' | 'PLATINUM';
  agencyName?: string | null;
  createdAt: string;
  updatedAt: string;
  properties?: Property[];
  propertiesCount?: number;
}

export interface PropertyImage {
  id: string;
  url: string;
  isCover: boolean;
  order: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  city?: string | null;
  price: number;
  priceDisplay?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'HOLD';
  planType: 'STANDARD' | 'GOLD' | 'PLATINUM';
  sellerId?: string | null;
  sellerName?: string | null;
  sellerPhone?: string | null;
  sellerEmail?: string | null;
  categorySpecs?: Record<string, any> | null;
  specs?: Record<string, any> | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqFt?: number | null;
  plotSize?: string | null;
  address?: string | null;
  sellerContact?: string | null;
  legalDocsInfo?: string | null;
  isPublished: boolean;
  featured: boolean;
  ownerId?: string | null;
  owner?: Customer | null;
  sellerRole?: string | null;
  dealerCompany?: string | null;
  images: PropertyImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCategory?: string | null;
  propertyPrice?: number | null;
  planType: 'GOLD' | 'PREMIUM' | 'PLATINUM';
  bookerRole: 'BUYER' | 'DEALER';
  bookerId?: string | null;
  bookerName: string;
  bookerEmail: string;
  bookerPhone: string;
  dealerId?: string | null;
  dealerName?: string | null;
  dealerCompany?: string | null;
  dealerEmail?: string | null;
  dealerPhone?: string | null;
  sellerId?: string | null;
  sellerName?: string | null;
  sellerEmail?: string | null;
  sellerPhone?: string | null;
  bookingAmount?: number | null;
  bookingStatus: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  bookingDate: string;
  createdAt: string;
  updatedAt?: string;
  property?: Property | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  propertiesCount?: number;
  createdAt: string;
}

export interface Plan {
  id: string;
  planId?: string;
  name: string;
  code: 'GOLD' | 'PLATINUM';
  price: number;
  period: string;
  badge?: string;
  description: string;
  benefits: string[];
  features: string[];
  accessPermissions: string[];
  isActive: boolean;
  content?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  userId?: string | null;
  user?: Customer | null;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  propertyTitle?: string | null;
  rewardTitle?: string | null;
  propertyId?: string | null;
  property?: Property | null;
  points: number;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  createdAt: string;
  updatedAt?: string;
}

export interface RewardConfig {
  id?: string;
  pointsPerReward: number;
  rewardAmountInInr: number;
  pointsPerProperty: number;
  conversionRateText: string;
  ratePerPoint: number;
}

export interface PartnerBankDetail {
  id?: string;
  partnerEmail: string;
  partnerName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string | null;
  mobileNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RewardClaim {
  id: string;
  claimNumber: string;
  partnerEmail: string;
  partnerName: string;
  partnerPhone?: string | null;
  partnerRole?: string | null;
  redeemedPoints: number;
  rewardAmount: number;
  conversionRate?: string | null;
  bankAccountHolder: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  upiId?: string | null;
  mobileNumber?: string | null;
  status: 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'REJECTED';
  adminNotes?: string | null;
  rejectionReason?: string | null;
  paymentReference?: string | null;
  paymentDate?: string | null;
  processedByAdminId?: string | null;
  processedByAdminName?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface PointsLedger {
  id: string;
  partnerEmail: string;
  partnerName?: string | null;
  partnerRole?: string | null;
  propertyId?: string | null;
  propertyTitle?: string | null;
  claimId?: string | null;
  transactionType: string;
  points: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  adminId?: string | null;
  adminName?: string | null;
  createdAt: string;
}

export interface PartnerWallet {
  id: string;
  partnerEmail: string;
  partnerName?: string | null;
  partnerPhone?: string | null;
  partnerRole: string;
  availablePoints: number;
  reservedPoints: number;
  totalEarnedPoints: number;
  totalRedeemedPoints: number;
  bankDetail?: PartnerBankDetail | null;
  transactions?: PointsLedger[];
  claims?: RewardClaim[];
}

export interface ClaimsSummary {
  totalPartnerPointsIssued: number;
  totalPointsRedeemed: number;
  pendingClaimsCount: number;
  totalRewardsPaid: number;
  totalRewardAmountPaid: number;
}

export interface PartnerProfileData {
  partner: {
    name: string;
    email: string;
    mobile?: string;
    role: string;
    createdAt?: string;
  };
  wallet: {
    availablePoints: number;
    reservedPoints: number;
    totalEarnedPoints: number;
    totalRedeemedPoints: number;
  };
  bankDetail: PartnerBankDetail | null;
  properties: Array<{
    id: string;
    title: string;
    category: string;
    location: string;
    price: number;
    status: string;
    planType: string;
    pointsAwarded: boolean;
    createdAt: string;
  }>;
  ledger: PointsLedger[];
  claims: RewardClaim[];
}

export interface Report {
  id: string;
  userId?: string | null;
  user?: Customer | null;
  propertyId?: string | null;
  property?: Property | null;
  category: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface VerifiedPartner {
  id: string;
  name: string;
  type: string;
  company: string;
  mobile: string;
  email: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  registrationDate: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
  propertyTitle?: string | null;
  messages: ChatMessage[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'REMINDER' | 'MEETING' | 'INSPECTION' | 'DEADLINE';
  completed: boolean;
}

export interface DashboardStats {
  totalProperties: number;
  newProperties: number;
  totalCustomers: number;
  newCustomers: number;
  postedProperties: number;
}

export interface WebsiteSetting {
  id: string;
  key: string;
  value: string;
  group: 'home' | 'about' | 'service' | 'logo' | 'contact';
  description?: string | null;
}
