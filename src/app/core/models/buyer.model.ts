export type UserRole = 'buyer' | 'seller' | 'dealer' | 'admin' | 'common_people';

export interface BuyerAccount {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  isVerified: boolean;
  membershipPlan: 'gold' | 'platinum' | null;
  role?: string;
}

export interface SellerAccount {
  id: string;
  seller_id?: string;
  fullName: string;
  mobile: string;
  phone?: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  role: 'seller';
  status?: string;
}

export interface DealerAccount {
  id: string;
  businessName: string;
  fullName?: string;
  mobile: string;
  phone?: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  role: 'dealer';
}

export interface AuthSession {
  token: string;
  buyer: {
    id: string;
    fullName: string;
    email: string;
    mobile: string;
    membershipPlan: 'gold' | 'platinum' | null;
  };
  expiresAt: number;
}

export interface SellerDealerSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
    role: 'seller' | 'dealer';
  };
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

export interface SellerRegisterForm {
  fullName: string;
  mobile?: string;
  phone?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface DealerRegisterForm {
  fullName?: string;
  businessName?: string;
  mobile?: string;
  phone?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordForm {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
