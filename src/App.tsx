import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SenhaProvider } from "@/contexts/SenhaContext";
import { CrossProvider } from "@/contexts/CrossContext";
import { SolicitacaoProvider } from "@/contexts/SolicitacaoContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Solicitacoes from "./pages/Solicitacoes";
import AgendamentoPlanejamento from "./pages/AgendamentoPlanejamento";
import Agenda from "./pages/Agenda";
import Docas from "./pages/Docas";
import CrossDockingPage from "./pages/CrossDocking";
import ControleSenhas from "./pages/ControleSenhas";
import Fornecedores from "./pages/Fornecedores";
import Funcionarios from "./pages/Funcionarios";
import SenhaCaminhoneiro from "./pages/SenhaCaminhoneiro";
import SolicitacaoEntrega from "./pages/SolicitacaoEntrega";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProfileProvider>
      <SenhaProvider>
        <CrossProvider>
          <SolicitacaoProvider>
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
                  <Route path="/solicitacao" element={<SolicitacaoEntrega />} />
                  <Route path="/solicitacoes" element={
                    <ProtectedRoute adminOnly>
                      <Solicitacoes />
                    </ProtectedRoute>
                  } />
                  <Route path="/agendamento" element={
                    <ProtectedRoute adminOnly>
                      <AgendamentoPlanejamento />
                    </ProtectedRoute>
                  } />
                  <Route path="/agenda" element={
                    <ProtectedRoute adminOnly>
                      <Agenda />
                    </ProtectedRoute>
                  } />
                  <Route path="/docas" element={<Docas />} />
                  <Route path="/cross" element={<CrossDockingPage />} />
                  <Route path="/senhas" element={
                    <ProtectedRoute adminOnly>
                      <ControleSenhas />
                    </ProtectedRoute>
                  } />
                  <Route path="/fornecedores" element={
                    <ProtectedRoute adminOnly>
                      <Fornecedores />
                    </ProtectedRoute>
                  } />
                  <Route path="/funcionarios" element={
                    <ProtectedRoute adminOnly>
                      <Funcionarios />
                    </ProtectedRoute>
                  } />
                  <Route path="/senha" element={<SenhaCaminhoneiro />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SolicitacaoProvider>
        </CrossProvider>
      </SenhaProvider>
    </ProfileProvider>
  </QueryClientProvider>
);

export default App;
