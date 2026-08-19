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
                  href="#introduccion"
                  onClick={scrollToSection("introduccion")}
                  className="nav-item-manual"
                >
                  1. ¿Qué es Zentinel Security?
                </a>
              </li>
              <li>
                <a
                  href="#registro"
                  onClick={scrollToSection("registro")}
                  className="nav-item-manual"
                >
                  2. Registro e inicio de sesión
                </a>
              </li>
              <li>
                <a
                  href="#configuracion"
                  onClick={scrollToSection("configuracion")}
                  className="nav-item-manual"
                >
                  3. Configuración de la cuenta
                </a>
              </li>
              <li>
                <a
                  href="#grupos"
                  onClick={scrollToSection("grupos")}
                  className="nav-item-manual"
                >
                  4. Grupos
                </a>
              </li>
              <li className="pl-4 text-sm text-zentinel-text-muted/60 hidden md:block">
                • Gestión de grupos e integrantes
              </li>
              <li>
                <a
                  href="#zentinelas"
                  onClick={scrollToSection("zentinelas")}
                  className="nav-item-manual"
                >
                  5. Usuarios zentinelas
                </a>
              </li>
              <li>
                <a
                  href="#zonas"
                  onClick={scrollToSection("zonas")}
                  className="nav-item-manual"
                >
                  6. Zonas seguras
                </a>
              </li>
              <li>
                <a
                  href="#monitoreo"
                  onClick={scrollToSection("monitoreo")}
                  className="nav-item-manual"
                >
                  7. Monitoreo y ubicación en tiempo real
                </a>
              </li>
              <li>
                <a
                  href="#notificaciones"
                  onClick={scrollToSection("notificaciones")}
                  className="nav-item-manual"
                >
                  8. Alertas y notificaciones
                </a>
              </li>
              <li>
                <a
                  href="#boton"
                  onClick={scrollToSection("boton")}
                  className="nav-item-manual"
                >
                  9. Botón de pánico
                </a>
              </li>
              <li className="pl-4 text-sm text-zentinel-text-muted/60 hidden md:block">
                • Incidente y seguimiento del recorrido
              </li>
              <li>
                <a
                  href="#reporte"
                  onClick={scrollToSection("reporte")}
                  className="nav-item-manual"
                >
                  10. Dispositivo robado o extraviado
                </a>
              </li>
              <li>
                <a
                  href="#suscripciones"
                  onClick={scrollToSection("suscripciones")}
                  className="nav-item-manual"
                >
                  11. Suscripciones, planes y pagos
                </a>
              </li>
              <li>
                <a
                  href="#soporte"
                  onClick={scrollToSection("soporte")}
                  className="nav-item-manual"
                >
                  12. Ayuda y soporte
                </a>
              </li>
              <li>
                <a
                  href="#recomendaciones"
                  onClick={scrollToSection("recomendaciones")}
                  className="nav-item-manual"
                >
                  13. Recomendaciones de uso
                </a>
              </li>
              <li>
                <a
                  href="#preguntas"
                  onClick={scrollToSection("preguntas")}
                  className="nav-item-manual"
                >
                  14. Preguntas frecuentes
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <main className="flex-1 prose prose-invert prose-zentinel max-w-none">
          {/* SECCIÓN 1: INTRODUCCION */}
          <section id="introduccion" className="manual-section">
            <h2 className="manual-h2">1. ¿Qué es Zentinel Security?</h2>
            <p>
              Zentinel Security es una plataforma orientada a la seguridad personal y 
              comunitaria que permite monitorear ubicaciones en tiempo real, gestionar 
              grupos de confianza y generar alertas automáticas ante situaciones de riesgo.
            </p>
            <p>
              La aplicación fue diseñada para brindar herramientas preventivas y de 
              comunicación rápida entre usuarios y sus contactos de confianza.
            </p>

            <p className="text-zentinel-text font-semibold text-lg mt-6 mb-4">
              Entre sus funcionalidades principales se encuentran:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-zentinel-dark-secondary rounded-lg p-4 border border-zentinel-gold-dark/30">
                <strong>Monitoreo geolocalizado</strong>
              </div>

              <div className="bg-zentinel-dark-secondary rounded-lg p-4 border border-zentinel-gold-dark/30">
                <strong>Botón de pánico</strong>
              </div>

              <div className="bg-zentinel-dark-secondary rounded-lg p-4 border border-zentinel-gold-dark/30">
                <strong>Gestión de grupos de confianza</strong>
              </div>

              <div className="bg-zentinel-dark-secondary rounded-lg p-4 border border-zentinel-gold-dark/30">
                <strong>Reporte de dispositivos robados o extraviados</strong>
              </div>

              <div className="bg-zentinel-dark-secondary rounded-lg p-4 border border-zentinel-gold-dark/30">
                <strong>Creación de zonas seguras</strong>
              </div>

              <div className="bg-zentinel-dark-secondary rounded-lg p-4 border border-zentinel-gold-dark/30">
                <strong>Gestión de soporte mediante tickets</strong>
              </div>

              <div className="bg-zentinel-dark-secondary rounded-lg p-4 border border-zentinel-gold-dark/30">
                <strong>Alertas automáticas</strong>
              </div>

              <div className="bg-zentinel-dark-secondary rounded-lg p-4 border border-zentinel-gold-dark/30">
                <strong>Planes de suscripción con pago online</strong>
              </div>
            </div>
          </section>
          
          {/* SECCIÓN 2: REGISTRO */}
          <section id="registro" className="manual-section">
            <h2 className="manual-h2">2. Registro e Inicio de Sesión</h2>
            <p>
              Para comenzar a utilizar Zentinel, es necesario crear una cuenta
              verificada. Esto asegura que tus datos de emergencia y ubicaciones
              estén protegidos.
            </p>

            <div className="manual-note">
              <strong>Nota importante:</strong> Necesitarás una dirección de 
              correo electrónico válida para completar el registro. Este correo 
              será utilizado para la verificación de la cuenta y para futuras 
              acciones de recuperación de acceso.
            </div>

            <div>
              <h3 className="text-zentinel-text text-xl font-semibold mb-4">
                Proceso de Registro
              </h3>
              <ol className="space-y-3">
                <li>
                  <strong className="text-zentinel-text">Paso 1:</strong> Selecciona <strong className="text-zentinel-gold">Crear Cuenta</strong> desde la pantalla principal.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 2:</strong> Completa la información solicitada, incluyendo tus datos personales, correo electrónico y número de teléfono.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 3:</strong> Revisa tu correo electrónico y accede al enlace de verificación enviado por Zentinel Security.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 4:</strong> Una vez completada la verificación, podrás iniciar sesión y comenzar a utilizar todas las funcionalidades de Zentinel Security.
                </li>
              </ol>
            </div>

            <h3 className="text-zentinel-text text-xl font-semibold mb-4">
              Inicio de Sesión
            </h3>
            <p>
              Una vez registrado, puedes ingresar simplemente con tu email y
              contraseña, o utilizar autenticación biométrica si tu dispositivo
              lo permite.
            </p>
            <div className="manual-note">
              <strong>Consideración:</strong> Si tu cuenta fue suspendida como 
              consecuencia de un reporte de dispositivo, no podrás iniciar sesión 
              desde la aplicación móvil. Sin embargo, el acceso a la plataforma 
              web permanecerá habilitado para realizar acciones de recuperación, 
              soporte o reactivación de la cuenta. 
            </div>

            <div>
              <h3 className="text-zentinel-text text-xl font-semibold mb-4">
                Recuperación de Contraseña
              </h3>
              <p>
                En caso de olvidar la contraseña:
              </p>
              <ol className="space-y-3">
                <li>
                  <strong className="text-zentinel-text">Paso 1:</strong> Selecciona <strong className="text-zentinel-gold">¿Olvidaste tu contraseña?</strong>.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 2:</strong> Ingresa el correo electrónico asociado a tu cuenta.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 3:</strong> Sigue las instrucciones enviadas al correo.
                </li>
              </ol>
            </div>
          </section>

          {/* SECCIÓN 3: CONFIGURACION */}
          <section id="configuracion" className="manual-section">
            <h2 className="manual-h2">3. Configuración de la Cuenta</h2>
            <p>
              Desde la sección <strong className="text-zentinel-text">Cuenta</strong> podrás administrar tu información 
              personal y personalizar distintos aspectos de tu perfil dentro de Zentinel Security.
            </p>

            <p>
              En esta sección podrás:
            </p>

            <ul>
              <li>
                <strong>❖ Actualizar tus datos personales</strong>
              </li>
              <li>
                <strong>❖ Cambiar tu foto de perfil</strong>
              </li>
              <li>
                <strong>❖ Modificar tu dirección de correo electrónico</strong>
              </li>
              <li>
                <strong>❖ Actualizar tu contraseña</strong>
              </li>
            </ul>
          </section>

          {/* SECCIÓN 4: GRUPOS */}
          <section id="grupos" className="manual-section">
            <h2 className="manual-h2">4. Grupos</h2>
            <p>
              Los grupos te permiten compartir tu estado de seguridad con
              personas de confianza (familia, amigos, equipo de trabajo).
            </p>

            <div className="space-y-8 mt-8">
              {/* Inciso: Crear grupo*/}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">Crear Grupo</h3>
                <p>
                  Dirígete a la pestaña <strong className="text-zentinel-text">Grupos </strong> 
                  y pulsa el botón <strong className="text-zentinel-text">"+"</strong>. 
                  Asigna un nombre al grupo, una descripción opcional y 
                  selecciona un ícono representativo para identificarlo 
                  fácilmente. Además, deberás elegir el tipo de grupo que 
                  mejor se adapte a tus necesidades. Una vez completada 
                  la configuración, presiona <strong className="text-zentinel-text">Crear Grupo</strong>.
                </p>
              </div>

              {/* Inciso: Tipo grupo */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Tipo de Grupo
                </h3>
                <p className="text-zentinel-text-muted">
                  En los grupos de <strong className="text-zentinel-text">Zona Común</strong>, 
                  todos los integrantes comparten las mismas zonas seguras definidas por el administrador. 
                  En los grupos de <strong className="text-zentinel-text">Zona Individual</strong>, 
                  cada integrante administra sus propias zonas seguras y recibe alertas según su 
                  configuración personal.
                </p>
              </div>

              {/* Inciso: Modificar grupo*/}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Modificar Grupo
                </h3>
                <p>
                  Como administrador, puedes modificar la información del 
                  grupo desde los ajustes del mismo. Selecciona la opción 
                  <strong className="text-zentinel-text"> Editar</strong> para 
                  actualizar el nombre, la descripción, el ícono representativo 
                  o los integrantes del grupo. Una vez realizados los cambios, 
                  guarda la configuración para aplicarlos.
                </p>
              </div>

              {/* Inciso: Agregar integrante */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Agregar Integrante
                </h3>
                <p>
                  Dentro de la configuración del grupo, selecciona la opción 
                  <strong className="text-zentinel-text"> Añadir miembro</strong>. 
                  Ingresa el correo electrónico del usuario que deseas invitar 
                  y realiza la búsqueda. El usuario recibirá una invitación 
                  para unirse al grupo.
                </p>
                <p className="text-zentinel-text-muted">
                  <strong className="text-zentinel-gold">Nota:</strong>{" "}
                  Solo es posible invitar usuarios que ya se encuentren registrados 
                  en Zentinel Security.
                </p>
              </div>

              {/* Inciso: Eliminar integrante */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Eliminar Integrante
                </h3>
                <p>
                  Dentro de la configuración del grupo, selecciona el ícono de 
                  <strong className="text-zentinel-text"> borrar</strong> junto al nombre 
                  del integrante que deseas remover. Confirma para eliminar al 
                  integrante.
                </p>
              </div>

              {/* Inciso: Salir grupo*/}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Salir del Grupo
                </h3>
                <p>
                  Dentro de la configuración del grupo, selecciona la opción 
                  <strong className="text-zentinel-text"> Salir del grupo </strong> 
                  y confirma para abandonar el mismo.
                </p>
              </div>
              
              {/* Inciso: Eliminar grupo*/}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Eliminar Grupo
                </h3>
                <p>
                  Como administrador, puedes eliminar un grupo desde los ajustes del mismo. 
                  Para hacerlo, selecciona la opción <strong className="text-zentinel-text">Eliminar </strong> 
                  y confirma la acción.
                </p>
                <p className="text-zentinel-text-muted">
                  <strong className="text-zentinel-gold">Importante:</strong>{" "}
                  Si eliminas un grupo, este se disolverá para todos sus integrantes. 
                  Esta acción no puede deshacerse.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 5: ZENTINELAS */}
          <section id="zentinelas" className="manual-section">
            <h2 className="manual-h2">5. Usuarios Zentinelas</h2>
            <p>
              Un "Zentinela" es un contacto de emergencia prioritario. A
              diferencia de los miembros normales de un grupo, los Zentinelas
              reciben alertas críticas incluso si tienen el teléfono en modo "No
              Molestar" (dependiendo de los permisos del sistema operativo).
            </p>
            <div className="manual-note">
              <strong>Recomendación:</strong> Asigna al menos dos Zentinelas 
              para garantizar que siempre alguien reciba tus alertas de S.O.S. 
            </div>
            <div className="space-y-8 mt-8">
              {/* Inciso: Invitar zentinela */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Invitar Zentinela
                </h3>
                <p>
                  Dirígete a la pestaña <strong className="text-zentinel-text">Zentinelas </strong> 
                  y pulsa el botón <strong className="text-zentinel-text">“+”</strong>. Ingresa 
                  el correo electrónico del usuario que deseas invitar y realiza la búsqueda. 
                  Selecciona <strong className="text-zentinel-text">Guardar</strong> para confirmar. 
                  El usuario recibirá una invitación para vincularse como usuario zentinela.
                </p>
              </div>

              {/* Inciso: Eliminar zentinela */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Eliminar Zentinela
                </h3>
                <p>
                  Dirígete a la pestaña <strong className="text-zentinel-text">Zentinelas </strong> 
                  y selecciona el usuario zentinela que deseas remover. Selecciona la opción 
                  <strong className="text-zentinel-text"> Eliminar Zentinel</strong>. Confirma para 
                  eliminar al usuario zentinela.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 6: ZONAS SEGURAS */}
          <section id="zonas" className="manual-section">
            <h2 className="manual-h2">6. Zonas Seguras</h2>
            <p>
              Las zonas seguras son áreas geográficas, como tu casa, oficina o universidad, 
              donde la aplicación puede activar comportamientos automáticos. Puedes configurar 
              alertas para que tus <strong className="text-zentinel-text">Zentinelas </strong> sean 
              notificados automáticamente cuando entras o sales de una zona segura específica.
            </p>
            <div className="space-y-8 mt-8">
              {/* Inciso: Crear zona */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Crear Zona Segura
                </h3>
                <p>
                  Dirígete a la pestaña <strong className="text-zentinel-text">Ajustes</strong>, 
                  selecciona la opción <strong className="text-zentinel-text">Mis Zonas Seguras </strong> 
                  y pulsa el botón <strong className="text-zentinel-text">"+"</strong>. Asigna un nombre 
                  a la zona segura y selecciona un ícono representativo con un color para identificarlo 
                  fácilmente. Elije la ubicación en el mapa y define su radio. Una vez completada 
                  la configuración, presiona <strong className="text-zentinel-text">Guardar Zona</strong>.
                </p>
              </div>

              {/* Inciso: Mdificar zona */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Modificar Zona Segura
                </h3>
                <p>
                  Dentro de la configuración de zonas seguras, selecciona el ícono de 
                  <strong className="text-zentinel-text"> edición</strong> junto al nombre de 
                  la zona que deseas modificar. Presiona la opción 
                  <strong className="text-zentinel-text"> Guardar Zona</strong> para guardar los cambios.
                </p>
              </div>
              
              {/* Inciso: Eliminar zona */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Eliminar Zona Segura
                </h3>
                <p>
                  Dentro de la configuración de zonas seguras, selecciona el ícono de 
                  <strong className="text-zentinel-text"> borrar</strong> junto al nombre de 
                  la zona que deseas remover. Confirma para eliminar al integrante.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 7: MONITOREO */}
          <section id="monitoreo" className="manual-section">
            <h2 className="manual-h2">7. Monitoreo y Ubicación en Tiempo Real</h2>
            <p>
              La aplicación permite visualizar la ubicación de integrantes del grupo 
              en tiempo real.
            </p>

            <div className="manual-note">
              <strong>Nota:</strong> La frecuencia de actualización puede variar según 
              la conexión a internet y el estado del dispositivo.
            </div>

            <div className="space-y-8 mt-8">
              {/* Inciso: Activar ubicacion */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Activar / Desactivar Ubicación
                </h3>
                <p>
                  Desde la configuración del grupo, activa o desactiva la opción
                  <strong className="text-zentinel-text"> Compartir mi ubicación</strong>.
                </p>
                <p className="text-zentinel-text-muted">
                  <strong className="text-zentinel-gold">Importante:</strong>{" "}
                  Este ajuste solo afecta al grupo seleccionado y no modifica la 
                  configuración de ubicación en otros grupos.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 8: NOTIFICACIONES */}
          <section id="notificaciones" className="manual-section">
            <h2 className="manual-h2">8. Alertas y Notificaciones</h2>
            <p>
              Zentinel Security envía alertas y notificaciones automáticas ante eventos 
              importantes, como invitaciones a grupos, ingresos o salidas de zonas seguras, 
              invitaciones a usuarios zentinelas, activaciones del botón de pánico y reportes 
              de dispositivos extraviados o robados.
            </p>
            
            <div className="space-y-8 mt-8">
              {/* Inciso: Activar notificaciones */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Activar / Desactivar Notificaciones
                </h3>
                <p>
                  Dentro de la pestaña <strong className="text-zentinel-text">Ajustes</strong>, activa o 
                  desactiva la opción <strong className="text-zentinel-text">Notificaciones Push</strong>.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 9: BOTON */}
          <section id="boton" className="manual-section">
            <h2 className="manual-h2">9. Botón de Pánico</h2>
            <p>
              El botón de pánico permite enviar una alerta inmediata a tus usuarios zentinelas 
              cuando te encuentres en una situación de emergencia. Al activarlo no se envía 
              únicamente una notificación puntual: se abre un <strong className="text-zentinel-text">incidente</strong>, 
              es decir, un seguimiento en vivo de la emergencia que registra tu recorrido y todo lo que 
              sucede hasta que la situación se cierra.
            </p>
            
            <div className="space-y-8 mt-8">
              {/* Inciso: Activar boton */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Activar Botón de Pánico
                </h3>
                <p>
                  Presiona el botón de pánico ubicado en la parte inferior central de la pantalla 
                  y confirma la acción. Una vez activado, se enviará una alerta de emergencia 
                  junto con tu ubicación actual a tus usuarios zentinelas.
                </p>
              </div>

              {/* Inciso: Incidente */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Apertura del Incidente
                </h3>
                <p>
                  Al confirmar la activación se crea automáticamente un incidente asociado a tu cuenta. 
                  El incidente agrupa toda la información de la emergencia:
                </p>
                <ul className="space-y-2 mt-4">
                  <li><strong className="text-zentinel-text">❖ Ubicación inicial</strong> desde donde se activó el botón.</li>
                  <li><strong className="text-zentinel-text">❖ Recorrido en tiempo real</strong> de la persona mientras el incidente está abierto.</li>
                  <li><strong className="text-zentinel-text">❖ Estado del dispositivo</strong>, incluyendo el nivel de batería y avisos de batería baja o crítica.</li>
                  <li><strong className="text-zentinel-text">❖ Respuestas de tus zentinelas</strong> (vio la alerta, va en camino, no puede ayudar o mensaje rápido).</li>
                  <li><strong className="text-zentinel-text">❖ Línea de tiempo de eventos</strong> con la hora exacta de cada acción.</li>
                </ul>
              </div>

              {/* Inciso: Seguimiento */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Seguimiento del Movimiento en Vivo
                </h3>
                <p>
                  Mientras el incidente permanece abierto, la aplicación envía tu ubicación de forma 
                  periódica, incluso con la pantalla apagada o la aplicación en segundo plano. Tus 
                  usuarios zentinelas pueden abrir el incidente y ver tu desplazamiento sobre el mapa 
                  en tiempo real, junto con el tipo de movimiento detectado 
                  (<strong className="text-zentinel-text">quieto</strong>, <strong className="text-zentinel-text">caminando</strong> o <strong className="text-zentinel-text">en vehículo</strong>).
                </p>
                <p className="text-zentinel-text-muted">
                  <strong className="text-zentinel-gold">Nota:</strong>{" "}
                  Si el dispositivo deja de enviar señal durante varios minutos, el incidente pasa al 
                  estado <strong className="text-zentinel-text">Sin contacto</strong> y tus zentinelas reciben 
                  un aviso. Cuando la señal se recupera, el incidente vuelve a estar activo y el 
                  seguimiento continúa.
                </p>
              </div>

              {/* Inciso: Recorrido guardado */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Registro del Recorrido
                </h3>
                <p>
                  Cada punto de ubicación enviado durante la emergencia queda guardado dentro del 
                  incidente. El recorrido no se pierde al cerrar el incidente: queda almacenado como 
                  un historial consultable con el trazado completo del camino realizado, la fecha y 
                  hora de cada punto y los eventos ocurridos durante la emergencia.
                </p>
                <p>
                  Esto permite reconstruir posteriormente qué sucedió, por dónde se desplazó la 
                  persona y cómo respondieron sus zentinelas, información que puede resultar útil 
                  como respaldo ante una denuncia o un reclamo.
                </p>
              </div>

              {/* Inciso: Cierre */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Cierre del Incidente
                </h3>
                <p>
                  Cuando la situación se encuentra bajo control, puedes solicitar el cierre del 
                  incidente desde la pantalla de la emergencia. Tus usuarios zentinelas reciben la 
                  solicitud y confirman que estás bien para finalizarlo. Si no hay actividad ni señal 
                  del dispositivo durante un tiempo prolongado, el incidente se cierra automáticamente 
                  y queda registrado como expirado.
                </p>
              </div>

              {/* Inciso: Historial */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Consultar Incidentes Anteriores
                </h3>
                <p>
                  Los incidentes cerrados quedan disponibles en tu historial de incidentes, donde 
                  puedes volver a consultar el mapa con el recorrido registrado, las respuestas de 
                  tus zentinelas y el detalle de los eventos.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 10: REPORTE */}
          <section id="reporte" className="manual-section">
            <h2 className="manual-h2">10. Dispositivo Robado o Extraviado</h2>
            <p>
              Si pierdes tu dispositivo o sospechas que ha sido robado, puedes generar un reporte para proteger tu cuenta y evitar accesos no autorizados.
            </p>

            <div>
              <h3 className="text-zentinel-text text-xl font-semibold mb-4">
                Crear Reporte de Dispositivo
              </h3>
              <ol className="space-y-3">
                <li>
                  <strong className="text-zentinel-text">Paso 1:</strong> Accede a la sección <strong className="text-zentinel-text">Reportes</strong> desde la aplicación 
                  (opción <strong className="text-zentinel-gold">Reportar pérdida o robo</strong> dentro de la pestaña <strong className="text-zentinel-text">Ajustes</strong>) 
                  o desde la plataforma web (opción <strong className="text-zentinel-gold">Reportar dispositivo</strong> en la página principal).
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 2:</strong> Inicia sesión en la página web con la cuenta asociada al dispositivo a reportar.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 3:</strong> Selecciona la opción <strong className="text-zentinel-gold">Denunciar Dispositivo Extraviado</strong>.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 4:</strong> Elige el tipo de reporte correspondiente: Perdido o Robado.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 5:</strong> Si lo deseas, agrega información adicional que pueda resultar útil.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 6:</strong> Presiona <strong className="text-zentinel-gold">Enviar</strong> para visualizar el resumen del reporte.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 7:</strong> Revisa la información y selecciona <strong className="text-zentinel-gold">Confirmar reporte</strong> para finalizar el proceso.
                </li>
              </ol>

              <div className="manual-note">
                <strong>Nota:</strong> Una vez generado, el reporte incluirá la última ubicación conocida del dispositivo y permitirá aplicar medidas de protección sobre la cuenta asociada.
              </div>
            </div>

            <div>
              <h3 className="text-zentinel-text text-xl font-semibold mb-4">
                Reactivación de cuenta suspendida
              </h3>
              <p>
                Si tu cuenta fue suspendida como consecuencia de un reporte de dispositivo perdido o robado, podrás solicitar su reactivación desde la plataforma web.
              </p>
              <ol className="space-y-3">
                <li>
                  <strong className="text-zentinel-text">Paso 1:</strong> Inicia sesión en la página web.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 2:</strong> Dirígete a la pestaña <strong className="text-zentinel-text">Reportes</strong>.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 3:</strong> Localiza el reporte activo asociado a tu cuenta.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 4:</strong> Selecciona la opción <strong className="text-zentinel-gold">Cancelar Reporte</strong> y <strong className="text-zentinel-gold">Activar Cuenta</strong>.
                </li>
              </ol>

              <div className="manual-note">
                <strong>Nota:</strong> Una vez reactivada la cuenta, podrás volver a iniciar sesión y utilizar la aplicación móvil normalmente.
              </div>
            </div>
          </section>

          {/* SECCIÓN 11: SUSCRIPCIONES */}
          <section id="suscripciones" className="manual-section">
            <h2 className="manual-h2">11. Suscripciones, Planes y Pagos</h2>
            <p>
              Zentinel Security funciona con un esquema de planes de suscripción. El plan determina 
              a qué funcionalidades accedes y con qué límites de uso (por ejemplo, cantidad de 
              grupos, de integrantes por grupo, de usuarios zentinelas o de zonas seguras).
            </p>

            <div className="manual-note">
              <strong>Nota:</strong> Al crear tu cuenta se te asigna automáticamente el plan 
              inicial gratuito, por lo que puedes comenzar a utilizar la aplicación sin realizar 
              ningún pago.
            </div>

            <div className="space-y-8 mt-8">
              {/* Inciso: Planes */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">Planes Disponibles</h3>
                <p>
                  Los planes se diferencian por su precio, su período de facturación (mensual o 
                  anual) y los límites que habilitan sobre cada funcionalidad. El listado de planes 
                  vigentes, con su precio y el detalle de lo que incluye cada uno, se muestra 
                  siempre actualizado dentro de la aplicación en la sección de 
                  <strong className="text-zentinel-text"> Planes</strong>.
                </p>
                <p className="text-zentinel-text-muted">
                  <strong className="text-zentinel-gold">Importante:</strong>{" "}
                  Si alcanzas el límite de una funcionalidad incluida en tu plan, la aplicación te 
                  informa el límite alcanzado y te ofrece mejorar el plan para continuar.
                </p>
              </div>

              {/* Inciso: Consultar suscripcion */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Consultar mi Suscripción
                </h3>
                <p>
                  Desde la pestaña <strong className="text-zentinel-text">Ajustes</strong>, accede a la 
                  opción <strong className="text-zentinel-text">Mi Plan</strong> para ver la suscripción 
                  activa, la fecha de inicio, la fecha de vencimiento y el consumo actual de cada 
                  funcionalidad respecto de los límites del plan.
                </p>
              </div>

              {/* Inciso: Contratar */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Contratar o Mejorar un Plan
                </h3>
                <ol className="space-y-3">
                  <li>
                    <strong className="text-zentinel-text">Paso 1:</strong> Ingresa a la sección de <strong className="text-zentinel-text">Planes</strong> y compara las opciones disponibles.
                  </li>
                  <li>
                    <strong className="text-zentinel-text">Paso 2:</strong> Selecciona el plan que deseas contratar y presiona <strong className="text-zentinel-gold">Contratar</strong>.
                  </li>
                  <li>
                    <strong className="text-zentinel-text">Paso 3:</strong> Serás redirigido a <strong className="text-zentinel-text">Mercado Pago</strong>, la plataforma que procesa los pagos, para completar la operación con el medio de pago que prefieras.
                  </li>
                  <li>
                    <strong className="text-zentinel-text">Paso 4:</strong> Al aprobarse el pago, regresarás automáticamente a la aplicación y la nueva suscripción quedará activada.
                  </li>
                </ol>
                <p className="text-zentinel-text-muted">
                  <strong className="text-zentinel-gold">Nota:</strong>{" "}
                  Zentinel Security no almacena los datos de tu tarjeta ni de tu medio de pago: 
                  toda la operación se realiza dentro de la plataforma de Mercado Pago.
                </p>
              </div>

              {/* Inciso: Estados del pago */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Estados del Pago
                </h3>
                <ul className="space-y-2">
                  <li><strong className="text-zentinel-text">❖ Aprobado:</strong> el pago se acreditó y el plan queda activo de inmediato.</li>
                  <li><strong className="text-zentinel-text">❖ Pendiente:</strong> el medio de pago todavía no se acreditó; el plan se activa automáticamente cuando el pago se confirma.</li>
                  <li><strong className="text-zentinel-text">❖ Rechazado:</strong> el pago no se pudo procesar y la suscripción anterior se mantiene sin cambios.</li>
                </ul>
              </div>

              {/* Inciso: Renovacion y vencimiento */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Vigencia y Cambio de Plan
                </h3>
                <p>
                  Cada suscripción tiene una fecha de inicio y una fecha de fin según el período 
                  contratado. Al contratar un plan nuevo, la suscripción anterior se desactiva y 
                  comienza a regir la nueva. Si la suscripción paga vence y no se renueva, la cuenta 
                  vuelve a los límites del plan gratuito, sin que se pierdan tus datos.
                </p>
              </div>

              {/* Inciso: Facturacion y reclamos */}
              <div className="manual-subsection">
                <h3 className="text-zentinel-gold text-xl mb-2">
                  Consultas y Reclamos de Facturación
                </h3>
                <p>
                  Ante cualquier inconveniente con un pago o una suscripción, crea un ticket de 
                  soporte seleccionando el tipo <strong className="text-zentinel-text">Facturación</strong> e 
                  incluye el número de operación de Mercado Pago para agilizar la gestión. Consulta 
                  la sección <strong className="text-zentinel-text">Ayuda y Soporte</strong> para más detalles.
                </p>
              </div>
            </div>
          </section>

          {/* SECCIÓN 12: SOPORTE */}
          <section id="soporte" className="manual-section">
            <h2 className="manual-h2">12. Ayuda y Soporte</h2>
            <p>
              La sección de Ayuda y Soporte te permite comunicarte con el equipo de Zentinel Security para realizar consultas, reportar inconvenientes, solicitar asistencia técnica o efectuar reclamos.
            </p>

            <div>
              <h3 className="text-zentinel-text text-xl font-semibold mb-4">
                Crear Ticket de Soporte
              </h3>
              <ol className="space-y-3">
                <li>
                  <strong className="text-zentinel-text">Paso 1:</strong> Desde la aplicación móvil, accede a la opción <strong className="text-zentinel-gold">Ayuda y Soporte </strong> 
                  en la pestaña de <strong className="text-zentinel-text">Ajustes</strong>. Desde la plataforma web, dirígete a la sección <strong className="text-zentinel-text">Soporte </strong> 
                  ubicada en el menú principal.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 2:</strong> Inicia sesión con tu cuenta.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 3:</strong> Selecciona la opción <strong className="text-zentinel-gold">+ Nuevo ticket</strong>.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 4:</strong> Selecciona el tipo de consulta correspondiente: Consulta, Reclamo, Soporte Técnico, Facturación o Reporte.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 5:</strong> Ingresa un asunto que describa brevemente el motivo del ticket.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 6:</strong> Completa la descripción proporcionando el mayor nivel de detalle posible.
                </li>

                <li>
                  <strong className="text-zentinel-text">Paso 7:</strong> Presiona <strong className="text-zentinel-gold">Enviar Ticket</strong> para registrar la solicitud.
                </li>
              </ol>

              <div className="manual-note">
                <strong>Recomendación:</strong> Cuanta más información proporciones, más rápido podrá el equipo de soporte analizar y resolver tu consulta.
              </div>
            </div>

            <div>
              <h3 className="text-zentinel-text text-xl font-semibold mb-4">
                Consultar Estado de Ticket
              </h3>
              <p>
                Puedes consultar el estado y el historial de tus tickets desde la sección <strong className="text-zentinel-text">Soporte</strong> de la plataforma web. 
                Selecciona un ticket para consultar su información, realizar el seguimiento de su estado y visualizar las respuestas enviadas por el equipo de soporte.
              </p>
            </div>

            <div>
              <h3 className="text-zentinel-text text-xl font-semibold mb-4">
                Comunicación con el Equipo de Soporte
              </h3>
              <p>
                Puedes acceder al chat con el equipo de soporte simplemente ingresando al ticket correspondiente. Todo el historial de la conversación quedará 
                disponible dentro del mismo ticket.
              </p>
            </div>
          </section>

          {/* SECCIÓN 13: RECOMENDACIONES */}
          <section id="recomendaciones" className="manual-section">
            <h2 className="manual-h2">13. Recomendaciones de Uso</h2>
            <p>
              Para aprovechar al máximo las funcionalidades de Zentinel Security, ten en cuenta las siguientes recomendaciones:
            </p>
            
            <ul className="space-y-3 mt-6">
              <li><strong className="text-zentinel-text">✓</strong> Mantén activados los permisos de ubicación.</li>
              <li><strong className="text-zentinel-text">✓</strong> Habilita las notificaciones para recibir alertas en tiempo real.</li>
              <li><strong className="text-zentinel-text">✓</strong> Verifica periódicamente tus usuarios zentinelas y grupos de confianza.</li>
              <li><strong className="text-zentinel-text">✓</strong> Utiliza un correo electrónico válido y de acceso frecuente.</li>
              <li><strong className="text-zentinel-text">✓</strong> Mantén actualizados tus datos personales y foto de perfil.</li>
              <li><strong className="text-zentinel-text">✓</strong> Revisa periódicamente tus zonas seguras.</li>
              <li><strong className="text-zentinel-text">✓</strong> Utiliza el botón de pánico únicamente en situaciones reales de emergencia.</li>
              <li><strong className="text-zentinel-text">✓</strong> Reporta rápidamente la pérdida o robo de tu dispositivo.</li>
            </ul>
            <div className="manual-note">
                <strong>Importante:</strong> Algunas funcionalidades pueden verse afectadas si el dispositivo tiene desactivados los servicios de ubicación, las notificaciones o la conexión a internet.
              </div>
          </section>

          {/* SECCIÓN 14: PREGUNTAS */}
          <section id="preguntas" className="manual-section">
            <h2 className="manual-h2">14. Preguntas Frecuentes</h2>
            
            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Quién recibe las alertas del botón de pánico?
                </summary>
                <p className="mt-3">
                  Las alertas del botón de pánico son enviadas únicamente a los usuarios zentinelas que hayas configurado previamente.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Qué sucede cuando activo el botón de pánico?
                </summary>
                <p className="mt-3">
                  Se abre un incidente que notifica a tus usuarios zentinelas y comienza a registrar 
                  tu ubicación en tiempo real. Tus zentinelas pueden seguir tu movimiento en el mapa 
                  mientras el incidente permanece abierto.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Se guarda el recorrido que hice durante una emergencia?
                </summary>
                <p className="mt-3">
                  Sí. Todos los puntos de ubicación registrados quedan guardados dentro del 
                  incidente, junto con los eventos y las respuestas de tus zentinelas. Puedes 
                  consultar el recorrido completo en el historial de incidentes incluso después de 
                  cerrarlo.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Zentinel Security tiene costo?
                </summary>
                <p className="mt-3">
                  Existe un plan gratuito que se asigna automáticamente al crear la cuenta y planes 
                  pagos que amplían los límites de uso y habilitan funcionalidades adicionales.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Cómo puedo pagar mi suscripción?
                </summary>
                <p className="mt-3">
                  Los pagos se realizan a través de Mercado Pago. Una vez aprobado el pago, el plan 
                  se activa automáticamente en tu cuenta.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Qué ocurre si vence mi plan pago?
                </summary>
                <p className="mt-3">
                  La cuenta vuelve a los límites del plan gratuito. No se eliminan tus datos, pero 
                  algunas funcionalidades pueden quedar limitadas hasta que renueves el plan.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Puedo pertenecer a más de un grupo?
                </summary>
                <p className="mt-3">
                  Sí, puedes formar parte de múltiples grupos simultáneamente.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Qué diferencia existe entre un grupo de Zona Común y uno de Zona Individual?
                </summary>
                <p className="mt-3">
                  En un grupo de Zona Común, todos los integrantes comparten las mismas zonas seguras definidas por el administrador. En un grupo de Zona Individual, cada integrante gestiona sus propias zonas seguras y recibe alertas en función de ellas.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Qué ocurre si desactivo mi ubicación?
                </summary>
                <p className="mt-3">
                  Al desactivar la opción de compartir ubicación, los demás integrantes del grupo no podrán visualizar tu ubicación en tiempo real. Además, algunas funcionalidades relacionadas con zonas seguras y monitoreo podrían verse afectadas.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Qué debo hacer si pierdo o me roban el dispositivo?
                </summary>
                <p className="mt-3">
                  Debes generar un reporte de dispositivo perdido o robado lo antes posible para proteger tu cuenta y evitar accesos no autorizados.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Puedo volver a utilizar la aplicación después de reportar mi dispositivo?
                </summary>
                <p className="mt-3">
                  Sí. Una vez que recuperes el dispositivo o desees restablecer el acceso, podrás cancelar el reporte y reactivar tu cuenta desde la plataforma web.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Cómo puedo contactar al equipo de soporte?
                </summary>
                <p className="mt-3">
                  Puedes crear un ticket desde la sección "Ayuda y Soporte" de la aplicación móvil o desde la plataforma web.
                </p>
              </details>
            </div>

            <div className="space-y-4 mt-6">
              <details className="manual-subsection">
                <summary className="cursor-pointer font-semibold text-zentinel-text">
                  ¿Necesito conexión a internet para utilizar Zentinel Security?
                </summary>
                <p className="mt-3">
                  Sí. Las funcionalidades de monitoreo, alertas, notificaciones y comunicación con el equipo de soporte requieren conexión a internet.
                </p>
              </details>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
