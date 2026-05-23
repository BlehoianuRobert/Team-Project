import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { chatService, ChatMessage } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import './ChatWidget.css';

const WELCOME_MSG: ChatMessage = {
  role: 'assistant',
  content:
    'Bună! 👋 Sunt asistentul virtual al platformei. Te pot ajuta cu informații despre închirierile tale, produse sau cum funcționează platforma. Cu ce te pot ajuta?',
};

function formatMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const listMatch = line.match(/^[\s]*[-•]\s+(.*)/);
    if (listMatch) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${listMatch[1]}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (line.trim() === '') {
        result.push('<br/>');
      } else {
        result.push(`<p>${line}</p>`);
      }
    }
  }
  if (inList) result.push('</ul>');

  return result.join('');
}

const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const html = useMemo(() => formatMarkdown(content), [content]);
  return <div className="chat-msg-content" dangerouslySetInnerHTML={{ __html: html }} />;
};

const ChatWidget: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const history = newMessages.filter((m) => m.role === 'user' || m.role === 'assistant');
      const res = await chatService.sendMessage(text, history.slice(0, -1));
      setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Ne pare rău, a apărut o eroare. Încercați din nou.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-panel-header">
            <div>
              <h3>Asistent Virtual</h3>
              <div className="chat-panel-header-sub">Online Rental System</div>
            </div>
            <button className="chat-close-btn" onClick={() => setOpen(false)} title="Închide">
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
                {msg.role === 'assistant' ? (
                  <FormattedMessage content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-typing">
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
                <span className="chat-typing-dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Scrie un mesaj..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!input.trim() || loading}
            >
              Trimite
            </button>
          </div>
        </div>
      )}

      <button
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Închide chat' : 'Deschide chat'}
      >
        {open ? (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
