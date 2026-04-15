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
import Armazenamento from "./pages/Armazenamento";
import SenhaCaminhoneiro from "./pages/SenhaCaminhoneiro";
import PainelSenhas from "./pages/PainelSenhas";
import SolicitacaoEntrega from "./pages/SolicitacaoEntrega";
import LoginAdmin from "./pages/LoginAdmin";
import LoginOperacional from "./pages/LoginOperacional";
import LoginComprador from "./pages/LoginComprador";
import AgendamentoComprador from "./pages/AgendamentoComprador";
import TiposVeiculo from "./pages/TiposVeiculo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Wrapper helpers — each route gets only the providers it needs */
const WithSenha = ({ children }: { children: React.ReactNode }) => (
  <SenhaProvider>{children}</SenhaProvider>
);
const WithSenhaCross = ({ children }: { children: React.ReactNode }) => (
  <SenhaProvider><CrossProvider>{children}</CrossProvider></SenhaProvider>
);
const WithAll = ({ children }: { children: React.ReactNode }) => (
  <SenhaProvider><CrossProvider><SolicitacaoProvider>{children}</SolicitacaoProvider></CrossProvider></SenhaProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" storageKey="doca-theme">
      <ProfileProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<LoginAdmin />} />
              <Route path="/acesso" element={<LoginOperacional />} />
              <Route path="/comprador" element={<LoginComprador />} />
              <Route path="/comprador/agenda" element={<AgendamentoComprador />} />

              {/* Rotas simples — sem providers pesados */}
              <Route path="/fornecedores" element={<ProtectedRoute adminOnly><Fornecedores /></ProtectedRoute>} />
              <Route path="/funcionarios" element={<ProtectedRoute adminOnly><Funcionarios /></ProtectedRoute>} />
              <Route path="/acessos" element={<ProtectedRoute adminOnly><Acessos /></ProtectedRoute>} />
              <Route path="/tipos-veiculo" element={<ProtectedRoute adminOnly><TiposVeiculo /></ProtectedRoute>} />

              {/* Rotas com SenhaProvider only */}
              <Route path="/senha" element={<WithSenha><SenhaCaminhoneiro /></WithSenha>} />
              <Route path="/painel" element={<WithSenha><PainelSenhas /></WithSenha>} />
              <Route path="/senhas" element={<WithSenha><ProtectedRoute adminOnly><ControleSenhas /></ProtectedRoute></WithSenha>} />

              {/* Rota com Senha + Solicitacao */}
              <Route path="/solicitacao" element={<WithSenha><SolicitacaoProvider><SolicitacaoEntrega /></SolicitacaoProvider></WithSenha>} />

              {/* Rotas com Senha + Cross */}
              <Route path="/cross" element={<WithSenhaCross><ProtectedRoute><CrossDockingPage /></ProtectedRoute></WithSenhaCross>} />
              <Route path="/armazenamento" element={<WithSenhaCross><ProtectedRoute adminOnly><Armazenamento /></ProtectedRoute></WithSenhaCross>} />

              {/* Rotas que precisam de todos os providers */}
              <Route path="/" element={<WithAll><ProtectedRoute adminOnly><Dashboard /></ProtectedRoute></WithAll>} />
              <Route path="/agenda" element={<WithAll><ProtectedRoute adminOnly><Agenda /></ProtectedRoute></WithAll>} />
              <Route path="/docas" element={<WithAll><ProtectedRoute><Docas /></ProtectedRoute></WithAll>} />
              <Route path="/agendamento" element={<WithAll><ProtectedRoute adminOnly><AgendamentoPlanejamento /></ProtectedRoute></WithAll>} />
              <Route path="/solicitacoes" element={<WithAll><ProtectedRoute adminOnly><Solicitacoes /></ProtectedRoute></WithAll>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProfileProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
