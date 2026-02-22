import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { DashboardContent } from '@/components/dashboard';
import { initializeStorage } from '@/lib/mocks';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize mock data on first load
  useEffect(() => {
    initializeStorage();
  }, []);

  // Redirect doctors to their area
  useEffect(() => {
    if (user?.role === 'medico') {
      navigate('/area-medico', { replace: true });
    }
  }, [user, navigate]);

  // If user is a doctor, show nothing while redirecting
  if (user?.role === 'medico') {
    return null;
  }

  return (
    <MainLayout>
      <DashboardContent />
    </MainLayout>
  );
};

export default Index;
