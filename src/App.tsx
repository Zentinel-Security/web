import { HashRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Inicio from "./pages/Inicio/Inicio";
import Metricas from "./pages/Metricas/Metricas";
import Manual from "./pages/Manual/Manual";
import NotFound from "./pages/NotFound/NotFound"; // 1. Importa el nuevo componente

function App() {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen w-full bg-zentinel-dark text-zentinel-text">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/metricas" element={<Metricas />} />
            <Route path="/manual" element={<Manual />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
