import React, { useState, useEffect } from 'react';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  slug: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ slug }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blog/comments/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const handleAddComment = async (data: { authorName: string; content: string }) => {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/blog/comments/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prev) => [newComment, ...prev]);
      } else {
        setError('No se pudo publicar el comentario. Por favor intenta de nuevo.');
      }
    } catch (err) {
      setError('Ocurrió un error de red. Verifica tu conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-16 space-y-4 animate-pulse">
        <div className="h-8 bg-white/5 rounded w-1/4"></div>
        <div className="h-32 bg-white/5 rounded"></div>
      </div>
    );
  }

  return (
    <section className="mt-24 pt-16 border-t border-white/10 max-w-3xl mx-auto px-4 sm:px-0">
      <div className="flex flex-col gap-12">
        <CommentList comments={comments} />
        
        <div className="sticky bottom-8 z-10">
          <CommentForm onSubmit={handleAddComment} isSubmitting={submitting} />
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs text-center animate-bounce">
              {error}
            </div>
          )}
        </div>
      </div>
      <div className="h-10"></div> {/* Bottom spacer */}
    </section>
  );
};
