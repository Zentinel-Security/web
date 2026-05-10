import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Home from "./pages/Home/Home";
import Inicio from "./pages/Inicio/Inicio";
import Metricas from "./pages/Metricas/Metricas";
import Manual from "./pages/Manual/Manual";
import NotFound from "./pages/NotFound/NotFound";
import Gestion from "./pages/Gestion/Gestion";
import Soporte from "./pages/Soporte/Soporte";
import { useAuth } from "./context/AuthContext";

function StaffOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isStaff } = useAuth();

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen w-full">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reportes" element={<Inicio />} />
            <Route path="/metricas" element={<StaffOnlyRoute><Metricas /></StaffOnlyRoute>} />
            <Route path="/gestion" element={<StaffOnlyRoute><Gestion /></StaffOnlyRoute>} />
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
