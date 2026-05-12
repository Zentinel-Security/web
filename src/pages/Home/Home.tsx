import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchMetricas } from "../../services/metricasService";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
      </svg>
    ),
    title: "Rastreo en tiempo real",
    description: "Monitorea la ubicación de tus seres queridos desde la app. Si algo pasa, te notificaremos de inmediato.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
      </svg>
    ),
    title: "Reporte de extravío",
    description: "Con un solo toque activás el protocolo de seguridad: la cuenta se suspende, se bloquea la cuenta y se alerta a tus contactos.",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
      </svg>
    ),
    title: "Alertas SOS",
    description: "Botón de pánico integrado en la app. Con una pulsación enviás una alerta invasiva de emergencia a tus contactos",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    title: "Grupos de seguridad",
    description: "Organizá tu red de confianza en grupos. Compartí tu ubicación y recibí alertas de las personas que más importan.",
  },
];

const steps = [
  { step: "01", title: "Descargá la app", description: "Disponible para Android. Creá tu cuenta en minutos." },
  { step: "02", title: "Registrá tu dispositivo", description: "Crea tu cuenta y configurá tus contactos de emergencia." },
  { step: "03", title: "Viví tranquilo", description: "Zentinel corre en tiempo real. Si algo ocurre, actuamos de inmediato." },
];

const plans = [
  {
    key: "gratuito",
    name: "Gratuito",
    highlight: false,
    features: [
      { text: "Reporte de extravío", included: true },
      { text: "Alertas SOS básicas", included: true },
      { text: "1 grupo de seguridad", included: true },
      { text: "Rastreo en tiempo real", included: false },
      { text: "Zonas seguras ilimitadas", included: false },
      { text: "Zentinelas prioritarios", included: false },
    ],
  },
  {
    key: "premium",
    name: "Premium",
    highlight: true,
    features: [
      { text: "Reporte de extravío", included: true },
      { text: "Alertas SOS avanzadas", included: true },
      { text: "Grupos ilimitados", included: true },
      { text: "Rastreo en tiempo real", included: true },
      { text: "Zonas seguras ilimitadas", included: true },
      { text: "Zentinelas prioritarios", included: false },
    ],
  },
  {
    key: "premium_plus",
    name: "Premium Plus",
    highlight: false,
    features: [
      { text: "Reporte de extravío", included: true },
      { text: "Alertas SOS avanzadas", included: true },
      { text: "Grupos ilimitados", included: true },
      { text: "Rastreo en tiempo real", included: true },
      { text: "Zonas seguras ilimitadas", included: true },
      { text: "Zentinelas prioritarios", included: true },
    ],
  },
];

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);
  return count;
}

