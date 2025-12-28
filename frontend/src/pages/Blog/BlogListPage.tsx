import React, { useEffect, useState, useRef } from 'react';
import { blogService, type BlogPost } from '../../services/blogService';
import { Link, useParams } from 'react-router-dom';
<<<<<<< HEAD
import { CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
=======
import { CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
>>>>>>> 7f4e011 (feat(frontend): mejoras en componentes, estilos y nuevas páginas para cursos)

export const BlogListPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [readPosts, setReadPosts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const listTopRef = useRef<HTMLDivElement>(null);

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

<<<<<<< HEAD
  useEffect(() => {
    let result = posts;
    
    // Filter by category
    if (category) {
      result = posts.filter(post => 
=======
  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery]);

  // Combined logic for Filtering and Sorting
  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [category, searchQuery]);

  // Combined logic for Filtering and Sorting
  useEffect(() => {
    let result = [...posts];

    // 1. Filter by category
    if (category) {
      result = result.filter(post => 
        post.slug.startsWith(`${category}/`) || 
        post.tags.some(tag => tag.toLowerCase().replace(/\s+/g, '-') === category)
      );
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt?.toLowerCase().includes(query) || 
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 3. Sort: Unread first, then Read. Within each group, most recent first.
    result.sort((a, b) => {
      const isARead = readPosts.includes(a.slug);
      const isBRead = readPosts.includes(b.slug);

      if (isARead !== isBRead) {
        return isARead ? 1 : -1; // Read goes to the end
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFilteredPosts(result);
  }, [category, posts, readPosts, searchQuery]);
    // 3. Sort: Unread first, then Read. Within each group, most recent first.
    result.sort((a, b) => {
>>>>>>> 7f4e011 (feat(frontend): mejoras en componentes, estilos y nuevas páginas para cursos)
      const isARead = readPosts.includes(a.slug);
      const isBRead = readPosts.includes(b.slug);

      if (isARead !== isBRead) {
<<<<<<< HEAD
        return isARead ? 1 : -1; // Read goes to the end
      }

      // If both same status, use date (backend already returns them mostly sorted by date, but good to be sure)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFilteredPosts(sorted);
  }, [category, posts, readPosts]);
=======
        return isARead ? 1 : -1;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setFilteredPosts(result);
  }, [category, posts, readPosts, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const currentItems = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
>>>>>>> 7f4e011 (feat(frontend): mejoras en componentes, estilos y nuevas páginas para cursos)

  const getPageTitle = () => {
    if (!category) return "Blog & Updates";
    return `Blog: ${category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading blog...</div>;
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="max-w-4xl mx-auto py-8 px-4" ref={listTopRef}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-main)]">
          {getPageTitle()}
        </h1>

        {/* Search Bar */}
        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Buscar artículos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>
      
      <div className="grid gap-6">
        {currentItems.length > 0 ? (
          <>
            {currentItems.map((post) => {
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
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 py-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-[var(--border-color)] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === page 
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                        : 'border border-[var(--border-color)] hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-[var(--border-color)] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center text-slate-500 border border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--bg-surface)]">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search size={32} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-main)] mb-1">No se encontraron artículos</h3>
            <p className="text-sm">Prueba con otros términos o cambia de categoría.</p>
>>>>>>> 7f4e011 (feat(frontend): mejoras en componentes, estilos y nuevas páginas para cursos)
          </div>
        )}
      </div>
    </div>
  );
};
