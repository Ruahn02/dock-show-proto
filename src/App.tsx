import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ThemeProvider } from "next-themes";
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
import Acessos from "./pages/Acessos";
import SenhaCaminhoneiro from "./pages/SenhaCaminhoneiro";
import PainelSenhas from "./pages/PainelSenhas";
import SolicitacaoEntrega from "./pages/SolicitacaoEntrega";
import LoginAdmin from "./pages/LoginAdmin";
import LoginOperacional from "./pages/LoginOperacional";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="doca-theme">
    <ProfileProvider>
      <SenhaProvider>
        <CrossProvider>
          <SolicitacaoProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Rotas públicas */}
                  <Route path="/login" element={<LoginAdmin />} />
                  <Route path="/acesso" element={<LoginOperacional />} />
                  <Route path="/solicitacao" element={<SolicitacaoEntrega />} />
                  <Route path="/senha" element={<SenhaCaminhoneiro />} />
                  <Route path="/painel" element={<PainelSenhas />} />

                  {/* Rotas admin only */}
                  <Route path="/" element={
                    <ProtectedRoute adminOnly>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
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
                  <Route path="/acessos" element={
                    <ProtectedRoute adminOnly>
                      <Acessos />
                    </ProtectedRoute>
                  } />

                  {/* Rotas protegidas (qualquer perfil autenticado) */}
                  <Route path="/docas" element={
                    <ProtectedRoute>
                      <Docas />
                    </ProtectedRoute>
                  } />
                  <Route path="/cross" element={
                    <ProtectedRoute>
                      <CrossDockingPage />
                    </ProtectedRoute>
                  } />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SolicitacaoProvider>
        </CrossProvider>
      </SenhaProvider>
    </ProfileProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
