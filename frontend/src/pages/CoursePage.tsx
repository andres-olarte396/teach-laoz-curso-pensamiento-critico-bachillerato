import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Award } from "lucide-react";
import { ContentRenderer } from "../components/ContentRenderer";
import { useTts } from "../hooks/useTts";
import { TtsFloatingControls } from "../components/TtsFloatingControls";
import { useAuth } from "../context/AuthContext";
import { SkeletonLoader } from "../components/SkeletonLoader";
import { CommentSection } from "../components/CommentSection";

// Refactored Components & Hooks
import { useCourseContent } from "../hooks/useCourseContent";
import { CourseHeader } from "../components/course/CourseHeader";
import { CourseTopBar } from "../components/course/CourseTopBar";
import { CourseAssets } from "../components/course/CourseAssets";
import { CourseBottomNav } from "../components/course/CourseBottomNav";
import { CourseToolsSidebar } from "../components/course/CourseToolsSidebar";

export const CoursePage: React.FC = () => {
  const { "*": path } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Custom Hook for Data Fetching
  const { 
    content, 
    loading, 
    error, 
    courseCompletion, 
    navContext, 
    isLessonCompleted 
  } = useCourseContent(path, isAuthenticated, user);

  // UI State
  const [showAudio, setShowAudio] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<"none" | "forum" | "evidence">("none");

  // TTS Hook
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

  // Cleanup TTS on unmount/path change
  useEffect(() => {
    return () => stopReading();
  }, [path, stopReading]);

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

  /* Helper to format file size */
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

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
            {/* Header */}
            <CourseHeader 
                path={path} 
                isLessonCompleted={isLessonCompleted}
                sidebarMode={sidebarMode}
                setSidebarMode={setSidebarMode}
            />

            {/* Certificate Banner (Reusable Logic kept inline for specificity) */}
            {courseCompletion?.percentage === 100 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 p-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-[2rem] text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
              >
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

            {/* Top Navigation Bar */}
            <CourseTopBar 
                navContext={navContext}
                isReading={isReading}
                onToggleRead={!isReading ? startReading : pauseReading}
                onPrint={() => window.print()}
            />

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
            <CourseBottomNav navContext={navContext} />

            {/* Assets */}
            <CourseAssets assets={content.relatedAssets} />

            {/* Footer */}
            <footer className="mt-12 py-8 border-t border-[var(--border-color)] text-center text-[var(--text-muted)] text-[10px] uppercase tracking-widest">
              ID: {content.name} • {formatSize(content.metadata?.size || 0)}
            </footer>
          </motion.div>
        </AnimatePresence>

        {/* Sidebar Tools */}
        <CourseToolsSidebar 
            sidebarMode={sidebarMode} 
            setSidebarMode={setSidebarMode} 
            path={path}
            courseId={path?.split("/")[0]}
        />

        {/* Mobile Forum (Below content) */}
        <div className="lg:hidden mt-8 print:hidden">
          <CommentSection resourceId={path || "root"} />
        </div>
      </div>
    </>
  );
};
