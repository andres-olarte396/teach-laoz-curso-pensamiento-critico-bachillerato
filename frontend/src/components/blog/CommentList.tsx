import React from 'react';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentListProps {
  comments: Comment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
  const { user } = useAuth();

  if (comments.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-white/10">
        <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">Aún no hay comentarios. ¡Sé el primero en participar!</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          Conversación ({comments.length})
        </h3>
      </div>
      
      <div className="flex flex-col gap-6">
        {[...comments].reverse().map((comment) => {
          const isMe = user?.name === comment.authorName;
          
          return (
            <div 
              key={comment.id} 
              className={`flex gap-4 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ring-2 ring-slate-200 dark:ring-white/5 ${
                isMe ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-slate-700'
              }`}>
                {getInitials(comment.authorName)}
              </div>

              {/* Bubble Container */}
              <div className={`flex flex-col max-w-[85%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Author & Date */}
                <div className="flex items-center gap-2 mb-1 px-1">
                  {!isMe && <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">{comment.authorName}</span>}
                  <span className="text-[10px] text-gray-500">
                    {format(new Date(comment.createdAt), "HH:mm '·' d MMM", { locale: es })}
                  </span>
                </div>

                {/* Bubble */}
                <div className={`relative px-4 py-3 rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                  isMe 
                    ? 'bg-blue-600 border-blue-500 text-white rounded-tr-none shadow-blue-500/10' 
                    : 'bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-main)] rounded-tl-none'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
