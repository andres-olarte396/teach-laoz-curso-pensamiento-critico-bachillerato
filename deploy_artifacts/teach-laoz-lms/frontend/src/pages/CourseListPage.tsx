import React, { useEffect, useState, useMemo } from 'react';
import { courseService, type Course } from '../services/courseService';
import { Link, useParams } from 'react-router-dom';
import { Search, GraduationCap, Clock } from 'lucide-react';
import { getCategoryIcon } from '../components/CategoryIcons';

export const CourseListPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await courseService.getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Helper function to normalize strings for comparison (remove accents, symbols, etc)
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD') // Split accents from letters
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[&]/g, '') // Remove &
      .replace(/[^a-z0-9\s-]/g, '') // Remove other special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/-+/g, '-'); // Collapse multiple hyphens
  };

  // Combined logic for Filtering and Sorting
  useEffect(() => {
    let result = [...courses];
    
    // 1. Filter by category
    if (category) {
      result = result.filter(course => 
        slugify(course.category) === category.toLowerCase()
      );
    }

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(course => 
        course.title.toLowerCase().includes(query) || 
        course.summary.toLowerCase().includes(query) || 
        course.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 3. Sort: most recent first.
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredCourses(result);
  }, [category, courses, searchQuery]);

  // Grouping logic
  const groupedCourses = useMemo(() => {
    const groups: Record<string, Course[]> = {};
    filteredCourses.forEach(course => {
      const cat = course.category || 'General';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(course);
    });
    return groups;
  }, [filteredCourses]);

  const getPageTitle = () => {
    if (!category) return "Explorar Cursos";
    return `Cursos: ${category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;
  };

  const getLevelColor = (level?: string) => {
    switch(level) {
      case 'Básico': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Intermedio': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Avanzado': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Cargando biblioteca de cursos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
            <GraduationCap size={16} />
            <span>Academia Teach LAOZ</span>
          </div>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight">
            {getPageTitle()}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="¿Qué quieres aprender hoy?..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
        </div>
      </div>
      
      <div className="space-y-16">
        {Object.keys(groupedCourses).length > 0 ? (
          Object.entries(groupedCourses).map(([catName, coursesInCategory]) => {
            const Icon = getCategoryIcon(catName);
            return (
              <section key={catName} className="space-y-8">
                <div className="flex items-center gap-4 pb-2 border-b border-[var(--border-color)]">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{catName}</h2>
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                    {coursesInCategory.length} {coursesInCategory.length === 1 ? 'Curso' : 'Cursos'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {coursesInCategory.map((course) => (
                    <Link 
                      key={course.id} 
                      to={`/course/${course.id}`}
                      className="flex flex-col h-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-3xl overflow-hidden hover:border-primary/50 transition-all group shadow-sm hover:shadow-2xl hover:-translate-y-1"
                    >
                      <div className="h-40 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden flex items-center justify-center">
                         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                         <Icon size={48} className="text-white/20 group-hover:scale-110 transition-transform duration-500" />
                         <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getLevelColor(course.level)} backdrop-blur-md`}>
                           {course.level}
                         </div>
                      </div>

                      <div className="p-6 flex flex-col flex-1 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{course.category}</span>
                          <h2 className="text-xl font-bold text-[var(--text-main)] group-hover:text-primary transition-colors leading-tight line-clamp-2">
                            {course.title}
                          </h2>
                        </div>
                        
                        <p className="text-sm text-[var(--text-muted)] line-clamp-3 leading-relaxed flex-1">
                          {course.summary}
                        </p>

                        <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2 text-[var(--text-muted)]">
                             <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                               {course.author.charAt(0)}
                             </div>
                             <span className="text-[10px] font-medium">{course.author}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[var(--text-muted)] text-[10px]">
                            <Clock size={12} />
                            <span>{new Date(course.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Search size={40} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-main)] mb-2">No encontramos ese curso</h3>
            <p className="text-[var(--text-muted)] max-w-sm mx-auto">
              Prueba con otras palabras clave o explora todas nuestras categorías.
            </p>
            <button 
              onClick={() => {setSearchQuery('');}}
              className="mt-8 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              Ver todos los cursos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
