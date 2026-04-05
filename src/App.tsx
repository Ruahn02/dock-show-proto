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

/** Rotas que precisam de TODOS os providers (Senha + Cross + Solicitacao) */
const FullProviderRoutes = () => (
  <SenhaProvider>
    <CrossProvider>
      <SolicitacaoProvider>
        <Routes>
          {/* Admin - usa todos os contexts */}
          <Route path="/" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute adminOnly><Agenda /></ProtectedRoute>} />
          <Route path="/docas" element={<ProtectedRoute><Docas /></ProtectedRoute>} />
          <Route path="/agendamento" element={<ProtectedRoute adminOnly><AgendamentoPlanejamento /></ProtectedRoute>} />
          <Route path="/solicitacoes" element={<ProtectedRoute adminOnly><Solicitacoes /></ProtectedRoute>} />
        </Routes>
      </SolicitacaoProvider>
    </CrossProvider>
  </SenhaProvider>
);

/** Rotas que precisam de Senha + Cross (sem Solicitacao) */
const SenhaCrossRoutes = () => (
  <SenhaProvider>
    <CrossProvider>
      <Routes>
        <Route path="/cross" element={<ProtectedRoute><CrossDockingPage /></ProtectedRoute>} />
        <Route path="/armazenamento" element={<ProtectedRoute adminOnly><Armazenamento /></ProtectedRoute>} />
      </Routes>
    </CrossProvider>
  </SenhaProvider>
);

/** Rotas que precisam só de SenhaProvider */
const SenhaOnlyRoutes = () => (
  <SenhaProvider>
    <Routes>
      <Route path="/senha" element={<SenhaCaminhoneiro />} />
      <Route path="/painel" element={<PainelSenhas />} />
      <Route path="/senhas" element={<ProtectedRoute adminOnly><ControleSenhas /></ProtectedRoute>} />
    </Routes>
  </SenhaProvider>
);

/** Rotas que precisam de Senha + Solicitacao (sem Cross) */
const SenhaSolicitacaoRoutes = () => (
  <SenhaProvider>
    <SolicitacaoProvider>
      <Routes>
        <Route path="/solicitacao" element={<SolicitacaoEntrega />} />
      </Routes>
    </SolicitacaoProvider>
  </SenhaProvider>
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
            {/* Rotas públicas SEM providers — zero Supabase */}
            <Route path="/login" element={<LoginAdmin />} />
            <Route path="/acesso" element={<LoginOperacional />} />
            <Route path="/comprador" element={<LoginComprador />} />
            <Route path="/comprador/agenda" element={<AgendamentoComprador />} />

            {/* Rotas simples SEM providers — só usam hooks diretos */}
            <Route path="/fornecedores" element={<ProtectedRoute adminOnly><Fornecedores /></ProtectedRoute>} />
            <Route path="/funcionarios" element={<ProtectedRoute adminOnly><Funcionarios /></ProtectedRoute>} />
            <Route path="/acessos" element={<ProtectedRoute adminOnly><Acessos /></ProtectedRoute>} />
            <Route path="/tipos-veiculo" element={<ProtectedRoute adminOnly><TiposVeiculo /></ProtectedRoute>} />

            {/* Rotas com Senha only */}
            <Route path="/senha" element={<SenhaOnlyRoutes />} />
            <Route path="/painel" element={<SenhaOnlyRoutes />} />
            <Route path="/senhas" element={<SenhaOnlyRoutes />} />

            {/* Rota com Senha + Solicitacao */}
            <Route path="/solicitacao" element={<SenhaSolicitacaoRoutes />} />

            {/* Rotas com Senha + Cross */}
            <Route path="/cross" element={<SenhaCrossRoutes />} />
            <Route path="/armazenamento" element={<SenhaCrossRoutes />} />

            {/* Rotas que precisam de tudo */}
            <Route path="/" element={<FullProviderRoutes />} />
            <Route path="/agenda" element={<FullProviderRoutes />} />
            <Route path="/docas" element={<FullProviderRoutes />} />
            <Route path="/agendamento" element={<FullProviderRoutes />} />
            <Route path="/solicitacoes" element={<FullProviderRoutes />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProfileProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
