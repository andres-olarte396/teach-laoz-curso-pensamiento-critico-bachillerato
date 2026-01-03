import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';
import { MessageSquare, Send, User, Bold, Italic, Code, Link as LinkIcon, List, Smile, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EmojiPicker from 'emoji-picker-react';

interface Comment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  resourceId: string;
  title?: string;
  compact?: boolean; // New prop for sidebar mode
  onClose?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ resourceId, title = "Foro de Discusión", compact = false, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchComments();
  }, [resourceId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await apiService.getComments(resourceId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await apiService.addComment(resourceId, newComment);
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const insertFormat = (format: 'bold' | 'italic' | 'code' | 'link' | 'list') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = newComment;
    let before = text.substring(0, start);
    let selection = text.substring(start, end);
    let after = text.substring(end);
    let newText = '';
    let newCursorPos = 0;

    switch (format) {
      case 'bold':
        newText = `${before}**${selection || 'texto en negrita'}**${after}`;
        newCursorPos = selection ? end + 4 : start + 2;
        break;
      case 'italic':
        newText = `${before}_${selection || 'texto en cursiva'}_${after}`;
        newCursorPos = selection ? end + 2 : start + 1;
        break;
      case 'code':
        newText = `${before}\`${selection || 'código'}\`${after}`;
        newCursorPos = selection ? end + 2 : start + 1;
        break;
      case 'link':
        newText = `${before}[${selection || 'título'}](url)${after}`;
        newCursorPos = selection ? end + 3 : start + 1;
        break;
      case 'list': 
        newText = `${before}\n- ${selection || 'elemento de lista'}${after}`;
        newCursorPos = newText.length;
        break;
    }

    setNewComment(newText);
    setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const onEmojiClick = (emojiData: any) => {
    const emoji = emojiData.emoji;
    if (!textareaRef.current) {
        setNewComment(prev => prev + emoji);
        return;
    }
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = newComment;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    setNewComment(`${before}${emoji}${after}`);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
        const newPos = start + emoji.length;
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm flex flex-col h-full ${compact ? 'p-4' : 'p-8 mt-12'}`}>
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
            <MessageSquare className="text-[var(--color-primary)]" size={compact ? 20 : 24} />
            <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-[var(--text-main)] m-0 border-none`}>{title}</h2>
        </div>
        {onClose && (
            <button 
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition-colors"
                title="Cerrar foro"
            >
                <X size={20} />
            </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative flex-shrink-0 mb-6">
        <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu pregunta (soporta Markdown)..."
            className="w-full bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl p-3 pr-12 min-h-[100px] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all resize-none placeholder-[var(--text-muted)] text-sm"
        />
        <div className="flex items-center gap-1 mt-2 px-1 justify-between">
            <div className="flex items-center gap-1">
                <button type="button" onClick={() => insertFormat('bold')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors" title="Negrita"><Bold size={14}/></button>
                <button type="button" onClick={() => insertFormat('italic')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors" title="Cursiva"><Italic size={14}/></button>
                <button type="button" onClick={() => insertFormat('code')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors" title="Código"><Code size={14}/></button>
                <button type="button" onClick={() => insertFormat('link')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors" title="Enlace"><LinkIcon size={14}/></button>
                <button type="button" onClick={() => insertFormat('list')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors" title="Lista"><List size={14}/></button>
                
                <div className="relative">
                    <button 
                        type="button" 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                        className={`p-1.5 rounded transition-colors ${showEmojiPicker ? 'text-[var(--color-primary)] bg-[var(--bg-app)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)]'}`}
                        title="Emoji"
                    >
                        <Smile size={14}/>
                    </button>
                    {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-2 z-50">
                            <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                            <div className="relative z-50">
                                <EmojiPicker 
                                    onEmojiClick={onEmojiClick}
                                    theme={'dark' as any}
                                    width={300}
                                    height={400}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="p-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[var(--color-primary)]/20"
            >
                {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <Send size={16} />
                )}
            </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar min-h-[200px]">
        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)] animate-pulse">Cargando comentarios...</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)] bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)] border-dashed text-sm">
            Sé el primero en iniciar la discusión sobre este tema.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
               {/* ... (comment content remains same, just ensuring flex-col-reverse parent handles order if desired, or standard order) ... NO, standard order is better for "Forum", reverse is for "Chat". User said "Foro". I will keep standard mapping but form at top. */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] mt-1">
                <User size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between mb-1">
                  <h4 className="font-bold text-[var(--text-main)] text-sm truncate">{comment.authorName}</h4>
                    {(() => {
                      const date = new Date(comment.createdAt);
                      return !isNaN(date.getTime()) 
                        ? formatDistanceToNow(date, { addSuffix: true, locale: es })
                        : 'hace un momento';
                    })()}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-muted)] text-sm leading-relaxed bg-[var(--bg-app)] p-3 rounded-r-xl rounded-bl-xl border border-[var(--border-color)] group-hover:border-[var(--color-primary)]/30 transition-colors break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
