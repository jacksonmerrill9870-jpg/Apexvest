import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-heading" });

export const metadata = {
  metadataBase: new URL("https://apexvest-nine.vercel.app"),
  title: "Apexvest | Invest in Forex & CFDs - Earn Up to 18% Returns",
  description: "Invest in Forex, Crypto, Indices and Commodities with Apexvest. Get up to 18% returns with secure, award-winning trading platforms.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}
