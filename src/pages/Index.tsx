import { useEffect } from 'react';
import { MainLayout } from '@/components/layout';
import { DashboardContent } from '@/components/dashboard';
import { initializeStorage } from '@/lib/mocks';

const Index = () => {
  // Initialize mock data on first load
  useEffect(() => {
    initializeStorage();
  }, []);

  return (
    <MainLayout>
      <DashboardContent />
    </MainLayout>
  );
};

export default Index;
