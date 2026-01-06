import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import type { ContentResponse, MenuItem } from "../services/apiService";

interface CourseCompletion {
    percentage: number;
    total: number;
    completed: number;
}

interface NavContext {
    prev: MenuItem | null;
    next: MenuItem | null;
}

interface User {
    id: string;
    organizationId?: string;
    // add other fields if needed
}

interface ProgressItem {
    lessonId: string;
    completed: boolean;
    lastAccessed: string;
}

interface ProgressResponse {
    latest: ProgressItem;
    all: ProgressItem[];
}

export const useCourseContent = (path: string | undefined, isAuthenticated: boolean, user: User | null | any) => {
    const navigate = useNavigate();
    const [content, setContent] = useState<ContentResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [courseCompletion, setCourseCompletion] = useState<CourseCompletion | null>(null);
    const [navContext, setNavContext] = useState<NavContext | null>(null);
    const [isLessonCompleted, setIsLessonCompleted] = useState(false);

    useEffect(() => {
        // Scroll to top when path changes
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
                    const progress = await apiService.getProgress(courseId) as unknown as ProgressResponse;
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
                    const completion = authResults[0] as CourseCompletion | null;
                    const progress = authResults[1] as unknown as ProgressResponse;

                    if (completion) setCourseCompletion(completion);
                    if (progress && Array.isArray(progress.all)) {
                        const current = progress.all.find((p) => p.lessonId === path);
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
                            .catch((err: unknown) => console.error("Failed to save progress:", err));
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
                        .catch((err: unknown) => console.error("Failed to track event:", err));
                }
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || "Error al cargar el contenido";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [path, isAuthenticated, navigate, user?.id]);


    return {
        content,
        loading,
        error,
        courseCompletion,
        navContext,
        isLessonCompleted
    };
};
