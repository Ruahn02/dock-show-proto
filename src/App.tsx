import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Dashboard from "./pages/Dashboard";
import Agendamento from "./pages/Agendamento";
import Docas from "./pages/Docas";
import Fornecedores from "./pages/Fornecedores";
import Conferentes from "./pages/Conferentes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ProfileProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/agendamento" element={<Agendamento />} />
            <Route path="/docas" element={<Docas />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/conferentes" element={<Conferentes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ProfileProvider>
  </QueryClientProvider>
);

export default App;
