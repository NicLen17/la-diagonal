import Link from "next/link";
import {
  ArrowDownIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CheckCheckIcon,
  CalendarDaysIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  MessageCircleIcon,
  PlusIcon,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

const features = [
  {
    number: "01",
    icon: GlobeIcon,
    title: "Una web que juega para vos.",
    text: "La identidad de tu complejo, tus canchas y un camino directo para reservar. Un enlace para compartir donde están tus jugadores.",
    detail: "Landing personalizada",
  },
  {
    number: "02",
    icon: CalendarDaysIcon,
    title: "Del ‘¿hay turno?’ al ‘nos vemos’.",
    text: "El jugador ve horarios y precios, elige cancha y deja sus datos sin crear una cuenta. El turno se bloquea mientras completa la reserva.",
    detail: "Reservas sin vueltas",
  },
  {
    number: "03",
    icon: LayoutDashboardIcon,
    title: "Tu día, bajo control.",
    text: "Revisá reservas y comprobantes, confirmá turnos y ajustá horarios o precios. Tu operación reunida en una agenda clara.",
    detail: "Administración centralizada",
  },
];
function ProductScene() {
  return (
    <div
      className="cm-scene cm-enter"
      aria-label="Ilustración del sistema: una reserva pasa de la web a la agenda. Datos de ejemplo."
    >
      <div className="cm-scene-top">
        <span className="flex items-center gap-2">
          <span className="cm-live-dot" /> TU COMPLEJO, CONECTADO
        </span>
        <span>VISTA DE EJEMPLO</span>
      </div>
      <div className="cm-pitch" aria-hidden="true">
        <div className="cm-pitch-line cm-pitch-mid" />
        <div className="cm-pitch-circle" />
        <div className="cm-pitch-goal cm-pitch-goal-left" />
        <div className="cm-pitch-goal cm-pitch-goal-right" />
        <span className="cm-pitch-number">CM / 01</span>
      </div>
      <div className="cm-agenda">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="cm-eyebrow">ADMINISTRACIÓN</span>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              La agenda de tu cancha.
            </p>
          </div>
          <span className="cm-date-chip">HOY</span>
        </div>
        <div className="cm-agenda-cols">
          <span>HORARIO</span>
          <span>FÚTBOL 5</span>
          <span>PÁDEL</span>
        </div>
        {[
          { hour: "18:00", a: "Disponible", b: "Confirmada", type: "open" },
          { hour: "19:00", a: "Nueva reserva", b: "Disponible", type: "new" },
          { hour: "20:00", a: "Confirmada", b: "Disponible", type: "booked" },
        ].map((row) => (
          <div className="cm-agenda-row" key={row.hour}>
            <span className="font-mono text-xs">{row.hour}</span>
            <span className={`cm-slot cm-slot-${row.type}`}>
              {row.type === "new" && <span className="cm-live-dot" />}
              {row.a}
            </span>
            <span className="cm-slot cm-slot-soft">{row.b}</span>
          </div>
        ))}
        <div className="mt-5 flex items-center gap-2 text-xs text-[#42664f]">
          <CheckCheckIcon aria-hidden="true" className="size-4" /> Lo que
          reserva tu jugador, aparece acá.
        </div>
      </div>
      <div className="cm-booking-note">
        <div className="cm-note-icon">
          <MessageCircleIcon aria-hidden="true" className="size-5" />
        </div>
        <div>
          <strong>Listo para el próximo partido.</strong>
          <p>Reserva registrada · Resumen para WhatsApp</p>
        </div>
        <CheckIcon aria-hidden="true" className="size-4 text-[#16713d]" />
      </div>
      <div className="cm-scene-label">
        <span>WEB</span>
        <span aria-hidden="true">↗</span>
        <span>RESERVA</span>
        <span aria-hidden="true">↗</span>
        <span>GESTIÓN</span>
      </div>
    </div>
  );
}
export default function HomePage() {
  return (
    <div className="cm-marketing">
      <section className="cm-hero cm-container">
        <div className="cm-hero-copy">
          <div className="cm-eyebrow cm-enter">
            <span className="cm-live-dot" /> EL SISTEMA PARA TU COMPLEJO
            DEPORTIVO
          </div>
          <h1 className="cm-hero-title cm-enter">
            Más cancha.
            <br />
            <span>Menos vueltas.</span>
          </h1>
          <p className="cm-hero-description cm-enter">
            Tu propia web, reservas online y toda la gestión de tu complejo.{" "}
            <strong>Vos ocupate de que se juegue.</strong>
          </p>
          <div className="cm-hero-actions cm-enter">
            <Link
              href="/demo"
              className="cm-button cm-button-dark cm-button-lg"
            >
              Probar el recorrido
              <ArrowUpRightIcon aria-hidden="true" className="size-5" />
            </Link>
            <a
              href={BRAND.contact}
              target="_blank"
              rel="noreferrer"
              className="cm-text-link"
            >
              Hablemos de tu complejo
              <ArrowUpRightIcon aria-hidden="true" className="size-4" />
            </a>
          </div>
          <p className="cm-hero-footnote">
            <span className="flex items-center gap-2">
              <CheckIcon aria-hidden="true" className="size-4" />
              Sin cuenta para reservar
            </span>
            <span className="flex items-center gap-2">
              <CheckIcon aria-hidden="true" className="size-4" />
              Con tu identidad
            </span>
          </p>
        </div>
        <ProductScene />
        <a href="#producto" className="cm-scroll-cue">
          <ArrowDownIcon aria-hidden="true" className="size-4" /> ASÍ JUEGA
          CANCHA MANAGER
        </a>
      </section>
      <div className="cm-offer-strip">
        <div className="cm-container">
          <span>UN SOLO EQUIPO.</span>
          <p>
            Tu landing <PlusIcon aria-hidden="true" /> Tus reservas{" "}
            <PlusIcon aria-hidden="true" /> Tu administración
          </p>
          <span>FÚTBOL · PÁDEL · TU COMPLEJO</span>
        </div>
      </div>
      <section id="producto" className="cm-container cm-section">
        <div className="cm-section-heading">
          <div>
            <p className="cm-eyebrow">TODO LO QUE PASA FUERA DE LA CANCHA</p>
            <h2>
              Que gestionar sea
              <br />
              <span className="cm-muted-green">la parte fácil.</span>
            </h2>
          </div>
          <p>
            Menos conversaciones para encontrar un turno. Más claridad para el
            jugador y para quien abre el complejo todos los días.
          </p>
        </div>
        <div className="cm-feature-grid">
          {features.map(({ number, icon: Icon, title, text, detail }) => (
            <article className="cm-feature" key={number}>
              <div className="flex items-center justify-between">
                <span className="cm-eyebrow">
                  {number} / {detail}
                </span>
                <Icon aria-hidden="true" className="size-6" />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="como-funciona" className="cm-flow-section">
        <div className="cm-container cm-section">
          <div className="cm-section-heading">
            <div>
              <p className="cm-eyebrow">
                DE LA PRIMERA VISITA AL PRÓXIMO PARTIDO
              </p>
              <h2>
                Un recorrido.
                <br />
                Todo conectado.
              </h2>
            </div>
            <Link href="/demo" className="cm-button cm-button-light">
              Verlo en acción
              <ArrowUpRightIcon aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <ol className="cm-flow-grid">
            {[
              {
                title: "Conoce tu complejo",
                text: "Entra a tu web y descubre tus canchas.",
              },
              {
                title: "Encuentra su turno",
                text: "Elige deporte, día, horario y cancha.",
              },
              {
                title: "Deja la reserva",
                text: "Completa sus datos y prepara el resumen para WhatsApp.",
              },
              {
                title: "Vos la gestionás",
                text: "La reserva aparece en tu panel. Revisás y confirmás.",
              },
            ].map((step, i) => (
              <li key={step.title}>
                <span className="cm-flow-number">0{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="cm-flow-bottom">
            <p>
              WhatsApp sigue en el equipo. La información queda ordenada en el
              sistema.
            </p>
            <MessageCircleIcon aria-hidden="true" className="size-6" />
          </div>
        </div>
      </section>
      <section className="cm-container cm-section cm-demo-invite">
        <div className="cm-demo-stamp" aria-hidden="true">
          <span>
            PROBÁ
            <br />
            LA JUGADA.
          </span>
          <ArrowUpRightIcon className="size-12" />
        </div>
        <div>
          <p className="cm-eyebrow">UN COMPLEJO FICTICIO. EL RECORRIDO REAL.</p>
          <h2>
            Antes de imaginarlo,
            <br />
            reservá una cancha.
          </h2>
          <p className="mt-5 max-w-lg text-[#526359]">
            Recorré la web de ejemplo y completá una reserva. En una
            demostración guiada te mostramos cómo llega a administración y cómo
            se confirma.
          </p>
          <Link className="cm-button cm-button-dark mt-7" href="/demo">
            Entrar al complejo de demo
            <ArrowUpRightIcon aria-hidden="true" className="size-4" />
          </Link>
          <p className="mt-3 text-xs text-[#526359]">
            La demo utiliza datos ficticios. No requiere pagos reales.
          </p>
        </div>
      </section>
      <section id="preguntas" className="cm-container cm-section cm-faq">
        <div>
          <p className="cm-eyebrow">ANTES DEL SILBATAZO</p>
          <h2>Lo que querés saber.</h2>
        </div>
        <div>
          {[
            {
              q: "¿Qué incluye Cancha Manager?",
              a: "La landing personalizada de tu complejo, el recorrido de reservas y el panel para administrar canchas, turnos, horarios y precios. Definimos la propuesta según tu operación en una demo.",
            },
            {
              q: "¿Mis jugadores necesitan crearse una cuenta?",
              a: "No. Eligen el turno y completan sus datos de contacto. Reciben un código para volver a consultar su reserva.",
            },
            {
              q: "¿WhatsApp envía mensajes automáticamente?",
              a: "El jugador abre WhatsApp con un resumen preparado y decide enviarlo. La reserva ya queda registrada aunque no envíe el mensaje.",
            },
            {
              q: "¿El sistema cobra o verifica transferencias?",
              a: "La confirmación la realiza el administrador. Puede revisar el comprobante aportado por el jugador. No hay cobro integrado ni verificación bancaria automática.",
            },
            {
              q: "¿Podemos adaptarlo a mi complejo?",
              a: "Sí. Revisamos tus canchas, deportes, horarios, precios e identidad para preparar una propuesta. Escribinos y coordinamos una demostración.",
            },
          ].map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <PlusIcon aria-hidden="true" className="size-4 shrink-0" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="cm-closing">
        <div className="cm-container">
          <p className="cm-eyebrow">TU COMPLEJO TIENE EQUIPO.</p>
          <h2>
            Ahora, que tenga
            <br />
            su propio sistema.
          </h2>
          <a
            className="cm-button cm-button-light cm-button-lg"
            href={BRAND.contact}
            target="_blank"
            rel="noreferrer"
          >
            Solicitar una demo
            <ArrowUpRightIcon aria-hidden="true" className="size-5" />
          </a>
          <span className="cm-closing-mark" aria-hidden="true">
            CM
          </span>
        </div>
      </section>
    </div>
  );
}
