import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ToastContainer } from "@/components/toast";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Provador Virtual | Paradise Multimarcas",
  description:
    "Experimente roupas da Paradise Multimarcas com inteligência artificial. Veja como o look fica em você antes de comprar.",
  openGraph: {
    title: "Provador Virtual | Paradise Multimarcas",
    description: "Experimente roupas com IA — veja o look no seu corpo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${dmSans.variable} font-sans bg-[#0a0a0a] text-white antialiased`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
