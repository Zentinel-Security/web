import { NavLink } from "react-router-dom";
import logo from "../../assets/logo-zentinel.png";

export default function Navbar() {
  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
  const linkActive =
    "bg-zentinel-gold/10 text-zentinel-gold font-bold border border-zentinel-gold/20";
  const linkInactive =
    "text-zentinel-text-muted hover:text-zentinel-gold-light hover:bg-white/5";

  return (
    <nav className="sticky top-0 z-50 w-full bg-zentinel-dark-secondary border-b border-zentinel-gold-dark/30 shadow-lg shadow-black/50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <img
              className="h-8 w-auto md:h-10"
              src={logo}
              alt="Zentinel Logo"
            />
            <span className="text-zentinel-gold font-bold text-lg md:text-xl tracking-widest hidden sm:block">
              ZENTINEL
            </span>
          </div>

          {/* Links */}
          <div className="flex gap-1 md:gap-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Inicio
            </NavLink>
            <NavLink
              to="/metricas"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Métricas
            </NavLink>
            <NavLink
              to="/manual"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : linkInactive}`
              }
            >
              Manual
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
