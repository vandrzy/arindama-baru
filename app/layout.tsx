import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/app-context";
import { AppShell } from "@/components/app-shell";

// Tipografi Resmi Wajib: Plus Jakarta Sans
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ARINDAMA SPORT SURVEY | Kuesioner Bidang Keolahragaan Daerah",
  description:
    "Aplikasi kuesioner keolahragaan terpadu untuk pengumpulan data dan evaluasi capaian prestasi olahraga nasional & internasional tingkat kabupaten/kota.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`min-h-screen font-sans ${plusJakartaSans.className} bg-slate-50 text-brand-text selection:bg-brand-primary-light selection:text-brand-primary`}>
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
