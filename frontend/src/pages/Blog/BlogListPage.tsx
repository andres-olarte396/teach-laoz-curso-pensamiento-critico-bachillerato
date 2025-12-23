import React, { useEffect, useState } from 'react';
import { blogService, type BlogPost } from '../../services/blogService';
import { Link } from 'react-router-dom';

export const BlogListPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading blog...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-8">
        Blog & Updates
      </h1>
      
      <div className="grid gap-6">
        {posts.map((post) => (
          <Link 
            key={post.slug} 
            to={`/blog/${post.slug}`}
            className="block p-6 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 hover:border-primary/30 transition-all group"
          >
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-slate-100 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                <span>{new Date(post.date).toLocaleDateString()}</span>
                <span>by {post.author}</span>
              </div>
              <p className="text-slate-400 line-clamp-3">
                {post.excerpt}
              </p>
              {post.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
