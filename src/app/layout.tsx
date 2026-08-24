import type { Metadata } from "next";
import { Anton, Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "La Diagonal | Complejo Deportivo",
    template: "%s | La Diagonal",
  },
  description:
    "Complejo deportivo en Tafí Viejo, Tucumán. Alquiler de canchas de fútbol 5, 7, 9, 11, futsal, handball y pádel. Reservá online.",
  metadataBase: new URL("https://ladiagonal.com.ar"),
  openGraph: {
    title: "La Diagonal | Complejo Deportivo",
    description:
      "Reservá canchas de fútbol, handball y pádel en Tafí Viejo. Desde 2017 impulsando el deporte recreativo y competitivo.",
    locale: "es_AR",
    type: "website",
    images: ["/images/Diagonal img 1.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${anton.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <TooltipProvider>
          {children}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
