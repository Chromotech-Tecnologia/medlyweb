import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { DashboardGestor } from '@/components/dashboard/DashboardGestor';
import { initializeStorage } from '@/lib/mocks';
import { useAuth } from '@/hooks/useAuth';
import { ExportMenu } from '@/components/export/ExportMenu';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    initializeStorage();
  }, []);

  // Redirect doctors to their area
  useEffect(() => {
    if (user?.role === 'medico') {
      navigate('/area-medico', { replace: true });
    }
  }, [user, navigate]);

  if (user?.role === 'medico') {
    return null;
  }

  const isGestorOrEscalista = user?.role === 'gestor' || user?.role === 'escalista';

  return (
    <MainLayout>
      <div className="flex items-center justify-end mb-4">
        <ExportMenu />
      </div>
      {isGestorOrEscalista ? <DashboardGestor /> : <DashboardContent />}
    </MainLayout>
  );
};

export default Index;
