import React, { useEffect, useState } from 'react';
import { blogService, type BlogPost } from '../../services/blogService';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const BlogListPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [readPosts, setReadPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load read status
    const savedReadPosts = JSON.parse(localStorage.getItem('laoz_read_posts') || '[]');
    setReadPosts(savedReadPosts);

    const fetchPosts = async () => {
      try {
        const data = await blogService.getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    let result = posts;
    
    // Filter by category
    if (category) {
      result = posts.filter(post => 
        post.slug.startsWith(`${category}/`) || 
        post.tags.some(tag => tag.toLowerCase().replace(/\s+/g, '-') === category)
      );
    }

    // Sort: Unread first, then Read. Within each group, most recent first.
    const sorted = [...result].sort((a, b) => {
      const isARead = readPosts.includes(a.slug);
      const isBRead = readPosts.includes(b.slug);

      if (isARead !== isBRead) {
        return isARead ? 1 : -1; // Read goes to the end
      }

      // If both same status, use date (backend already returns them mostly sorted by date, but good to be sure)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFilteredPosts(sorted);
  }, [category, posts, readPosts]);

  const getPageTitle = () => {
    if (!category) return "Blog & Updates";
    return `Blog: ${category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading blog...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-[var(--text-main)] mb-8">
        {getPageTitle()}
      </h1>
      
      <div className="grid gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => {
            const isRead = readPosts.includes(post.slug);
            return (
              <Link 
                key={post.slug} 
                to={`/blog/article/${post.slug}`}
                className={`block p-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--color-primary)] transition-all group shadow-sm hover:shadow-md ${isRead ? 'opacity-70' : ''}`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold text-[var(--text-main)] group-hover:text-[var(--color-primary)] transition-colors">
                      {post.title}
                    </h2>
                    {isRead && (
                      <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px] uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded-md">
                        <CheckCircle size={12} />
                        Leído
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-2">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    <span>by {post.author}</span>
                  </div>
                  <p className="text-[var(--text-muted)] line-clamp-3">
                    {post.excerpt}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-muted)] text-[10px] uppercase tracking-wide">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500 border border-dashed border-[var(--border-color)] rounded-xl">
            No se encontraron artículos en esta categoría.
          </div>
        )}
      </div>
    </div>
  );
};
