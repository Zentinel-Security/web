import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import LoginModal from "../auth/LoginModal";

export default function Navbar() {
  const { isAuthenticated, logout, user, isStaff } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const linkBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";
  const linkActive =
    "bg-zentinel-gold/10 text-zentinel-gold font-semibold border border-zentinel-gold/25 shadow-sm";
  const linkInactive =
    "text-zentinel-text-muted hover:text-zentinel-gold hover:bg-zentinel-gold/10 transition-all";

  return (
    <nav className="sticky top-0 z-50 w-full bg-zentinel-dark-secondary/95 backdrop-blur-md shadow-sm" style={{borderBottom: '1px solid color-mix(in srgb, var(--color-zentinel-gold) 25%, transparent)'}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div
              aria-label="Escudo Zentinel"
              className="flex h-10 w-10 items-center justify-center text-zentinel-gold"
              style={theme === "dark" ? { filter: "drop-shadow(0 0 10px rgba(251,191,36,0.35))" } : undefined}
            >
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 2.5L20 5.5V11.5C20 16.8 16.7 20.7 12 22C7.3 20.7 4 16.8 4 11.5V5.5L12 2.5Z"
                  className="fill-zentinel-gold/15 stroke-zentinel-gold"
                  strokeWidth="1.5"
                />
                <path
                  d="M8.4 8.2H15.6L9.2 15.8H15.6"
                  className="stroke-zentinel-gold"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="font-extrabold text-lg md:text-xl tracking-widest hidden sm:block text-zentinel-gold"
              style={theme === "dark" ? { textShadow: "0 0 22px rgba(251,191,36,0.45)" } : undefined}
            >
              ZENTINEL
            </span>
          </div>

          <div className="flex items-center gap-2">
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
                to="/reportes"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : linkInactive}`
                }
              >
                Reportes
              </NavLink>
              {isStaff ? (
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

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="rounded-lg p-2 text-zentinel-text-muted transition-all hover:bg-zentinel-gold/10 hover:text-zentinel-gold"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.166 17.834a.75.75 0 0 0-1.06 1.06l1.59 1.591a.75.75 0 1 0 1.061-1.06l-1.59-1.591ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.166 6.166a.75.75 0 0 0 1.06 1.06l1.591-1.59a.75.75 0 1 0-1.06-1.061L6.166 6.166Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {isAuthenticated ? (
              <div className="hidden items-center gap-2 rounded-lg border border-zentinel-gold-dark/25 bg-zentinel-dark/70 px-3 py-1.5 sm:flex">
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
                className="rounded-lg border border-zentinel-gold/60 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-zentinel-gold transition-all hover:bg-zentinel-gold hover:text-zentinel-dark"
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
