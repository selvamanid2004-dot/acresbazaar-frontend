import React, { useState, useEffect } from 'react';
import { X, Send, User, CheckCircle2 } from 'lucide-react';
import { ChatConversation, ChatMessage } from '../types';
import { api } from '../services/api';

interface ChatModalProps {
  conversationId: string | null;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ conversationId, onClose }) => {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!conversationId) return;
    setLoading(true);
    api.getChat(conversationId)
      .then((data) => setConversation(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [conversationId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;
    setSending(true);
    try {
      const msg: ChatMessage = await api.sendChatMessage(conversationId, newMessage.trim());
      if (conversation) {
        setConversation({
          ...conversation,
          messages: [...conversation.messages, msg],
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
        });
      }
      setNewMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (!conversationId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>
              {conversation?.userName || 'Customer Inquiry'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {conversation?.userEmail || 'Client Message Thread'}
              {conversation?.propertyTitle ? ` • ${conversation.propertyTitle}` : ''}
            </div>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ height: '380px', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading conversation...</div>
          ) : conversation?.messages && conversation.messages.length > 0 ? (
            conversation.messages.map((m) => {
              const isAdmin = m.senderRole === 'ADMIN';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    backgroundColor: isAdmin ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-input)',
                    border: `1px solid ${isAdmin ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: isAdmin ? 'var(--gold-primary)' : 'var(--text-secondary)', marginBottom: '4px' }}>
                    {m.senderName} {isAdmin ? '(Admin)' : ''}
                  </div>
                  <div style={{ fontSize: '13.5px', color: '#fff', wordBreak: 'break-word' }}>
                    {m.message}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <User size={36} className="empty-state-icon" />
              <h4>No conversation history</h4>
              <p style={{ fontSize: '13px' }}>Start the conversation below.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="modal-footer" style={{ justifyContent: 'stretch' }}>
          <input
            type="text"
            className="form-control"
            placeholder="Type your response to the customer..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()}>
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
