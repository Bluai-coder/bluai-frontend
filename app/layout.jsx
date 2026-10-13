
// ============================================================
// app/layout.jsx — Root Layout
// ============================================================

import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";

import { Providers } from "./providers";
import "@/styles/globals.css";

// 🔹 Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// 🔹 Metadata
export const metadata = {
  title: { default: "BluLiMS", template: "%s | BluLiMS" },
  description: "Laboratory Information Management System",
};

// 🔹 Root Layout
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`
        ${GeistSans.variable}
        ${inter.variable}
      `}
    >
      <body className="bg-gray-50 dark:bg-gray-900 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
