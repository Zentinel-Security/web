import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Inicio from "./pages/Inicio/Inicio";
import Metricas from "./pages/Metricas/Metricas";
import Manual from "./pages/Manual/Manual";

function App() {
  return (
    <BrowserRouter basename="/web/">
      <div className="flex flex-col min-h-screen w-full bg-zentinel-dark text-zentinel-text">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/metricas" element={<Metricas />} />
            <Route path="/manual" element={<Manual />} />
            <Route path="*" element={<Inicio />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
