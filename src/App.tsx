import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { initializeStorage } from "@/lib/mocks/storage";

// Initialize mock data before app renders
initializeStorage();

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Users from "./pages/Users";
import Locations from "./pages/Locations";
import Scales from "./pages/Scales";
import Specialties from "./pages/Specialties";
import ScaleTypes from "./pages/ScaleTypes";
import Documents from "./pages/Documents";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Profiles from "./pages/Profiles";
import DoctorArea from "./pages/DoctorArea";

const queryClient = new QueryClient();

// App root component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            
            {/* Main Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/area-medico" element={<DoctorArea />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/perfis" element={<Profiles />} />
            <Route path="/escalas" element={<Scales />} />
            <Route path="/locais" element={<Locations />} />
            <Route path="/especialidades" element={<Specialties />} />
            <Route path="/tipos-escala" element={<ScaleTypes />} />
            <Route path="/documentos" element={<Documents />} />
            <Route path="/pagamentos" element={<Payments />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/configuracoes" element={<Settings />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
