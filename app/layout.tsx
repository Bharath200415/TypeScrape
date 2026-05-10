import type { Metadata } from "next"
import { DM_Sans, DM_Mono, Syne } from "next/font/google"
import localFont from "next/font/local"
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

const customHeading = localFont({
  src: [
    {
      path: "../public/fonts/008d67fd73a4c01b.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-custom-heading",
  display: "swap",
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
        className={`${dmSans.variable} ${dmMono.variable} ${syne.variable} ${customHeading.variable} font-sans bg-slate-50 text-zinc-950 antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
