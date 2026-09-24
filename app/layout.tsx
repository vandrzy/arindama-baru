import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/app-context";
import { Navbar } from "@/components/navbar";
import { Mail, Phone, Clock } from "lucide-react";

// Tipografi Resmi Wajib: Plus Jakarta Sans (Bebas Inter, Bebas Monospace)
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
      <body className={`min-h-screen flex flex-col font-sans ${plusJakartaSans.className} bg-brand-surface text-brand-text selection:bg-brand-primary-light selection:text-brand-primary`}>
        <AppProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8">
            {children}
          </main>

          {/* Footer resmi sesuai poster arindama.jpeg */}
          <footer className="bg-white border-t border-gray-100 text-xs text-brand-text-secondary mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-gray-100">
                {/* Brand & Security */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-extrabold text-sm text-brand-primary">
                      ARINDAMA SPORT SURVEY
                    </span>
                  </div>
                  <p className="text-xs text-brand-text-secondary leading-relaxed mb-3">
                    Aplikasi evaluasi dan kuesioner resmi bidang keolahragaan untuk
                    mendukung kebijakan pembangunan olahraga daerah yang lebih terarah dan
                    berprestasi.
                  </p>

                </div>

                {/* Layanan & Kontak Sesuai Poster arindama.jpeg */}
                <div>
                  <h4 className="font-bold text-brand-text mb-3 text-xs uppercase tracking-wider">
                    Pusat Bantuan & Layanan
                  </h4>
                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-brand-primary shrink-0" />
                      <span>support@arindama.id</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-brand-primary shrink-0" />
                      <span>0812-3456-7890</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                      <span>Senin – Jumat (08.00 – 16.00 WIB)</span>
                    </li>
                  </ul>
                </div>

                {/* Slogan & Hak Cipta */}
                <div>
                  <h4 className="font-bold text-brand-text mb-3 text-xs uppercase tracking-wider">
                    Komitmen Keolahragaan
                  </h4>
                  <p className="italic text-brand-text-secondary leading-relaxed">
                    &ldquo;Ayo berpartisipasi! Jawaban Anda sangat berarti untuk olahraga yang
                    lebih maju dan masyarakat yang lebih sehat.&rdquo;
                  </p>
                  <p className="text-xs text-gray-400 mt-4">
                    © {new Date().getFullYear()} ARINDAMA. Dilindungi undang-undang.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
                <span>Dikembangkan oleh Tim ARINDAMA</span>
                <span>Platform Evaluasi Olahraga Terpadu</span>
              </div>
            </div>
          </footer>


        </AppProvider>
      </body>
    </html>
  );
}
