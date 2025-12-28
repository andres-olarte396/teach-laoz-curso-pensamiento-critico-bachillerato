import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService, type BlogPost } from '../../services/blogService';
import { ContentRenderer } from '../../components/ContentRenderer';
import { Volume2 } from 'lucide-react';
import { useTts } from '../../hooks/useTts';

import { TtsFloatingControls } from '../../components/TtsFloatingControls';

export const BlogPostPage: React.FC = () => {
  const { '*': slug } = useParams<{ '*': string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const { 
    isReading, 
    isPaused, 
    availableVoices,
    selectedVoiceURI,
    startReading, 
    pauseReading, 
    resumeReading, 
    stopReading,
    seekForward,
    seekBackward,
    setVoice,
    rate,
    setRate
  } = useTts({
    contentSelector: '.blog-content-area'
  });

  // Stop reading when navigating away
  useEffect(() => {
    return () => stopReading();
  }, [slug, stopReading]);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const data = await blogService.getPost(slug);
        setPost(data);
        
        // Mark as read in localStorage
        const readPosts = JSON.parse(localStorage.getItem('laoz_read_posts') || '[]');
        if (!readPosts.includes(slug)) {
          readPosts.push(slug);
          localStorage.setItem('laoz_read_posts', JSON.stringify(readPosts));
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading post...</div>;
  if (!post) return <div className="p-8 text-center text-red-400">Post not found.</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Floating TTS Controls */}
      <TtsFloatingControls 
        isReading={isReading}
        isPaused={isPaused}
        onPause={pauseReading}
        onResume={resumeReading}
        onStop={stopReading}
        onSeekForward={seekForward}
        onSeekBackward={seekBackward}
        availableVoices={availableVoices}
        selectedVoiceURI={selectedVoiceURI}
        onVoiceChange={setVoice}
        rate={rate}
        onRateChange={setRate}
      />

      <div className="flex justify-between items-center mb-8">
        <Link to="/blog" className="text-sm text-primary hover:underline">&larr; Volver al Blog</Link>
        
        {/* TTS Toggle Button */}
        <div className="flex items-center gap-2">
            {!isReading ? (
              <button 
                onClick={startReading}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--color-primary)] transition-all text-xs font-bold uppercase tracking-wider"
              >
                <Volume2 size={14} />
                Leer Artículo
              </button>
            ) : (
                <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-emerald-500 animate-pulse bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                  Escuchando...
                </div>
            )}
        </div>
      </div>
      
      <article className="blog-content-area">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--text-main)] mb-2">{post.title}</h1>
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] border-b border-[var(--border-color)] pb-8">
             <span>{new Date(post.date).toLocaleDateString()}</span>
             <span>by {post.author}</span>
             <div className="flex gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--bg-app)] text-[var(--text-muted)] border border-[var(--border-color)]">#{tag}</span>
              ))}
             </div>
          </div>
        </div>

        {post.html ? (
          <ContentRenderer 
            html={post.html} 
            // Add class needed for the TTS selector if ContentRenderer allows wrapper class or we just wrap it
            // ContentRenderer usually renders into a div. We should check if we can add a class or if we just wrapped it with article.blog-content-area which we did.
          />
        ) : (
          <div className="text-red-400">Error: Could not render content.</div>
        )}
      </article>
      
      <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
         <Link to="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Buscar más artículos</Link>
      </div>
    </div>
  );
};
