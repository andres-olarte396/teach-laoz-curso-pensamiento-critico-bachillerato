import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiService } from "../services/apiService";
import type { ContentResponse, MenuItem } from "../services/apiService";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  FileText,
  Award,
  Loader2,
  AlertCircle,
  Volume2,
  Printer,
  Brain,
  Music,
  CheckSquare,
  Home,
  ChevronRight as ChevronRightIcon,
  Zap,
  HardDrive,
  MessageSquare,
  Lock,
  Eye,
  CheckCircle,
  FileCheck,
} from "lucide-react";
import { ContentRenderer } from "../components/ContentRenderer";
import { useTts } from "../hooks/useTts";
import { TtsFloatingControls } from "../components/TtsFloatingControls";
import { useAuth } from "../context/AuthContext";
import { CommentSection } from "../components/CommentSection";
import { EvidenceSection } from "../components/EvidenceSection";
import { SkeletonLoader } from "../components/SkeletonLoader";

export const CoursePage: React.FC = () => {
  const { "*": path } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState<ContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseCompletion, setCourseCompletion] = useState<{
    percentage: number;
    total: number;
    completed: number;
  } | null>(null);
  const [navContext, setNavContext] = useState<{
    prev: MenuItem | null;
    next: MenuItem | null;
  } | null>(null);
  const [showAudio, setShowAudio] = useState(false);
  const [showScript, setShowScript] = useState(false);

  const [showForum, setShowForum] = useState(false); // Deprecated in favor of sidebarMode
  const [sidebarMode, setSidebarMode] = useState<"none" | "forum" | "evidence">(
    "none"
  );
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

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
  } = useTts({
    contentSelector: ".content-area",
  });

  useEffect(() => {
    return () => stopReading();
  }, [path, stopReading]);

  useEffect(() => {
    // Scroll to top of the main container when the path changes
    const mainContainer = document.querySelector("main > div.flex-1");
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [path]);

  useEffect(() => {
    const fetchContent = async () => {
      if (!path) return;

      const courseId = path.split("/")[0];
      const isCourseRoot =
        path === courseId ||
        path === `${courseId}/` ||
        path.endsWith("INDICE.md") ||
        path.endsWith("README.md");

      // 1. If at course root and authenticated, check for progress to resume
      if (isCourseRoot && isAuthenticated) {
        try {
          const progress = await apiService.getProgress(courseId);
          if (progress.latest && progress.latest.lessonId !== path) {
            navigate(`/course/${progress.latest.lessonId}`, { replace: true });
            return;
          }
        } catch (err) {
          console.error("Failed to fetch progress:", err);
        }
      }

      setLoading(true);
      setError(null);
      stopReading();

      try {
        // Parallelize Requests
        const contentPromise = apiService.getContent(path);
        const menuPromise = apiService.getMenu();
        
        const authPromises = isAuthenticated ? [
            apiService.getCourseCompletion(courseId).catch(() => null),
            apiService.getProgress(courseId).catch(() => null)
        ] : [];

        const [data, menuData, ...authResults] = await Promise.all([
            contentPromise,
            menuPromise,
            ...authPromises
        ]);
        
        // 1. Set Content
        setContent(data);

        // 2. Set Auth Data
        if (isAuthenticated) {
            const completion = authResults[0] as any;
            const progress = authResults[1] as any;

            if (completion) setCourseCompletion(completion);
            if (progress && Array.isArray(progress.all)) {
                 const current = progress.all.find((p: any) => p.lessonId === path);
                 setIsLessonCompleted(!!current);
            }
        }

        // 3. Process Navigation (Menu)
        const course = menuData.courses.find((c) => c.id === courseId);
        
        if (course) {
          const flatItems: MenuItem[] = [];
          const flatten = (items: MenuItem[]) => {
            items.forEach((item) => {
              if (item.type === "markdown" || item.type === "evaluation") {
                flatItems.push(item);
              }
              if (item.children) {
                flatten(item.children);
              }
            });
          };
          flatten([course]);

          const currentIndex = flatItems.findIndex(
            (item) => item.path === path
          );
          setNavContext({
            prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
            next:
              currentIndex < flatItems.length - 1
                ? flatItems[currentIndex + 1]
                : null,
          });

          // 4. Background tasks (Non-blocking)
          if (isAuthenticated && data.type === "markdown") {
            apiService
              .saveProgress(courseId, path, false)
              .catch((err) => console.error("Failed to save progress:", err));
          }

          apiService
            .trackEvent({
              userId: user?.id || "anonymous_user",
              organizationId: "default_org",
              courseId: courseId,
              lessonId: path,
              type: "lesson_viewed",
              metadata: {
                title: data.name,
                timestamp: new Date().toISOString(),
              },
            })
            .catch((err) => console.error("Failed to track event:", err));
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Error al cargar el contenido");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [path, isAuthenticated, navigate, stopReading, user?.id]);

  if (loading) {
    return (
      <div className="min-h-[60vh]">
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto mt-20 p-8 rounded-3xl bg-red-400/5 border border-red-400/20 text-center"
      >
        <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-red-400" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Ops! Algo salió mal
        </h2>
        <p className="text-slate-400 mb-6">{error}</p>
      </motion.div>
    );
  }

  if (!content) return null;

  const breadcrumbs = path?.split("/").filter(Boolean) || [];

  /* Helper to format file size */
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  /* Split Layout Logic */

  return (
    <>
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
      />

      <div className="relative flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-100px)]">
        {/* Main Content Column */}
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex-1 min-w-0 transition-all duration-300 ${
              sidebarMode !== "none" ? "lg:max-w-[calc(100%-400px)]" : "w-full"
            }`}
          >
            {/* Header Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8 print:hidden">
              <nav className="flex flex-wrap items-center gap-2 text-[var(--text-muted)] text-xs font-medium uppercase tracking-widest">
                <Link
                  to="/"
                  className="hover:text-[var(--color-primary)] transition-colors"
                >
                  <Home size={14} />
                </Link>
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    <ChevronRightIcon
                      size={12}
                      className="text-[var(--text-muted)] flex-shrink-0"
                    />
                    <span
                      className={
                        i === breadcrumbs.length - 1
                          ? "text-[var(--color-primary)]"
                          : "hover:text-[var(--text-main)] transition-colors cursor-default"
                      }
                    >
                      {(() => {
                        const cleanRegex =
                          /^((teach|laoz|curso|learning|system|courses?|educacion|[ ._-]+)+)/i;
                        const cleaned = crumb
                          .replace(cleanRegex, "")
                          .replace(/\.(md|html|pdf)$/i, "")
                          .replace(/[._-]/g, " ")
                          .trim();
                        return (
                          cleaned ||
                          crumb
                            .replace(/\.(md|html|pdf)$/i, "")
                            .replace(/[._-]/g, " ")
                        );
                      })()}
                    </span>
                  </React.Fragment>
                ))}

                {isLessonCompleted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-4 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-md border border-emerald-500/20"
                  >
                    <CheckCircle size={12} />
                    <span className="text-[10px] font-bold">VISTO</span>
                  </motion.div>
                )}
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setSidebarMode(
                      sidebarMode === "evidence" ? "none" : "evidence"
                    )
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    sidebarMode === "evidence"
                      ? "bg-amber-500 text-white border-transparent"
                      : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-amber-500 hover:border-amber-500"
                  }`}
                  title="Mi Bitácora Privada"
                >
                  <Lock size={14} />
                  <span className="hidden sm:inline">Bitácora</span>
                </button>

                <button
                  onClick={() =>
                    setSidebarMode(sidebarMode === "forum" ? "none" : "forum")
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    sidebarMode === "forum"
                      ? "bg-[var(--color-primary)] text-white border-transparent"
                      : "bg-[var(--bg-surface)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  <MessageSquare size={14} />
                  <span className="hidden sm:inline">Foro</span>
                </button>
              </div>
            </div>

            {/* Certificate Banner (Reuse Logic) */}
            {courseCompletion?.percentage === 100 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 p-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
              >
                {/* ... (Keep content same as before, simplified for brevity in replacement but logic remains) ... */}
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                    <Award size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-widest mb-1">
                      ¡Curso Completado!
                    </h3>
                    <p className="text-white/90 text-sm">
                      Tu certificado está listo.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    navigate(`/certificate/${path?.split("/")[0]}`)
                  }
                  className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-lg"
                >
                  Obtener
                </button>
              </motion.div>
            )}

            {/* Navigation Controls (Reuse Logic) */}
            <div className="flex items-center justify-between gap-4 mb-8">
              {/* Prev */}
              <div className="flex-1">
                {navContext?.prev && (
                  <Link
                    to={
                      navContext.prev.type === "evaluation"
                        ? `/evaluation/${navContext.prev.path}`
                        : `/course/${navContext.prev.path}`
                    }
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
                  >
                    <ChevronLeft size={14} /> {navContext.prev.title}
                  </Link>
                )}
              </div>

              {/* Read/Print */}
              <div className="flex items-center gap-2">
                <button
                  onClick={!isReading ? startReading : pauseReading}
                  className={`p-3 rounded-full border transition-all ${
                    isReading
                      ? "text-emerald-500 border-emerald-500 bg-emerald-500/10"
                      : "text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {isReading ? (
                    <div className="animate-pulse w-4 h-4 rounded-full bg-current" />
                  ) : (
                    <Volume2 size={16} />
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-3 rounded-full border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                >
                  <Printer size={16} />
                </button>
              </div>

              {/* Next */}
              <div className="flex-1 text-right">
                {navContext?.next && (
                  <Link
                    to={
                      navContext.next.type === "evaluation"
                        ? `/evaluation/${navContext.next.path}`
                        : `/course/${navContext.next.path}`
                    }
                    className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--color-primary)] text-[10px] font-black uppercase tracking-[0.15em] transition-colors"
                  >
                    {navContext.next.title} <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>

            {/* Render Content */}
            <ContentRenderer
              html={content.html || ""}
              path={path}
              metadata={{
                mimeType:
                  content.metadata?.mimeType || "application/octet-stream",
                size: content.metadata?.size || 0,
                lastModified:
                  content.metadata?.lastModified || new Date().toISOString(),
                name: content.name,
                poster: content.frontmatter?.poster,
                relatedAssets: content.relatedAssets,
                showAudio,
                showScript,
              }}
              onCloseAudio={() => setShowAudio(false)}
              onCloseScript={() => setShowScript(false)}
            />

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between gap-4 mt-16 mb-8 pt-8 border-t border-[var(--border-color)] print:hidden">
              {/* Prev */}
              <div className="flex-1">
                {navContext?.prev && (
                  <Link
                    to={
                      navContext.prev.type === "evaluation"
                        ? `/evaluation/${navContext.prev.path}`
                        : `/course/${navContext.prev.path}`
                    }
                    className="flex flex-col gap-1 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors group text-left"
                  >
                    <span className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                      <ChevronLeft size={12} /> Anterior
                    </span>
                    <span className="text-sm font-medium truncate hidden sm:block">
                      {navContext.prev.title}
                    </span>
                  </Link>
                )}
              </div>

              {/* Up */}
              <div className="flex items-center justify-center">
                  <button 
                    onClick={() => {
                        const mainContainer = document.querySelector('main > div.flex-1');
                        if (mainContainer) {
                             mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all group" 
                    title="Volver Arriba"
                  >
                     <ChevronRightIcon size={16} className="-rotate-90 group-hover:-translate-y-1 transition-transform" />
                  </button>
              </div>

              {/* Next */}
              <div className="flex-1 text-right">
                {navContext?.next && (
                  <Link
                    to={
                      navContext.next.type === "evaluation"
                        ? `/evaluation/${navContext.next.path}`
                        : `/course/${navContext.next.path}`
                    }
                    className="flex flex-col gap-1 items-end text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors group text-right"
                  >
                    <span className="text-[10px] uppercase tracking-widest font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Siguiente <ChevronRight size={12} />
                    </span>
                    <span className="text-sm font-medium truncate hidden sm:block">
                      {navContext.next.title}
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Assets Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center print:hidden">
              {content.relatedAssets?.map((asset) => (
                <Link
                  key={asset.path}
                  to={
                    asset.type === "evaluation"
                      ? `/evaluation/${asset.path}`
                      : `/course/${asset.path}`
                  }
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all text-xs font-bold uppercase tracking-wider"
                >
                  {asset.type === "audio" && <Music size={14} />}
                  {asset.type === "evaluation" && <Brain size={14} />}
                  {asset.type === "exercise" && <CheckSquare size={14} />}
                  {asset.name}
                </Link>
              ))}
            </div>

            {/* Footer */}
            <footer className="mt-12 py-8 border-t border-[var(--border-color)] text-center text-[var(--text-muted)] text-[10px] uppercase tracking-widest">
              ID: {content.name} • {formatSize(content.metadata?.size || 0)}
            </footer>
          </motion.div>
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarMode !== "none" && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="hidden lg:block h-[calc(100vh-120px)] sticky top-4 overflow-hidden"
            >
              {sidebarMode === "forum" && (
                <CommentSection
                  resourceId={path || "root"}
                  compact={true}
                  onClose={() => setSidebarMode("none")}
                />
              )}
              {sidebarMode === "evidence" && (
                <EvidenceSection
                  courseId={path?.split("/")[0] || "root"}
                  lessonId={path || "root"}
                  compact={true}
                  onClose={() => setSidebarMode("none")}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Forum (Below content) */}
        <div className="lg:hidden mt-8">
          <CommentSection resourceId={path || "root"} />
        </div>
      </div>
    </>
  );
};
