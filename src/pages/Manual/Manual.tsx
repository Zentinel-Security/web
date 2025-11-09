// src/pages/Manual/Manual.tsx
import React from "react";

export default function Manual() {
  // Función auxiliar para el scroll suave
  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header del Manual */}
      <header className="mb-12 border-b border-zentinel-gold-dark/30 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-zentinel-gold tracking-tight">
          Manual de Usuario
        </h1>
        <p className="text-xl text-zentinel-text-muted mt-4 max-w-3xl">
          Bienvenido a la documentación oficial de Zentinel. Aquí encontrarás
          todo lo necesario para configurar y utilizar tu sistema de seguridad
          personal al máximo.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* --- SIDEBAR DE NAVEGACIÓN --- */}
        <aside className="lg:w-72 shrink-0">
          <nav className="sticky top-24 bg-zentinel-dark-secondary/80 backdrop-blur-md rounded-xl p-6 border border-zentinel-gold-dark/30 shadow-xl shadow-black/20">
            <h3 className="text-zentinel-gold font-bold mb-6 uppercase text-sm tracking-widest border-b border-zentinel-gold-dark/20 pb-2">
              Índice de Contenidos
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#registro"
                  onClick={scrollToSection("registro")}
                  className="nav-item-manual"
                >
                  1. Registrarse y Loguearse
                </a>
              </li>
              <li>
                <a
                  href="#grupos"
                  onClick={scrollToSection("grupos")}
                  className="nav-item-manual"
                >
                  2. Grupos
                </a>
              </li>
              <li className="pl-4 text-sm text-zentinel-text-muted/60 hidden md:block">
                • Gestión de grupos e integrantes
              </li>
              <li>
                <a
                  href="#zonas"
                  onClick={scrollToSection("zonas")}
                  className="nav-item-manual"
                >
                  3. Zonas Seguras
                </a>
              </li>
              <li>
                <a
                  href="#zentinelas"
                  onClick={scrollToSection("zentinelas")}
                  className="nav-item-manual"
                >
                  4. Zentinelas
                </a>
              </li>
              <li>
                <a
                  href="#configuracion"
                  onClick={scrollToSection("configuracion")}
                  className="nav-item-manual"
                >
                  5. Configuración
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="flex-1 prose prose-invert prose-zentinel max-w-none">
          {/* SECCIÓN 1: REGISTRO */}
          <section id="registro" className="manual-section">
            <h2 className="manual-h2">1. Registrarse y Loguearse</h2>
            <p>
              Para comenzar a utilizar Zentinel, es necesario crear una cuenta
              verificada. Esto asegura que tus datos de emergencia y ubicaciones
              estén protegidos.
            </p>
            <div className="bg-zentinel-dark-secondary p-4 rounded-lg border-l-4 border-zentinel-gold my-4">
              <strong>Nota importante:</strong> Necesitarás un número de
              teléfono válido para completar el registro mediante verificación
              SMS.
            </div>
            <h3>Proceso de Registro</h3>
            <ol>
              <li>Abre la aplicación móvil y selecciona "Crear Cuenta".</li>
              <li>Ingresa tus datos personales y tu número de teléfono.</li>
              <li>Introduce el código de 6 dígitos que recibirás por SMS.</li>
            </ol>
            <h3>Inicio de Sesión</h3>
            <p>
              Una vez registrado, puedes ingresar simplemente con tu email y
              contraseña, o utilizar autenticación biométrica si tu dispositivo
              lo permite.
            </p>
          </section>

          {/* SECCIÓN 2: GRUPOS */}
          <section id="grupos" className="manual-section">
            <h2 className="manual-h2">2. Grupos</h2>
            <p>
              Los grupos te permiten compartir tu estado de seguridad con
              personas de confianza (familia, amigos, equipo de trabajo).
            </p>

            <div className="space-y-8 mt-8">
              {/* Inciso: Crear */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">Crear Grupo</h3>
                <p>
                  Dirígete a la pestaña "Grupos" y pulsa el botón "+". Asigna un
                  nombre e incluso una foto representativa para identificarlo
                  fácilmente.
                </p>
              </div>

              {/* Inciso: Modificar */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Modificar Grupo
                </h3>
                <p>
                  Como administrador, puedes cambiar el nombre o la imagen del
                  grupo desde los ajustes del mismo (icono de engranaje en la
                  esquina superior derecha de la vista de grupo).
                </p>
              </div>

              {/* Inciso: Eliminar */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Eliminar Grupo
                </h3>
                <p>
                  Si eliminas un grupo, se disolverá para todos los miembros.
                  Esta acción no se puede deshacer.
                </p>
              </div>

              {/* Inciso: Agregar integrante */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Agregar Integrante
                </h3>
                <p>
                  Dentro del grupo, selecciona "Añadir miembro". Puedes
                  invitarlos mediante:
                </p>
                <ul className="list-disc pl-6 text-zentinel-text-muted">
                  <li>Código QR (para escaneo presencial).</li>
                  <li>Enlace de invitación único (expira en 24hs).</li>
                </ul>
              </div>

              {/* Inciso: Eliminar integrante */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Eliminar Integrante
                </h3>
                <p>
                  Mantén presionado el nombre del integrante que deseas remover
                  y selecciona "Expulsar del grupo".
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 3: ZONAS SEGURAS */}
          <section id="zonas" className="manual-section">
            <h2 className="manual-h2">3. Zonas Seguras</h2>
            <p>
              Las zonas seguras son áreas geográficas (como tu casa, oficina o
              universidad) donde la aplicación puede activar comportamientos
              automáticos.
            </p>
            <p>
              Puedes configurar alertas para que tus "Zentinelas" sean
              notificados automáticamente cuando entras o sales de una zona
              segura específica.
            </p>
          </section>

          {/* SECCIÓN 4: ZENTINELAS */}
          <section id="zentinelas" className="manual-section">
            <h2 className="manual-h2">4. Zentinelas</h2>
            <p>
              Un "Zentinela" es un contacto de emergencia prioritario. A
              diferencia de los miembros normales de un grupo, los Zentinelas
              reciben alertas críticas incluso si tienen el teléfono en modo "No
              Molestar" (dependiendo de los permisos del sistema operativo).
            </p>
            <p>
              Recomendamos asignar al menos dos Zentinelas para garantizar que
              siempre alguien reciba tus alertas de S.O.S.
            </p>
          </section>

          {/* SECCIÓN 5: CONFIGURACIÓN */}
          <section id="configuracion" className="manual-section">
            <h2 className="manual-h2">5. Configuración</h2>
            <p>
              Personaliza tu experiencia en Zentinel. En esta sección podrás
              ajustar:
            </p>
            <ul>
              <li>
                <strong>Sensibilidad de detección de caídas.</strong>
              </li>
              <li>
                <strong>Frecuencia de actualización de ubicación</strong> (mayor
                frecuencia consume más batería).
              </li>
              <li>
                <strong>Modo oscuro/claro</strong> de la aplicación móvil.
              </li>
              <li>
                <strong>Gestión de tu cuenta</strong> (cambio de contraseña,
                eliminación de cuenta).
              </li>
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
