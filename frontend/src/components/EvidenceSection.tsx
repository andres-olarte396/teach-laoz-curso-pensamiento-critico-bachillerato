import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../services/apiService';
import type { Evidence } from '../services/apiService';
import { MessageSquare, Send, User, Bold, Italic, Code, Link as LinkIcon, List, Smile, X, Lock, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import EmojiPicker from 'emoji-picker-react';

interface EvidenceSectionProps {
  courseId: string;
  lessonId: string;
  onClose?: () => void;
  compact?: boolean;
}

export const EvidenceSection: React.FC<EvidenceSectionProps> = ({ courseId, lessonId, onClose, compact = false }) => {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [newEvidence, setNewEvidence] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchEvidence();
  }, [courseId, lessonId]);

  const fetchEvidence = async () => {
    setLoading(true);
    try {
      const data = await apiService.getEvidence(courseId, lessonId);
      setEvidenceList(data);
    } catch (error) {
      console.error('Error fetching evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidence.trim()) return;

    setSubmitting(true);
    try {
      await apiService.addEvidence(courseId, lessonId, newEvidence);
      setNewEvidence('');
      await fetchEvidence();
    } catch (error) {
      console.error('Error adding evidence:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const insertFormat = (format: 'bold' | 'italic' | 'code' | 'link' | 'list') => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = newEvidence;
    let before = text.substring(0, start);
    let selection = text.substring(start, end);
    let after = text.substring(end);
    let newText = '';
    let newCursorPos = 0;

    switch (format) {
      case 'bold': newText = `${before}**${selection || 'texto'}**${after}`; newCursorPos = selection ? end + 4 : start + 2; break;
      case 'italic': newText = `${before}_${selection || 'texto'}_${after}`; newCursorPos = selection ? end + 2 : start + 1; break;
      case 'code': newText = `${before}\`${selection || 'code'}\`${after}`; newCursorPos = selection ? end + 2 : start + 1; break;
      case 'link': newText = `${before}[${selection || 'título'}](url)${after}`; newCursorPos = selection ? end + 3 : start + 1; break;
      case 'list': newText = `${before}\n- ${selection || 'item'}${after}`; newCursorPos = newText.length; break;
    }

    setNewEvidence(newText);
    setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos); }, 0);
    setTimeout(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos); }, 0);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await apiService.uploadFile(file);
      // Insert image markdown or link depending on type
      const isImage = file.type.startsWith('image/');
      const markdown = isImage ? `\n![${file.name}](${url})\n` : `\n[📎 ${file.name}](${url})\n`;
      setNewEvidence(prev => prev + markdown);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setNewEvidence(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl shadow-sm flex flex-col h-full ${compact ? 'p-4' : 'p-8 mt-12'}`}>
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
            <Lock className="text-amber-500" size={compact ? 20 : 24} />
            <h2 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-[var(--text-main)] m-0 border-none`}>Mi Bitácora</h2>
        </div>
        {onClose && (
            <button onClick={onClose} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] transition-colors"><X size={20} /></button>
        )}
      </div>

      <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-500/80 flex gap-2">
        <Lock size={14} className="shrink-0 mt-0.5" />
        <p>Este espacio es privado. Solo tú puedes ver las notas y evidencias que guardes aquí.</p>
      </div>

       <form onSubmit={handleSubmit} className="relative flex-shrink-0 mb-6">
        <textarea
            ref={textareaRef}
            value={newEvidence}
            onChange={(e) => setNewEvidence(e.target.value)}
            placeholder="Escribe tus notas, reflexiones o pega código como evidencia..."
            className="w-full bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-color)] rounded-xl p-3 pr-12 min-h-[100px] focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none placeholder-[var(--text-muted)] text-sm"
        />
        <div className="flex items-center gap-1 mt-2 px-1 justify-between">
            <div className="flex items-center gap-1">
                 <button type="button" onClick={() => insertFormat('bold')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors"><Bold size={14}/></button>
                 <button type="button" onClick={() => insertFormat('italic')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors"><Italic size={14}/></button>
                 <button type="button" onClick={() => insertFormat('code')} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors"><Code size={14}/></button>
                 
                 <div className="relative inline-block">
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors disabled:opacity-50">
                        {uploading ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Paperclip size={14}/>}
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload}
                        accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                 </div>
                 
                 <div className="relative">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-app)] rounded transition-colors"><Smile size={14}/></button>
                    {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-2 z-50">
                            <div className="fixed inset-0" onClick={() => setShowEmojiPicker(false)} />
                            <div className="relative z-50"><EmojiPicker onEmojiClick={onEmojiClick} theme={'dark' as any} width={300} height={400} /></div>
                        </div>
                    )}
                </div>
            </div>
            <button type="submit" disabled={submitting || !newEvidence.trim()} className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors shadow-lg shadow-amber-500/20">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
            </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-[200px]">
        {loading ? (
          <div className="text-center py-8 text-[var(--text-muted)] animate-pulse">Cargando bitácora...</div>
        ) : evidenceList.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)] bg-[var(--bg-app)] rounded-xl border border-[var(--border-color)] border-dashed text-sm">
            No tienes evidencias guardadas para este tema aún.
          </div>
        ) : (
          evidenceList.map((item) => (
            <div key={item.id} className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-2 text-xs text-[var(--text-muted)]">
                   <span className="font-medium text-amber-500 flex items-center gap-1"><Lock size={10} /> Nota Privada</span>
                   <span>
                       {(() => {
                           const date = new Date(item.createdAt);
                           return !isNaN(date.getTime()) ? formatDistanceToNow(date, { addSuffix: true, locale: es }) : '';
                       })()}
                   </span>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-muted)] text-sm">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.content}</ReactMarkdown>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
