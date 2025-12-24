import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService, type BlogPost } from '../../services/blogService';
import { ContentRenderer } from '../../components/ContentRenderer';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const data = await blogService.getPost(slug);
        setPost(data);
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
      <Link to="/blog" className="text-sm text-primary hover:underline mb-8 inline-block">&larr; Back to Blog</Link>
      
      <article>
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
            // Blog posts are usually simple Markdown so no special relative path handling is needed unless images are used
            // If images are used, we might need to pass a path context. For now, we omit path or default it.
          />
        ) : (
          <div className="text-red-400">Error: Could not render content.</div>
        )}
      </article>
      
      <div className="mt-12 pt-8 border-t border-[var(--border-color)]">
         <Link to="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Browse more articles</Link>
      </div>
    </div>
  );
};
