import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { WelcomePage } from './pages/WelcomePage';
import { CoursePage } from './pages/CoursePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BlogListPage } from './pages/Blog/BlogListPage';
import { BlogPostPage } from './pages/Blog/BlogPostPage';
import { CourseListPage } from './pages/CourseListPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

import { ThemeProvider } from './context/ThemeContext';
import { AccessibilityProvider } from './context/AccessibilityContext';

import { ContactPage } from './pages/ContactPage';
import { LearningPathsPage } from './pages/LearningPathsPage';
import { CommunityPage } from './pages/CommunityPage';
import { CertificationsPage } from './pages/CertificationsPage';
import { DocumentationPage } from './pages/DocumentationPage';
import { SupportPage } from './pages/SupportPage';
import { TermsPage } from './pages/TermsPage';
import { DocViewerPage } from './pages/DocViewerPage';
import { EvaluationPage } from './pages/EvaluationPage';
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AccessibilityProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />


              {/* Main Layout Routes (Public & Protected) */}
              <Route element={<Layout />}>
                {/* Public Blog Routes */}
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/category/:category" element={<BlogListPage />} />
                <Route path="/blog/article/*" element={<BlogPostPage />} />

                {/* Courses Explorer */}
                <Route path="/courses" element={<CourseListPage />} />
                <Route path="/courses/category/:category" element={<CourseListPage />} />
                {/* Contact Route */}
                <Route path="/contact" element={<ContactPage />} />

                {/* New Platform Routes */}
                <Route path="/learning-paths" element={<LearningPathsPage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/certifications" element={<CertificationsPage />} />

                {/* New Resource Routes */}
                <Route path="/documentation" element={<DocumentationPage />} />
                <Route path="/documentation/:category/:docId" element={<DocViewerPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/terms" element={<TermsPage />} />

                {/* Protected Course Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route index element={<WelcomePage />} />
                  <Route path="course/*" element={<CoursePage />} />
                  <Route path="evaluation/*" element={<EvaluationPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  );
}

export default App;
