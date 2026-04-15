import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Inicio from "./pages/Inicio/Inicio";
import Metricas from "./pages/Metricas/Metricas";
import Manual from "./pages/Manual/Manual";
import NotFound from "./pages/NotFound/NotFound";
import Gestion from "./pages/Gestion/Gestion";
import Soporte from "./pages/Soporte/Soporte";
import { useAuth } from "./context/AuthContext";

function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (!user?.es_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen w-full bg-zentinel-dark text-zentinel-text">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/metricas" element={<AdminOnlyRoute><Metricas /></AdminOnlyRoute>} />
            <Route path="/gestion" element={<AdminOnlyRoute><Gestion /></AdminOnlyRoute>} />
            <Route path="/soporte" element={<Soporte />} />
            <Route path="/manual" element={<Manual />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
