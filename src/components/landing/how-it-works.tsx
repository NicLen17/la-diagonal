import {
  DiagonalSection,
  SectionHeading,
} from "@/components/layout/diagonal-section";

const STEPS = [
  {
    number: "01",
    title: "Elegí deporte y fecha",
    description:
      "Seleccioná el deporte, el día y el horario que te quede cómodo.",
  },
  {
    number: "02",
    title: "Mirá el mapa del predio",
    description:
      "Explorá las canchas desde arriba y elegí la que mejor se adapte a tu partido.",
  },
  {
    number: "03",
    title: "Completá tus datos",
    description:
      "Ingresá tu nombre, teléfono y forma de pago. Sin necesidad de crear cuenta.",
  },
  {
    number: "04",
    title: "Confirmá por WhatsApp",
    description:
      "Recibís un mensaje listo para enviar y el equipo valida tu reserva.",
  },
] as const;

export function HowItWorks() {
  return (
    <DiagonalSection
      id="como-funciona"
      tone="navy"
      clip="top"
      className="px-4 py-20 sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Reservas"
          title="Cómo funciona"
          description="Cuatro pasos simples para asegurar tu turno en el complejo."
          light
        />

        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.number} className="relative flex flex-col gap-3">
              <span
                className="font-display text-6xl leading-none text-lime-400/30 sm:text-7xl"
                aria-hidden
              >
                {step.number}
              </span>
              <h3 className="text-xl text-white">{step.title}</h3>
              <p className="text-sm leading-relaxed text-white/75">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </DiagonalSection>
  );
}
