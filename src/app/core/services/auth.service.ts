import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { 
  BuyerAccount, 
  SellerAccount, 
  DealerAccount, 
  AuthSession, 
  SellerDealerSession, 
  LoginCredentials, 
  RegisterForm, 
  SellerRegisterForm, 
  DealerRegisterForm 
} from '../models/buyer.model';
import { NavStateService } from './nav-state.service';
import { NotificationService } from '../../shared/services/notification.service';
import { WishlistService } from './wishlist.service';

const BUYERS_DB_KEY = 'aura_buyers_db';
const SELLERS_DB_KEY = 'aura_sellers_db';
const DEALERS_DB_KEY = 'aura_dealers_db';

const BUYER_SESSION_KEY = 'aura_auth_session';
const SELLER_SESSION_KEY = 'aura_seller_session';
const DEALER_SESSION_KEY = 'aura_dealer_session';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private navStateService    = inject(NavStateService);
  private notificationService = inject(NotificationService);
  private wishlistService    = inject(WishlistService);
  private router = inject(Router);

  // Active Authenticated Signals
  readonly currentBuyer = signal<AuthSession['buyer'] | null>(null);
  readonly isAuthenticated = computed(() => this.currentBuyer() !== null);
  readonly activeMembership = computed(() => this.currentBuyer()?.membershipPlan || null);

  readonly currentSeller = signal<SellerAccount | null>(null);
  readonly isSellerAuthenticated = computed(() => this.currentSeller() !== null);

  readonly currentDealer = signal<DealerAccount | null>(null);
  readonly isDealerAuthenticated = computed(() => this.currentDealer() !== null);

  constructor() {
    this.initFromStorage();
  }

  // Restore sessions from localStorage on startup
  private initFromStorage(): void {
    // 1. Buyer Session
    try {
      const rawBuyer = localStorage.getItem(BUYER_SESSION_KEY);
      if (rawBuyer) {
        const session: AuthSession = JSON.parse(rawBuyer);
        if (session.expiresAt > Date.now()) {
          this.currentBuyer.set(session.buyer);
          // Restore per-user wishlist on page load if buyer session is still valid
          this.wishlistService.initForBuyer(session.buyer.id);
          if (session.buyer.membershipPlan) {
            this.navStateService.activeMembership.set(session.buyer.membershipPlan);
          }
        } else {
          localStorage.removeItem(BUYER_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(BUYER_SESSION_KEY);
    }

    // 2. Seller Session
    try {
      const rawSeller = localStorage.getItem(SELLER_SESSION_KEY);
      if (rawSeller) {
        const session: { user: SellerAccount; expiresAt: number } = JSON.parse(rawSeller);
        if (session.expiresAt > Date.now()) {
          this.currentSeller.set(session.user);
        } else {
          localStorage.removeItem(SELLER_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(SELLER_SESSION_KEY);
    }

    // 3. Dealer Session
    try {
      const rawDealer = localStorage.getItem(DEALER_SESSION_KEY);
      if (rawDealer) {
        const session: { user: DealerAccount; expiresAt: number } = JSON.parse(rawDealer);
        if (session.expiresAt > Date.now()) {
          this.currentDealer.set(session.user);
        } else {
          localStorage.removeItem(DEALER_SESSION_KEY);
        }
      }
    } catch {
      localStorage.removeItem(DEALER_SESSION_KEY);
    }
  }

  // =========================================================================
  // ACTIVE ROLE & SINGLE-SESSION ENFORCEMENT
  // =========================================================================

  isSpotterAuthenticated(): boolean {
    try {
      return !!(localStorage.getItem('aura_common_session') || localStorage.getItem('spotter_auth_user'));
    } catch {
      return false;
    }
  }

  getActiveRole(): 'Buyer' | 'Seller' | 'Dealer' | 'Spotter' | null {
    if (this.isAuthenticated()) return 'Buyer';
    if (this.isSellerAuthenticated()) return 'Seller';
    if (this.isDealerAuthenticated()) return 'Dealer';
    if (this.isSpotterAuthenticated()) return 'Spotter';
    return null;
  }

  logoutSpotter(): void {
    localStorage.removeItem('aura_common_session');
    localStorage.removeItem('spotter_auth_user');
    this.notificationService.show('Spotter Logged Out', 'Spotter session ended successfully.', 'info');
    this.router.navigate(['/snap-property/login']);
  }

  logoutCurrentRole(): void {
    const role = this.getActiveRole();
    if (role === 'Buyer') this.logout();
    else if (role === 'Seller') this.logoutSeller();
    else if (role === 'Dealer') this.logoutDealer();
    else if (role === 'Spotter') this.logoutSpotter();
  }

  // =========================================================================
  // CRYPTOGRAPHIC UTILITIES (Web Crypto API SHA-256 with Cryptographic Salt)
  // =========================================================================

  generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + ':' + salt + ':aura_estate_secret');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // =========================================================================
  // DATABASE HELPERS
  // =========================================================================

  private getBuyersDb(): BuyerAccount[] {
    try {
      const data = localStorage.getItem(BUYERS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveBuyersDb(buyers: BuyerAccount[]): void {
    localStorage.setItem(BUYERS_DB_KEY, JSON.stringify(buyers));
  }

  private getSellersDb(): SellerAccount[] {
    try {
      const data = localStorage.getItem(SELLERS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveSellersDb(sellers: SellerAccount[]): void {
    localStorage.setItem(SELLERS_DB_KEY, JSON.stringify(sellers));
  }

  private getDealersDb(): DealerAccount[] {
    try {
      const data = localStorage.getItem(DEALERS_DB_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveDealersDb(dealers: DealerAccount[]): void {
    localStorage.setItem(DEALERS_DB_KEY, JSON.stringify(dealers));
  }

  hasRegisteredBuyers(): boolean {
    return this.getBuyersDb().length > 0;
  }

  isEmailRegistered(email: string): boolean {
    const clean = email.trim().toLowerCase();
    return this.getBuyersDb().some(b => b.email.toLowerCase() === clean);
  }

  // =========================================================================
  // BUYER AUTHENTICATION (NO OTP)
  // =========================================================================

  async register(form: RegisterForm): Promise<{ success: boolean; message: string }> {
    const activeRole = this.getActiveRole();
    if (activeRole && activeRole !== 'Buyer') {
      return {
        success: false,
        message: `You are currently logged in as a ${activeRole}. Please logout of your ${activeRole} account before registering as a Buyer.`
      };
    }

    const cleanFullName = (form.fullName || '').trim();
    const cleanEmail = (form.email || '').trim().toLowerCase();
    const cleanMobile = (form.mobile || '').trim().replace(/\D/g, '');
    const password = form.password || '';
    const confirmPassword = form.confirmPassword || '';

    if (!cleanFullName) {
      return { success: false, message: 'Please enter your full name.' };
    }

    if (cleanMobile.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid Gmail / Email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match. Please re-enter.' };
    }

    const buyers = this.getBuyersDb();
    if (buyers.some(b => b.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'This email address is already registered as a Buyer. Please login.' };
    }

    const salt = this.generateSalt();
    const passwordHash = await this.hashPassword(password, salt);

    const newBuyer: BuyerAccount = {
      id: 'buyer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      fullName: cleanFullName,
      mobile: cleanMobile,
      email: cleanEmail,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      isVerified: true,
      membershipPlan: null
    };

    buyers.push(newBuyer);
    this.saveBuyersDb(buyers);

    // Live sync to NestJS Backend User Database
    try {
      const userRole = (form.role || 'BUYER').toUpperCase();
      await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanFullName,
          mobile: cleanMobile,
          email: cleanEmail,
          password: password,
          role: userRole
        })
      });
    } catch (e) {
      console.warn('Backend user registration sync error:', e);
    }

    this.createBuyerSession(newBuyer);

    this.notificationService.show(
      'Account Created Successfully 🎉',
      `Welcome to AcresBazaar, ${newBuyer.fullName}! You are now logged in.`,
      'success'
    );

    return { success: true, message: 'Account registered successfully!' };
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string }> {
    const activeRole = this.getActiveRole();
    if (activeRole && activeRole !== 'Buyer') {
      return {
        success: false,
        message: `You are currently logged in as a ${activeRole}. You cannot login as a Buyer at the same time. Please logout of your ${activeRole} account first.`
      };
    }

    const cleanEmail = (credentials.email || '').trim().toLowerCase();
    const password = credentials.password || '';

    if (!cleanEmail || !password) {
      return { success: false, message: 'Please enter both your email and password.' };
    }

    const buyers = this.getBuyersDb();
    const buyer = buyers.find(b => b.email.toLowerCase() === cleanEmail);

    if (!buyer) {
      return { success: false, message: 'Invalid email or password. Please check your credentials.' };
    }

    const checkHash = await this.hashPassword(password, buyer.salt);
    if (checkHash !== buyer.passwordHash) {
      return { success: false, message: 'Invalid email or password. Please check your credentials.' };
    }

    this.createBuyerSession(buyer);

    this.notificationService.show(
      'Welcome Back!',
      `Logged in as ${buyer.fullName}.`,
      'success'
    );

    return { success: true, message: 'Login successful!' };
  }

  private createBuyerSession(buyer: BuyerAccount): void {
    const token = 'token_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const sessionBuyer = {
      id: buyer.id,
      fullName: buyer.fullName,
      email: buyer.email,
      mobile: buyer.mobile,
      membershipPlan: buyer.membershipPlan
    };

    const session: AuthSession = {
      token,
      buyer: sessionBuyer,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    localStorage.setItem(BUYER_SESSION_KEY, JSON.stringify(session));
    this.currentBuyer.set(sessionBuyer);

    // Load this buyer's personal wishlist from storage
    this.wishlistService.initForBuyer(buyer.id);

    if (buyer.membershipPlan) {
      this.navStateService.activeMembership.set(buyer.membershipPlan);
    }
  }

  logout(): void {
    localStorage.removeItem(BUYER_SESSION_KEY);
    this.currentBuyer.set(null);
    this.navStateService.activeMembership.set(null);
    // Clear wishlist from memory — it won't show on public pages after logout
    this.wishlistService.clearForLogout();
    this.notificationService.show('Logged Out', 'You have been safely signed out.', 'info');
    this.router.navigate(['/']);
  }

  // =========================================================================
  // SELLER AUTHENTICATION (Python Backend + SQLite + Secure Hash)
  // =========================================================================

  async registerSeller(form: SellerRegisterForm): Promise<{ success: boolean; message: string }> {
    const activeRole = this.getActiveRole();
    if (activeRole && activeRole !== 'Seller') {
      return {
        success: false,
        message: `You are currently logged in as a ${activeRole}. Please logout of your ${activeRole} account before registering as a Seller.`
      };
    }

    const cleanFullName = (form.fullName || '').trim();
    const cleanEmail = (form.email || '').trim().toLowerCase();
    const cleanMobile = (form.mobile || '').trim().replace(/\D/g, '');
    const password = form.password || '';
    const confirmPassword = form.confirmPassword || '';

    if (!cleanFullName) {
      return { success: false, message: 'Please enter your full name.' };
    }

    if (cleanMobile.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid Gmail / Email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    const salt = this.generateSalt();
    const passwordHash = await this.hashPassword(password, salt);

    const sellers = this.getSellersDb();
    if (sellers.some(s => s.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newSeller: SellerAccount = {
      id: 'seller_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      fullName: cleanFullName,
      mobile: cleanMobile,
      email: cleanEmail,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      role: 'seller'
    };

    sellers.push(newSeller);
    this.saveSellersDb(sellers);

    // Live sync to NestJS Backend User Database
    try {
      await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanFullName,
          mobile: cleanMobile,
          email: cleanEmail,
          password: password,
          role: 'SELLER'
        })
      });
    } catch (e) {
      console.warn('Backend seller registration sync error:', e);
    }

    this.notificationService.show(
      'Seller Account Created! 🎉',
      `Welcome ${newSeller.fullName}! Please login to access your Seller Dashboard.`,
      'success'
    );

    return { success: true, message: 'Seller account registered successfully!' };
  }

  async loginSeller(credentialsOrEmail: LoginCredentials | string, maybePassword?: string): Promise<{ success: boolean; message: string }> {
    const activeRole = this.getActiveRole();
    if (activeRole && activeRole !== 'Seller') {
      return {
        success: false,
        message: `You are currently logged in as a ${activeRole}. You cannot login as a Seller at the same time. Please logout of your ${activeRole} account first.`
      };
    }

    let cleanEmail = '';
    let password = '';

    if (typeof credentialsOrEmail === 'string') {
      cleanEmail = credentialsOrEmail.trim().toLowerCase();
      password = maybePassword || '';
    } else {
      cleanEmail = (credentialsOrEmail.email || '').trim().toLowerCase();
      password = credentialsOrEmail.password || '';
    }

    if (!cleanEmail || !password) {
      return { success: false, message: 'Please enter both your email and password.' };
    }

    const sellers = this.getSellersDb();
    const seller = sellers.find(s => s.email.toLowerCase() === cleanEmail);

    if (!seller) {
      return { success: false, message: 'Invalid seller email or password.' };
    }

    const checkHash = await this.hashPassword(password, seller.salt);
    if (checkHash !== seller.passwordHash) {
      return { success: false, message: 'Invalid seller email or password.' };
    }

    const session = {
      user: seller,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    localStorage.setItem(SELLER_SESSION_KEY, JSON.stringify(session));
    this.currentSeller.set(seller);

    this.notificationService.show(
      'Seller Login Successful',
      `Welcome to your Seller Dashboard, ${seller.fullName}!`,
      'success'
    );

    return { success: true, message: 'Seller login successful!' };
  }

  logoutSeller(): void {
    localStorage.removeItem('aura_seller_jwt_token');
    localStorage.removeItem('aura_seller_profile_data');
    localStorage.removeItem(SELLER_SESSION_KEY);
    this.currentSeller.set(null);
    this.notificationService.show('Seller Logged Out', 'You have been signed out from the Seller Portal.', 'info');
    this.router.navigate(['/seller/login']);
  }

  // =========================================================================
  // DEALER AUTHENTICATION
  // =========================================================================

  async registerDealer(form: DealerRegisterForm): Promise<{ success: boolean; message: string }> {
    const activeRole = this.getActiveRole();
    if (activeRole && activeRole !== 'Dealer') {
      return {
        success: false,
        message: `You are currently logged in as a ${activeRole}. Please logout of your ${activeRole} account before registering as a Dealer.`
      };
    }

    const cleanBusinessName = (form.businessName || form.fullName || '').trim();
    const cleanEmail = (form.email || '').trim().toLowerCase();
    const cleanMobile = (form.mobile || form.phone || '').trim().replace(/\D/g, '');
    const password = form.password || '';
    const confirmPassword = form.confirmPassword || '';

    if (!cleanBusinessName) {
      return { success: false, message: 'Please enter your Full Name / Business Name.' };
    }

    if (cleanMobile.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number.' };
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Please enter a valid Gmail / Email address.' };
    }

    if (!password || password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    const dealers = this.getDealersDb();
    if (dealers.some(d => d.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'This email is already registered as a Dealer. Please login.' };
    }

    const salt = this.generateSalt();
    const passwordHash = await this.hashPassword(password, salt);

    const newDealer: DealerAccount = {
      id: 'dealer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      businessName: cleanBusinessName,
      fullName: cleanBusinessName,
      mobile: cleanMobile,
      phone: cleanMobile,
      email: cleanEmail,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
      role: 'dealer'
    };

    dealers.push(newDealer);
    this.saveDealersDb(dealers);

    // Live sync to NestJS Backend User Database
    try {
      await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanBusinessName,
          mobile: cleanMobile,
          email: cleanEmail,
          password: password,
          role: 'DEALER'
        })
      });
    } catch (e) {
      console.warn('Backend dealer registration sync error:', e);
    }

    this.notificationService.show(
      'Dealer Account Created! 🏢',
      `Welcome ${newDealer.businessName}! Please login to access your Dealer Dashboard.`,
      'success'
    );

    return { success: true, message: 'Dealer account registered successfully!' };
  }

  async loginDealer(credentialsOrEmail: LoginCredentials | string, maybePassword?: string): Promise<{ success: boolean; message: string }> {
    const activeRole = this.getActiveRole();
    if (activeRole && activeRole !== 'Dealer') {
      return {
        success: false,
        message: `You are currently logged in as a ${activeRole}. You cannot login as a Dealer at the same time. Please logout of your ${activeRole} account first.`
      };
    }

    let cleanEmail = '';
    let password = '';

    if (typeof credentialsOrEmail === 'string') {
      cleanEmail = credentialsOrEmail.trim().toLowerCase();
      password = maybePassword || '';
    } else {
      cleanEmail = (credentialsOrEmail.email || '').trim().toLowerCase();
      password = credentialsOrEmail.password || '';
    }

    if (!cleanEmail || !password) {
      return { success: false, message: 'Please enter both your email and password.' };
    }

    const dealers = this.getDealersDb();
    const dealer = dealers.find(d => d.email.toLowerCase() === cleanEmail);

    if (!dealer) {
      return { success: false, message: 'Invalid dealer email or password.' };
    }

    const checkHash = await this.hashPassword(password, dealer.salt);
    if (checkHash !== dealer.passwordHash) {
      return { success: false, message: 'Invalid dealer email or password.' };
    }

    // Save Dealer Session
    const session = {
      user: dealer,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    localStorage.setItem(DEALER_SESSION_KEY, JSON.stringify(session));
    this.currentDealer.set(dealer);

    this.notificationService.show(
      'Dealer Login Successful',
      `Welcome to your Dealer Dashboard, ${dealer.businessName}!`,
      'success'
    );

    return { success: true, message: 'Dealer login successful!' };
  }

  logoutDealer(): void {
    localStorage.removeItem(DEALER_SESSION_KEY);
    this.currentDealer.set(null);
    this.notificationService.show('Dealer Logged Out', 'You have been signed out from the Dealer Portal.', 'info');
    this.router.navigate(['/dealer/login']);
  }

  // =========================================================================
  // DIRECT PASSWORD RESET (NO OTP)
  // =========================================================================

  async resetPassword(form: { email: string; newPassword: string; confirmPassword: string }): Promise<{ success: boolean; message: string }> {
    const cleanEmail = (form.email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return { success: false, message: 'Please enter your registered email address.' };
    }

    if (!form.newPassword || form.newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    if (form.newPassword !== form.confirmPassword) {
      return { success: false, message: 'Passwords do not match.' };
    }

    const buyers = this.getBuyersDb();
    const buyer = buyers.find(b => b.email.toLowerCase() === cleanEmail);
    if (!buyer) {
      return { success: false, message: 'No registered buyer account found with this email address.' };
    }

    const newSalt = this.generateSalt();
    const newHash = await this.hashPassword(form.newPassword, newSalt);

    buyer.passwordHash = newHash;
    buyer.salt = newSalt;
    this.saveBuyersDb(buyers);

    this.notificationService.show(
      'Password Reset Complete ✅',
      'Your password has been securely updated. You can now login with your new password.',
      'success'
    );

    return { success: true, message: 'Password reset successful!' };
  }

  // =========================================================================
  // MEMBERSHIP UPGRADE
  // =========================================================================

  setMembership(plan: 'gold' | 'platinum'): void {
    this.subscribeToPlan(plan);
  }

  subscribeToPlan(plan: 'gold' | 'platinum'): void {
    const current = this.currentBuyer();
    if (!current) return;

    const buyers = this.getBuyersDb();
    const buyer = buyers.find(b => b.id === current.id);
    if (buyer) {
      buyer.membershipPlan = plan;
      this.saveBuyersDb(buyers);
    }

    current.membershipPlan = plan;
    this.currentBuyer.set({ ...current });
    this.navStateService.activeMembership.set(plan);

    const rawSession = localStorage.getItem(BUYER_SESSION_KEY);
    if (rawSession) {
      const session: AuthSession = JSON.parse(rawSession);
      session.buyer.membershipPlan = plan;
      localStorage.setItem(BUYER_SESSION_KEY, JSON.stringify(session));
    }

    this.notificationService.show(
      plan === 'gold' ? 'Gold Membership Activated 🌟' : 'Platinum VIP Activated 💎',
      plan === 'gold' 
        ? 'Gold Plan active: Verified property dossiers, exact addresses, and owner contacts are now unlocked!'
        : 'Platinum VIP Plan active: Unlimited VIP dossiers, GPS coordinates, and direct concierge contacts unlocked!',
      'gold'
    );
  }
}
