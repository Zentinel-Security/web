import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-zentinel-gold-dark/20 bg-zentinel-dark-secondary/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Logo + tagline */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-zentinel-gold" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.5L20 5.5V11.5C20 16.8 16.7 20.7 12 22C7.3 20.7 4 16.8 4 11.5V5.5L12 2.5Z" className="fill-zentinel-gold/15 stroke-zentinel-gold" strokeWidth="1.5" />
                <path d="M8.4 8.2H15.6L9.2 15.8H15.6" className="stroke-zentinel-gold" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-extrabold tracking-widest text-zentinel-gold text-sm">ZENTINEL</span>
            </div>
            <p className="text-xs text-zentinel-text-muted">Seguridad personal en tiempo real</p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-zentinel-text-muted">
            <Link to="/" className="hover:text-zentinel-gold transition-colors">Inicio</Link>
            <Link to="/reportes" className="hover:text-zentinel-gold transition-colors">Reportes</Link>
            <Link to="/soporte" className="hover:text-zentinel-gold transition-colors">Soporte</Link>
            <Link to="/manual" className="hover:text-zentinel-gold transition-colors">Manual</Link>
          </nav>

          {/* Play Store badge */}
          <div
            className="inline-flex items-center gap-2 rounded-xl border border-zentinel-gold-dark/30 bg-zentinel-dark px-4 py-2 opacity-60 cursor-not-allowed select-none"
            title="Próximamente disponible"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-zentinel-gold" aria-hidden="true">
              <path d="M3.18 23.76c.3.17.65.19.97.07L15.83 12 12 8.17 3.18 23.76zm17.15-12.25-3.06-1.75L13.41 12l3.86 3.86 3.06-1.74a1.4 1.4 0 0 0 0-2.61zM3.65.17a1.05 1.05 0 0 0-.47.91v21.84c0 .38.18.72.47.91L12 12 3.65.17zM15.83 12 4.15.24a1.1 1.1 0 0 0-.97.07L12 12l3.83-3.83L15.83 12z"/>
            </svg>
            <div className="text-left">
              <p className="text-[10px] text-zentinel-text-muted leading-none">Próximamente en</p>
              <p className="text-xs font-bold text-zentinel-text leading-tight">Google Play</p>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t border-zentinel-gold-dark/10 pt-4 text-center text-xs text-zentinel-text-muted/50">
          © {year} Zentinel. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
