import { NavLink } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo-zentinel.png";
import { useAuth } from "../../context/AuthContext";
import LoginModal from "../auth/LoginModal";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const isAdmin = Boolean(user?.es_admin);

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

          <div className="flex items-center gap-3">
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
              {isAdmin ? (
                <>
                  <NavLink
                    to="/metricas"
                    className={({ isActive }) =>
                      `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                  >
                    Métricas
                  </NavLink>
                  <NavLink
                    to="/gestion"
                    className={({ isActive }) =>
                      `${linkBase} ${isActive ? linkActive : linkInactive}`
                    }
                  >
                    Gestión
                  </NavLink>
                </>
              ) : null}
              <NavLink
                to="/soporte"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Soporte
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

            {isAuthenticated ? (
              <div className="hidden items-center gap-2 rounded-md border border-zentinel-gold-dark/30 bg-zentinel-dark/60 px-2 py-1 sm:flex">
                <span className="max-w-[140px] truncate text-xs text-zentinel-text-muted">
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded bg-zentinel-gold px-2 py-1 text-xs font-bold text-zentinel-dark hover:bg-zentinel-gold-light"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginOpen(true)}
                className="rounded-md border border-zentinel-gold/50 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zentinel-gold transition-colors hover:bg-zentinel-gold/10"
              >
                Iniciar sesión
              </button>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </nav>
  );
}
