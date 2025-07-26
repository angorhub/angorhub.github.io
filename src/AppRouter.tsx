import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { ScrollToTop } from "./components/ScrollToTop";
import { AngorLayout } from "./components/AngorLayout";
import { useGlobalLoading } from "./hooks/useGlobalLoading";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SettingsPage } from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { HomePage } from "./pages/HomePage";

// Component to handle route loading
function RouteLoadingHandler() {
  const location = useLocation();
  const { showLoading, hideLoading } = useGlobalLoading();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousPathnameRef = useRef<string>('');

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Skip if pathname hasn't actually changed
    if (previousPathnameRef.current === location.pathname) {
      return;
    }
    previousPathnameRef.current = location.pathname;

    // Skip loading for loading-test page to avoid conflicts
    if (location.pathname === '/loading-test') {
      return;
    }

    // Get loading message based on route
    const getLoadingMessage = (pathname: string): string => {
      if (pathname === '/') return 'Loading home page...';
       if (pathname.startsWith('/project/')) return 'Loading project details...';
      if (pathname === '/profile') return 'Loading profile...';
      if (pathname === '/settings') return 'Loading settings...';
      if (pathname === '/analytics') return 'Loading analytics...';
      if (pathname === '/trending') return 'Loading trending projects...';
      if (pathname === '/debug') return 'Loading debug information...';
      return 'Loading page...';
    };

    // Show loading when route changes
    const message = getLoadingMessage(location.pathname);
    showLoading(message);
    
    // Hide loading after page has time to render
    timeoutRef.current = setTimeout(() => {
      hideLoading();
      timeoutRef.current = null;
    }, 800);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      hideLoading();
    };
  }, [location.pathname, showLoading, hideLoading]);

  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AngorLayout>
        <RouteLoadingHandler />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AngorLayout>
    </BrowserRouter>
  );
}
export default AppRouter;