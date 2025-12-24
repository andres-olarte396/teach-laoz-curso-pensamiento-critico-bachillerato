import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { WelcomePage } from './pages/WelcomePage';
import { CoursePage } from './pages/CoursePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BlogListPage } from './pages/Blog/BlogListPage';
import { BlogPostPage } from './pages/Blog/BlogPostPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
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
              <Route path="/blog/:slug" element={<BlogPostPage />} />

              {/* Protected Course Routes */}
              <Route element={<ProtectedRoute />}>
                <Route index element={<WelcomePage />} />
                <Route path="course/*" element={<CoursePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
