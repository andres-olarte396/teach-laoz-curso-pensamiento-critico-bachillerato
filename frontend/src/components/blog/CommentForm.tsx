import React, { useState, useEffect, useRef } from 'react';
import { Send, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CommentFormProps {
  onSubmit: (data: { authorName: string; content: string }) => Promise<void>;
  isSubmitting: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isSubmitting }) => {
  const { user } = useAuth();
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user?.name) {
      setAuthorName(user.name);
    }
  }, [user]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim() || isSubmitting) return;
    
    await onSubmit({ authorName, content });
    setContent('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative group">
      {/* Background Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] opacity-10 group-focus-within:opacity-30 blur-xl transition-opacity duration-500"></div>
      
      <form 
        onSubmit={handleSubmit} 
        className="relative bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl p-2 gap-2 flex flex-col shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-500"
      >
        {/* Author Badge */}
        {!user && (
          <div className="flex items-center gap-2 px-3 pt-2">
            <div className="flex items-center gap-2 bg-[var(--bg-app)] border border-[var(--border-color)] px-3 py-1 rounded-full">
              <User className="w-3 h-3 text-blue-500" />
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Tu nombre..."
                required
                className="bg-transparent border-none p-0 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 w-32"
              />
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 p-1">
          {/* Avatar Area */}
          <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 border border-blue-200 mb-1 ml-1 group-focus-within:scale-110 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>

          {/* Textarea */}
          <div className="flex-grow">
            <textarea
              ref={textareaRef}
              rows={1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={user ? `Responder como ${user.name}...` : "Escribe un comentario..."}
              required
              className="w-full bg-transparent border-none py-3 px-2 text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-0 transition-all resize-none max-h-[150px] text-sm overflow-y-auto"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex-shrink-0 w-11 h-11 bg-blue-600 hover:bg-blue-500 disabled:bg-[var(--bg-app)] disabled:text-[var(--text-muted)] text-white rounded-2xl shadow-xl hover:shadow-blue-500/30 transition-all duration-200 flex items-center justify-center group/btn mb-0.5 mr-0.5"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            )}
          </button>
        </div>
        
        {/* Footer info */}
        <div className="px-4 pb-2 flex justify-between items-center opacity-60">
           <span className="text-[10px] text-[var(--text-muted)] font-medium">Shift + Enter para nueva línea</span>
           {user && <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">Sesión: {user.name}</span>}
        </div>
      </form>
    </div>
  );
};
