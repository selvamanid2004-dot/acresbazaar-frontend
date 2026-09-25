import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  actions?: Array<{ label: string; route: string; icon?: string }>;
}

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Floating Launcher Trigger -->
    <div class="ai-launcher-wrapper">
      
      <!-- Greeting Tooltip Bubble (Visible when chat is closed and not dismissed) -->
      <div class="launcher-bubble" *ngIf="!isOpen && showGreetingBubble" (click)="toggleChat()">
        <div class="bubble-content">
          <span class="bubble-badge">AI ASSISTANT</span>
          <p class="bubble-text">👋 Need help? Ask <strong>AcresAI</strong> about properties, rewards & plans!</p>
        </div>
        <button type="button" class="btn-dismiss-bubble" (click)="dismissGreeting($event)" title="Dismiss">✕</button>
      </div>

      <!-- Main Floating Trigger Button -->
      <button 
        type="button" 
        class="ai-trigger-btn" 
        [class.active]="isOpen" 
        (click)="toggleChat()" 
        aria-label="Open AcresAI Assistant">
        
        <div class="online-indicator"></div>

        <!-- Robot / Sparkle Icon when Closed -->
        <span class="icon-closed" *ngIf="!isOpen">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8V4H8"></path>
            <rect width="16" height="12" x="4" y="8" rx="2"></rect>
            <path d="M2 14h2"></path>
            <path d="M20 14h2"></path>
            <path d="M15 13v2"></path>
            <path d="M9 13v2"></path>
          </svg>
        </span>

        <!-- Close 'X' Icon when Opened -->
        <span class="icon-open" *ngIf="isOpen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </span>

      </button>
    </div>

    <!-- Expandable AI Chat Window -->
    <div class="ai-chat-window" [class.open]="isOpen" *ngIf="isOpen">
      
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="header-bot-info">
          <div class="bot-avatar-frame">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 8V4H8"></path>
              <rect width="16" height="12" x="4" y="8" rx="2"></rect>
              <path d="M2 14h2"></path>
              <path d="M20 14h2"></path>
              <path d="M15 13v2"></path>
              <path d="M9 13v2"></path>
            </svg>
            <span class="avatar-status-dot"></span>
          </div>
          <div class="bot-titles">
            <div class="bot-name-row">
              <span class="bot-name">AcresAI Assistant</span>
              <span class="ai-pill">24/7 AI</span>
            </div>
            <span class="bot-status">Online · Platform Knowledge & Support</span>
          </div>
        </div>

        <div class="header-actions">
          <button type="button" class="btn-head-tool" (click)="clearChat()" title="Clear Chat">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
          <button type="button" class="btn-head-tool" (click)="toggleChat()" title="Minimize">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- Quick Action Chips Bar (One-Tap Topics) -->
      <div class="quick-chips-container">
        <span class="chips-label">Popular Topics:</span>
        <div class="chips-scroll">
          <button 
            type="button" 
            class="chip-btn" 
            *ngFor="let chip of quickChips" 
            (click)="onSelectChip(chip)">
            {{ chip.label }}
          </button>
        </div>
      </div>

      <!-- Messages Scroll Area -->
      <div class="chat-messages-area" #messagesScrollContainer>
        
        <div 
          *ngFor="let msg of messages" 
          class="message-row" 
          [class.user-row]="msg.sender === 'user'" 
          [class.assistant-row]="msg.sender === 'assistant'">
          
          <!-- Assistant Avatar -->
          <div class="msg-avatar" *ngIf="msg.sender === 'assistant'">
            🤖
          </div>

          <!-- Bubble Content -->
          <div class="msg-bubble-wrap">
            <div class="msg-bubble" [innerHTML]="formatMessage(msg.text)"></div>
            
            <!-- Clickable Action Buttons if present -->
            <div class="action-buttons-wrap" *ngIf="msg.actions && msg.actions.length > 0">
              <button 
                type="button" 
                class="btn-bot-action" 
                *ngFor="let act of msg.actions" 
                (click)="onNavigateAction(act.route)">
                <span>{{ act.label }}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <span class="msg-timestamp">{{ msg.time }}</span>
          </div>

        </div>

        <!-- Thinking Indicator -->
        <div class="message-row assistant-row" *ngIf="isThinking">
          <div class="msg-avatar">🤖</div>
          <div class="msg-bubble-wrap">
            <div class="msg-bubble thinking-bubble">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="thinking-text">AcresAI is thinking...</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Input Footer Bar -->
      <form (ngSubmit)="sendMessage()" class="chat-input-form">
        <input 
          type="text" 
          class="chat-input-field" 
          [(ngModel)]="userInput" 
          name="userInput" 
          placeholder="Ask about properties, rewards, plans, or support..." 
          autocomplete="off" 
          [disabled]="isThinking" />
        
        <button 
          type="submit" 
          class="btn-chat-send" 
          [disabled]="!userInput.trim() || isThinking" 
          aria-label="Send Message">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>

    </div>
  `,
  styles: [`
    /* Floating Launcher Wrapper */
    .ai-launcher-wrapper {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 1050;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    /* Greeting Tooltip Bubble */
    .launcher-bubble {
      background: #0B132B;
      color: #FFFFFF;
      border: 1px solid rgba(197, 168, 128, 0.4);
      border-radius: 14px;
      padding: 10px 14px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: flex-start;
      gap: 10px;
      max-width: 290px;
      cursor: pointer;
      animation: floatIn 0.3s ease-out;
      transition: transform 0.2s;
    }

    .launcher-bubble:hover {
      transform: translateY(-2px);
    }

    .bubble-badge {
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #C5A880;
      background: rgba(197, 168, 128, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 4px;
    }

    .bubble-text {
      font-size: 0.82rem;
      line-height: 1.35;
      margin: 0;
      color: #E2E8F0;
    }

    .bubble-text strong {
      color: #C5A880;
    }

    .btn-dismiss-bubble {
      background: none;
      border: none;
      color: #94A3B8;
      font-size: 0.85rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
    }

    .btn-dismiss-bubble:hover {
      color: #FFFFFF;
    }

    /* Floating Trigger Button */
    .ai-trigger-btn {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0B132B 0%, #1C2541 60%, #C5A880 100%);
      color: #FFFFFF;
      border: 2px solid rgba(197, 168, 128, 0.5);
      box-shadow: 0 8px 25px rgba(11, 19, 43, 0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .ai-trigger-btn:hover {
      transform: scale(1.08) translateY(-2px);
      box-shadow: 0 12px 30px rgba(197, 168, 128, 0.4);
      border-color: #C5A880;
    }

    .online-indicator {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      background: #10B981;
      border: 2.5px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);
    }

    /* Chat Window */
    .ai-chat-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 390px;
      max-width: calc(100vw - 32px);
      height: 560px;
      max-height: calc(100vh - 120px);
      background: #FFFFFF;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(7, 13, 30, 0.25), 0 0 0 1px rgba(11, 19, 43, 0.08);
      z-index: 1050;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: chatPopup 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Chat Header */
    .chat-header {
      background: linear-gradient(135deg, #070D1E 0%, #0B132B 65%, #1C2541 100%);
      color: #FFFFFF;
      padding: 1rem 1.15rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(197, 168, 128, 0.2);
    }

    .header-bot-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bot-avatar-frame {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(197, 168, 128, 0.15);
      border: 1px solid rgba(197, 168, 128, 0.35);
      color: #C5A880;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .avatar-status-dot {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: #10B981;
      border: 2px solid #070D1E;
      border-radius: 50%;
    }

    .bot-titles {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    .bot-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .bot-name {
      font-size: 0.96rem;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.01em;
    }

    .ai-pill {
      font-size: 0.6rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      background: #C5A880;
      color: #070D1E;
      padding: 1px 5px;
      border-radius: 4px;
    }

    .bot-status {
      font-size: 0.72rem;
      color: #94A3B8;
      font-weight: 500;
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-head-tool {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #CBD5E1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-head-tool:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #FFFFFF;
    }

    /* Quick Chips Bar */
    .quick-chips-container {
      background: #F8FAFC;
      border-bottom: 1px solid #E2E8F0;
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .chips-label {
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748B;
    }

    .chips-scroll {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 2px;
      scrollbar-width: none;
    }

    .chips-scroll::-webkit-scrollbar {
      display: none;
    }

    .chip-btn {
      white-space: nowrap;
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      color: #0F172A;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .chip-btn:hover {
      background: #0B132B;
      color: #FFFFFF;
      border-color: #0B132B;
    }

    /* Messages Scroll Area */
    .chat-messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #FDFDFE;
    }

    .message-row {
      display: flex;
      gap: 8px;
      max-width: 92%;
    }

    .message-row.user-row {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message-row.assistant-row {
      align-self: flex-start;
    }

    .msg-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      flex-shrink: 0;
    }

    .msg-bubble-wrap {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .msg-bubble {
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.88rem;
      line-height: 1.45;
      word-break: break-word;
    }

    .user-row .msg-bubble {
      background: #0B132B;
      color: #FFFFFF;
      border-bottom-right-radius: 2px;
    }

    .assistant-row .msg-bubble {
      background: #F1F5F9;
      color: #0F172A;
      border: 1px solid #E2E8F0;
      border-bottom-left-radius: 2px;
    }

    /* Bot Action Buttons */
    .action-buttons-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .btn-bot-action {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #FFFFFF;
      border: 1.5px solid #0B132B;
      color: #0B132B;
      font-size: 0.78rem;
      font-weight: 700;
      padding: 5px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-bot-action:hover {
      background: #0B132B;
      color: #C5A880;
      transform: translateY(-1px);
    }

    .msg-timestamp {
      font-size: 0.65rem;
      color: #94A3B8;
      align-self: flex-start;
    }

    .user-row .msg-timestamp {
      align-self: flex-end;
    }

    /* Thinking Bubble */
    .thinking-bubble {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #64748B;
      font-size: 0.8rem;
      font-style: italic;
    }

    .dot {
      width: 6px;
      height: 6px;
      background: #94A3B8;
      border-radius: 50%;
      animation: blink 1.2s infinite ease-in-out;
    }

    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    /* Input Footer */
    .chat-input-form {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      background: #FFFFFF;
      border-top: 1px solid #E2E8F0;
    }

    .chat-input-field {
      flex: 1;
      height: 42px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 22px;
      padding: 0 16px;
      font-size: 0.88rem;
      color: #0F172A;
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input-field:focus {
      border-color: #0B132B;
      background: #FFFFFF;
    }

    .btn-chat-send {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #0B132B;
      color: #C5A880;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      flex-shrink: 0;
    }

    .btn-chat-send:hover:not(:disabled) {
      background: #1C2541;
      transform: scale(1.05);
    }

    .btn-chat-send:disabled {
      background: #E2E8F0;
      color: #94A3B8;
      cursor: not-allowed;
    }

    /* Animations */
    @keyframes floatIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes chatPopup {
      from { opacity: 0; transform: scale(0.95) translateY(15px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes blink {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.1); }
    }

    @media (max-width: 480px) {
      .ai-chat-window {
        bottom: 84px;
        right: 12px;
        left: 12px;
        width: auto;
        height: 80vh;
      }
    }
  `]
})
export class AiChatbotComponent implements OnInit, AfterViewChecked {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  @ViewChild('messagesScrollContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  showGreetingBubble = true;
  isThinking = false;
  userInput = '';
  chatId: string | null = null;

  quickChips = [
    { label: '📸 Snap Property & Rewards', query: 'How does Snap Property and 1000 points reward work?' },
    { label: '💰 How to Claim ₹1,000 Payout', query: 'How do I submit bank details and get my reward payout?' },
    { label: '⭐ Gold vs Platinum Plans', query: 'What is the difference between Gold Plan and Platinum VIP?' },
    { label: '🏠 Sell My Property', query: 'How can I register and post my property as a Seller?' },
    { label: '🏢 Dealer Commercial Portal', query: 'How does the Dealer and Real Estate Agency portal work?' },
    { label: '🔍 Explore Properties', query: 'What property categories are available to search?' },
    { label: '🛠️ Customer Support & Problems', query: 'I have a problem and need customer support helpline' }
  ];

  messages: ChatMessage[] = [];

  ngOnInit(): void {
    // Restore session if available or initialize with greeting
    const savedChatId = localStorage.getItem('aura_ai_chat_id');
    if (savedChatId) {
      this.chatId = savedChatId;
    }

    this.messages = [
      {
        id: 'msg_welcome',
        sender: 'assistant',
        text: `👋 **Welcome to AcresBazaar!**\n\nI am **AcresAI**, your 24/7 intelligent platform assistant.\n\nI can answer any question about our website, guide you through **Snap Property (+100 pts / ₹1,000 cash reward)**, explain **Gold & Platinum VIP plans**, help you **buy, sell, or rent properties**, and resolve customer support issues immediately.\n\nHow can I help you today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          { label: '📸 Snap & Earn Rewards', route: '/snap-property/upload' },
          { label: '⭐ View Membership Plans', route: '/plans/gold' },
          { label: '🔍 Search Properties', route: '/all-residential' }
        ]
      }
    ];
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.showGreetingBubble = false;
    }
  }

  dismissGreeting(event: Event): void {
    event.stopPropagation();
    this.showGreetingBubble = false;
  }

  clearChat(): void {
    this.chatId = null;
    localStorage.removeItem('aura_ai_chat_id');
    this.messages = [
      {
        id: 'msg_reset',
        sender: 'assistant',
        text: `Conversation cleared. How can I assist you with AcresBazaar today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  }

  onSelectChip(chip: { label: string; query: string }): void {
    this.userInput = chip.query;
    this.sendMessage();
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.isThinking) return;

    // Push User Message
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.messages.push(userMsg);
    this.userInput = '';
    this.isThinking = true;

    // Detect user context if logged in
    let userName = 'Guest Visitor';
    let userEmail = '';
    try {
      const spotterSession = localStorage.getItem('aura_common_session');
      if (spotterSession) {
        const u = JSON.parse(spotterSession).user;
        userName = u?.name || userName;
        userEmail = u?.email || userEmail;
      } else if (this.authService.isAuthenticated()) {
        userName = this.authService.currentBuyer()?.fullName || userName;
        userEmail = this.authService.currentBuyer()?.email || userEmail;
      } else if (this.authService.isSellerAuthenticated()) {
        userName = this.authService.currentSeller()?.fullName || userName;
        userEmail = this.authService.currentSeller()?.email || userEmail;
      } else if (this.authService.isDealerAuthenticated()) {
        userName = this.authService.currentDealer()?.businessName || userName;
        userEmail = this.authService.currentDealer()?.email || userEmail;
      }
    } catch {}

    const payload = {
      message: text,
      chatId: this.chatId || undefined,
      userName,
      userEmail
    };

    this.http.post<any>('http://localhost:5001/api/chats/ai-assistant', payload).subscribe({
      next: (res) => {
        this.isThinking = false;
        if (res.chatId) {
          this.chatId = res.chatId;
          localStorage.setItem('aura_ai_chat_id', res.chatId);
        }

        const botMsg: ChatMessage = {
          id: 'ast_' + Date.now(),
          sender: 'assistant',
          text: res.reply || 'I am ready to help you with anything on AcresBazaar.',
          actions: res.actions || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.messages.push(botMsg);
      },
      error: (err) => {
        this.isThinking = false;
        const errMsg: ChatMessage = {
          id: 'ast_err_' + Date.now(),
          sender: 'assistant',
          text: `⚠️ I encountered a temporary connection issue. Please feel free to ask again or reach our 24/7 helpline at **+91 8000-123-456** or **support@acresbazaar.com**.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { label: '📞 Help & Contact', route: '/about' }
          ]
        };
        this.messages.push(errMsg);
      }
    });
  }

  onNavigateAction(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  formatMessage(text: string): string {
    if (!text) return '';
    
    // Bold **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return formatted;
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch {}
  }
}
