import type { Metadata } from "next";
import { Saira } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./providers/ThemeProvider";
import NavigationSpinner from "@/components/layout/NavigationSpinner";

const saira = Saira({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-brand",
});

export const metadata: Metadata = {
  title: "Cyber Pharma",
  description: "Pharmacy revenue recovery — get back every dollar you're owed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={saira.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
          <NavigationSpinner />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