export default function Home() {
  const { isStaff, token } = useAuth();
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const counterRef = useRef<HTMLDivElement>(null);
  const [counterVisible, setCounterVisible] = useState(false);
  const displayCount = useCountUp(counterVisible ? totalUsuarios : 0);

  useEffect(() => {
    if (!isStaff || !token) return;
    fetchMetricas(token)
      .then((d) => setTotalUsuarios(d.usuarios.total))
      .catch(() => {});
  }, [isStaff, token]);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setCounterVisible(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-24 pb-16">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative text-center pt-8 sm:pt-14">
        <div className="absolute inset-0 -z-10 flex items-start justify-center overflow-hidden pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full bg-zentinel-gold/10 blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-zentinel-gold/30 bg-zentinel-gold/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-zentinel-gold mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-zentinel-gold animate-pulse" />
          Seguridad para vos y tus seres queridos
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zentinel-text mb-6 leading-tight">
          Tu dispositivo,{" "}
          <span className="text-zentinel-gold">siempre protegido</span>
        </h1>

        <p className="text-lg sm:text-xl text-zentinel-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          Zentinel es la app de seguridad que monitorea a tus seres queridos en tiempo real y te conecta con tu red de confianza en segundos.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/reportes"
            className="inline-flex items-center gap-2 rounded-xl bg-zentinel-gold px-7 py-3 text-sm font-bold text-zentinel-dark transition-all hover:bg-zentinel-gold-light hover:scale-105 shadow-lg shadow-zentinel-gold/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            Reportar dispositivo
          </Link>
          <Link
            to="/soporte"
            className="inline-flex items-center gap-2 rounded-xl border border-zentinel-gold/40 px-7 py-3 text-sm font-semibold text-zentinel-gold transition-all hover:bg-zentinel-gold/10"
          >
            Contactar soporte
          </Link>
        </div>

        {/* Play Store badge */}
        <div className="mt-8 flex justify-center">
          <div
            className="inline-flex items-center gap-3 rounded-2xl border border-zentinel-gold-dark/30 bg-zentinel-dark-secondary px-5 py-3 opacity-70 cursor-not-allowed select-none"
            title="Próximamente disponible en Google Play"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7 fill-zentinel-gold flex-shrink-0" aria-hidden="true">
              <path d="M3.18 23.76c.3.17.65.19.97.07L15.83 12 12 8.17 3.18 23.76zm17.15-12.25-3.06-1.75L13.41 12l3.86 3.86 3.06-1.74a1.4 1.4 0 0 0 0-2.61zM3.65.17a1.05 1.05 0 0 0-.47.91v21.84c0 .38.18.72.47.91L12 12 3.65.17zM15.83 12 4.15.24a1.1 1.1 0 0 0-.97.07L12 12l3.83-3.83L15.83 12z"/>
            </svg>
            <div className="text-left">
              <p className="text-[11px] text-zentinel-text-muted leading-none">Próximamente en</p>
              <p className="text-sm font-bold text-zentinel-text leading-tight">Google Play</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zentinel-text mb-3">
            Todo lo que necesitás, en una sola app
          </h2>
          <p className="text-zentinel-text-muted max-w-xl mx-auto">
            Diseñada para que respondas rápido cuando más importa.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary p-6 transition-all duration-300 hover:border-zentinel-gold/40 hover:shadow-lg hover:shadow-zentinel-gold/10 hover:-translate-y-1"
            >
              <div className="mb-4 inline-flex rounded-xl bg-zentinel-gold/10 p-3 text-zentinel-gold transition-colors group-hover:bg-zentinel-gold/20">
                {f.icon}
              </div>
              <h3 className="mb-2 font-bold text-zentinel-text">{f.title}</h3>
              <p className="text-sm text-zentinel-text-muted leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLANS ─────────────────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zentinel-text mb-3">
            Encontrá el plan que mejor se adapta
          </h2>
          <p className="text-zentinel-text-muted max-w-xl mx-auto">
            Todos los planes incluyen acceso a la app móvil y actualizaciones.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all ${
                plan.highlight
                  ? "border-zentinel-gold bg-zentinel-gold/5 shadow-xl shadow-zentinel-gold/10"
                  : "border-zentinel-gold-dark/20 bg-zentinel-dark-secondary"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-zentinel-gold px-3 py-0.5 text-xs font-bold text-zentinel-dark">
                    Más popular
                  </span>
                </div>
              )}
              <div>
                <h3 className={`text-lg font-extrabold ${ plan.highlight ? "text-zentinel-gold" : "text-zentinel-text"}`}>
                  {plan.name}
                </h3>
              </div>
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-center gap-2.5 text-sm">
                    {f.included ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-zentinel-gold flex-shrink-0">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-zentinel-text-muted/30 flex-shrink-0">
                        <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                      </svg>
                    )}
                    <span className={f.included ? "text-zentinel-text" : "text-zentinel-text-muted/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zentinel-text mb-3">
            ¿Cómo funciona?
          </h2>
          <p className="text-zentinel-text-muted max-w-xl mx-auto">
            Tres pasos para estar siempre protegido.
          </p>
        </div>

        <div className="relative grid gap-8 sm:grid-cols-3">
          <div className="absolute top-5 left-[16%] right-[16%] hidden h-px bg-gradient-to-r from-transparent via-zentinel-gold/30 to-transparent sm:block" />
          {steps.map((s) => (
            <div key={s.step} className="relative flex flex-col items-center text-center">
              <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-full border-2 border-zentinel-gold bg-zentinel-dark-secondary text-sm font-black text-zentinel-gold shadow-lg shadow-zentinel-gold/20">
                {s.step}
              </div>
              <h3 className="mb-2 font-bold text-zentinel-text">{s.title}</h3>
              <p className="text-sm text-zentinel-text-muted leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section ref={counterRef} className="rounded-2xl border border-zentinel-gold-dark/20 bg-zentinel-dark-secondary py-12 px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-zentinel-text-muted mb-3">
          Confianza que crece
        </p>
        <p className="text-6xl sm:text-7xl font-extrabold text-zentinel-gold leading-none">
          {isStaff && totalUsuarios > 0 ? `+${displayCount}` : "+100"}
        </p>
        <p className="mt-3 text-lg text-zentinel-text-muted">
          usuarios ya protegidos con Zentinel
        </p>
      </section>

    </div>
  );
}
