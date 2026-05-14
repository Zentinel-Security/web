import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import LoginModal from "../auth/LoginModal";

export default function Navbar() {
  const { isAuthenticated, logout, user, isStaff } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const initials = user
    ? `${user.nombre?.charAt(0) ?? ""}${user.apellido?.charAt(0) ?? ""}`.toUpperCase()
    : "";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-xl border border-zentinel-gold-dark/25 bg-zentinel-dark/70 pl-1 pr-3 py-1 hover:border-zentinel-gold/40 transition-colors"
                  aria-label="Menú de usuario"
                >
                  <div className="w-7 h-7 rounded-full bg-zentinel-gold/15 border border-zentinel-gold/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-zentinel-gold">{initials}</span>
                    )}
                  </div>
                  <span className="hidden sm:block max-w-[100px] truncate text-xs text-zentinel-text-muted">
                    {user?.nombre}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 text-zentinel-text-muted transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}>
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zentinel-gold-dark/25 bg-zentinel-dark-secondary shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-zentinel-gold-dark/15">
                      <p className="text-xs font-semibold text-zentinel-text truncate">{user?.nombre} {user?.apellido}</p>
                      <p className="text-[11px] text-zentinel-text-muted truncate mt-0.5">{user?.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setIsUserMenuOpen(false); navigate("/perfil"); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zentinel-text-muted hover:bg-zentinel-text/5 hover:text-zentinel-text transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                      </svg>
                      Mi perfil
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsUserMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z" clipRule="evenodd" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                )}
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
