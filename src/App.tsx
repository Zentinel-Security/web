import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Inicio from "./pages/Inicio/Inicio";
import Metricas from "./pages/Metricas/Metricas";
import Manual from "./pages/Manual/Manual";
import NotFound from "./pages/NotFound/NotFound";
import Gestion from "./pages/Gestion/Gestion";
import Soporte from "./pages/Soporte/Soporte";
import Perfil from "./pages/Perfil/Perfil";
import { useAuth } from "./context/AuthContext";
import { useEffect, useRef } from "react";

function AnimatedRoutes({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.25s ease, transform 0.25s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, [location.pathname]);
  return <div ref={ref}>{children}</div>;
}

function StaffOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isStaff } = useAuth();
  if (!isStaff) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AuthOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
          <AnimatedRoutes>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reportes" element={<Inicio />} />
            <Route path="/metricas" element={<StaffOnlyRoute><Metricas /></StaffOnlyRoute>} />
            <Route path="/gestion" element={<StaffOnlyRoute><Gestion /></StaffOnlyRoute>} />
            <Route path="/soporte" element={<Soporte />} />
            <Route path="/manual" element={<Manual />} />
            <Route path="/perfil" element={<AuthOnlyRoute><Perfil /></AuthOnlyRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AnimatedRoutes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

export default App;
