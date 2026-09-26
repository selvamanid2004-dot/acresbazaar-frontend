import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { getApiBaseUrl } from '../../../core/services/api-config';

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
  templateUrl: './ai-chatbot.component.html',
  styleUrl: './ai-chatbot.component.css'
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

    this.http.post<any>(`${getApiBaseUrl()}/chats/ai-assistant`, payload).subscribe({
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
