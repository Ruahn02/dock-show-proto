import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SenhaProvider } from "@/contexts/SenhaContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Agendamento from "./pages/Agendamento";
import Docas from "./pages/Docas";
import Fornecedores from "./pages/Fornecedores";
import Conferentes from "./pages/Conferentes";
import SenhaCaminhoneiro from "./pages/SenhaCaminhoneiro";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProfileProvider>
      <SenhaProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/agendamento" element={
                <ProtectedRoute adminOnly>
                  <Agendamento />
                </ProtectedRoute>
              } />
              <Route path="/docas" element={<Docas />} />
              <Route path="/fornecedores" element={
                <ProtectedRoute adminOnly>
                  <Fornecedores />
                </ProtectedRoute>
              } />
              <Route path="/conferentes" element={
                <ProtectedRoute adminOnly>
                  <Conferentes />
                </ProtectedRoute>
              } />
              <Route path="/senha" element={<SenhaCaminhoneiro />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SenhaProvider>
    </ProfileProvider>
  </QueryClientProvider>
);

export default App;
