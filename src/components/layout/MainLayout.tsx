import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('medly_dark_mode');
    if (stored) {
      setIsDarkMode(stored === 'true');
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('medly_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [isMobile]);

  const handleMenuClick = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const sidebarWidth = sidebarCollapsed ? 72 : 260;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        onMenuClick={handleMenuClick}
        isDarkMode={isDarkMode}
        onDarkModeToggle={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Sidebar - Desktop */}
      {!isMobile && (
        <Sidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}

      {/* Sidebar - Mobile Overlay */}
      {isMobile && mobileMenuOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 z-50 h-full w-[280px] bg-sidebar shadow-xl"
          >
            <div className="h-16 border-b border-sidebar-border px-4 py-4">
              <span className="text-xl font-bold text-foreground">Medly</span>
            </div>
            <Sidebar collapsed={false} onCollapsedChange={() => {}} />
          </motion.div>
        </>
      )}

      {/* Main Content */}
      <motion.main
        initial={false}
        animate={{
          marginLeft: isMobile ? 0 : sidebarWidth,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn('min-h-screen pt-16 transition-all duration-300')}
      >
        <div className="container mx-auto p-4 lg:p-6">{children}</div>
      </motion.main>
    </div>
  );
}
