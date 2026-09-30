import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Sparkles, 
  Users, 
  UserPlus, 
  Send, 
  MessageSquare, 
  ArrowUpRight,
  AlertCircle,
  Award,
  ShieldCheck,
  UserCog
} from 'lucide-react';
import { DashboardStats, ChatConversation } from '../types';
import { api } from '../services/api';
import { CalendarWidget } from '../components/CalendarWidget';
import { ChatModal } from '../components/ChatModal';
import { getCurrentAdminUser, hasModulePermission } from '../services/authUtils';

export const Dashboard: React.FC = () => {
  const adminUser = getCurrentAdminUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    newProperties: 0,
    totalCustomers: 0,
    newCustomers: 0,
    postedProperties: 0,
  });
  const [recentChats, setRecentChats] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const canProperties = hasModulePermission(adminUser, 'properties');
  const canCustomers = hasModulePermission(adminUser, 'customers') || hasModulePermission(adminUser, 'buyers') || hasModulePermission(adminUser, 'sellers') || hasModulePermission(adminUser, 'dealers');
  const canReports = hasModulePermission(adminUser, 'reports');
  const canRewards = hasModulePermission(adminUser, 'rewards');
  const canPartners = hasModulePermission(adminUser, 'verified_partners');
  const canStaff = hasModulePermission(adminUser, 'staff_management') || adminUser?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, chatsData] = await Promise.all([
          api.getDashboardStats(),
          api.getRecentChats(),
        ]);
        setStats(statsData);
        setRecentChats(chatsData);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div>
      {/* Summary Cards */}
      <div className="dash-metric-grid">
        {/* 1. Total Properties */}
        {canProperties && (
          <div className="dash-card">
            <div className="dash-card-info">
              <h3>Total Properties</h3>
              <div className="metric-num">
                {loading ? '...' : stats.totalProperties}
              </div>
            </div>
            <div className="dash-card-icon" style={{ backgroundColor: 'rgba(2, 132, 199, 0.12)', color: '#38bdf8' }}>
              <Building2 size={24} />
            </div>
          </div>
        )}

        {/* 2. New Properties */}
        {canProperties && (
          <div className="dash-card">
            <div className="dash-card-info">
              <h3>New Properties</h3>
              <div className="metric-num">
                {loading ? '...' : stats.newProperties}
              </div>
            </div>
            <div className="dash-card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Sparkles size={24} />
            </div>
          </div>
        )}

        {/* 3. Total Customers */}
        {canCustomers && (
          <div className="dash-card">
            <div className="dash-card-info">
              <h3>Total Customers</h3>
              <div className="metric-num">
                {loading ? '...' : stats.totalCustomers}
              </div>
            </div>
            <div className="dash-card-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#34d399' }}>
              <Users size={24} />
            </div>
          </div>
        )}

        {/* 4. New Customers */}
        {canCustomers && (
          <div className="dash-card">
            <div className="dash-card-info">
              <h3>New Customers</h3>
              <div className="metric-num">
                {loading ? '...' : stats.newCustomers}
              </div>
            </div>
            <div className="dash-card-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <UserPlus size={24} />
            </div>
          </div>
        )}

        {/* 5. Posted Properties */}
        {canProperties && (
          <div className="dash-card">
            <div className="dash-card-info">
              <h3>Posted Properties</h3>
              <div className="metric-num">
                {loading ? '...' : stats.postedProperties}
              </div>
            </div>
            <div className="dash-card-icon" style={{ backgroundColor: 'rgba(244, 63, 94, 0.12)', color: '#fb7185' }}>
              <Send size={24} />
            </div>
          </div>
        )}

        {/* 6. Staff & Admin module card (if permitted) */}
        {canStaff && (
          <div className="dash-card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/staff-management'}>
            <div className="dash-card-info">
              <h3>Administrators & Staff</h3>
              <div className="metric-num" style={{ fontSize: '18px', color: '#60a5fa' }}>
                Manage RBAC
              </div>
            </div>
            <div className="dash-card-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <UserCog size={24} />
            </div>
          </div>
        )}

        {/* 7. Reports module card (if permitted and properties hidden) */}
        {canReports && !canProperties && (
          <div className="dash-card" style={{ cursor: 'pointer' }} onClick={() => window.location.href = '/reports'}>
            <div className="dash-card-info">
              <h3>Reports & Moderation</h3>
              <div className="metric-num" style={{ fontSize: '18px', color: '#f87171' }}>
                Active Desk
              </div>
            </div>
            <div className="dash-card-icon" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <AlertCircle size={24} />
            </div>
          </div>
        )}
      </div>

      {/* Alongside/Below: RECENT CHATS (3 latest) & SMALL CALENDAR */}
      <div className="dash-bottom-grid">
        {/* Recent Chats */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <MessageSquare size={18} style={{ color: 'var(--gold-primary)' }} />
              <span>Recent Chats</span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Showing latest 3 inquiries
            </span>
          </div>

          <div className="chat-list">
            {recentChats.slice(0, 3).map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${chat.unread ? 'unread' : ''}`}
                onClick={() => setActiveChatId(chat.id)}
              >
                <div className="chat-avatar">
                  {chat.userName ? chat.userName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="chat-content">
                  <div className="chat-top-row">
                    <span className="chat-username">{chat.userName}</span>
                    <span className="chat-time">
                      {new Date(chat.lastMessageAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="chat-preview">{chat.lastMessage}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {chat.unread ? (
                    <span className="badge badge-pending">Unread</span>
                  ) : (
                    <span className="badge badge-active">Read</span>
                  )}
                  <ArrowUpRight size={16} color="var(--text-muted)" />
                </div>
              </div>
            ))}

            {recentChats.length === 0 && (
              <div className="empty-state">
                <MessageSquare size={36} className="empty-state-icon" />
                <h4>No recent chats</h4>
                <p style={{ fontSize: '13px' }}>Customer inquiries will appear here dynamically.</p>
              </div>
            )}
          </div>
        </div>

        {/* Small Calendar */}
        <div>
          <CalendarWidget />
        </div>
      </div>

      {/* Chat Conversation Modal */}
      {activeChatId && (
        <ChatModal
          conversationId={activeChatId}
          onClose={() => {
            setActiveChatId(null);
            // Refresh chats to clear unread
            api.getRecentChats().then(setRecentChats);
          }}
        />
      )}
    </div>
  );
};
