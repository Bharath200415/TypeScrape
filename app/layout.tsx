import type { Metadata } from "next"
import { DM_Sans, DM_Mono, Syne } from "next/font/google"
import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
})

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "TypeScrape - Design Intelligence",
  description: "Extract design systems from any website using Anakin AI + Gemini",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.variable} ${dmMono.variable} ${syne.variable} font-sans bg-slate-50 text-zinc-950 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
