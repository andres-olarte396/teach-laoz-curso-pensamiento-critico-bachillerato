import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommentSection } from "../CommentSection";
import { EvidenceSection } from "../EvidenceSection";

interface CourseToolsSidebarProps {
  sidebarMode: "none" | "forum" | "evidence";
  setSidebarMode: (mode: "none" | "forum" | "evidence") => void;
  path: string | undefined;
  courseId: string | undefined;
}

export const CourseToolsSidebar: React.FC<CourseToolsSidebarProps> = ({
  sidebarMode,
  setSidebarMode,
  path,
  courseId,
}) => {
  return (
    <AnimatePresence>
      {sidebarMode !== "none" && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 400, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="hidden lg:block h-[calc(100vh-120px)] sticky top-4 overflow-hidden print:hidden"
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
              courseId={courseId || "root"}
              lessonId={path || "root"}
              compact={true}
              onClose={() => setSidebarMode("none")}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
