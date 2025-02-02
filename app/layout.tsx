import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "next-themes";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export const isProduction: boolean = process.env.NODE_ENV === 'production'
export const simpleURL =
  process.env.NODE_ENV === 'production'
    ? 'https://phas-orpin.vercel.app'
    : 'http://localhost:3000'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "CareSphere | Healthcare AI Platform",
  description: "CareSphere is a healthcare platform that uses AI to provide personalized care. We provide symptom analyzer, medicine finder and more",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
