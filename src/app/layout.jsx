import "./globals.css"
import Footer from "@/components/Footer/Footer"
import Navbar from "@/components/Navbar/Navbar"
import { AuthProvider } from "./context/authContext/AuthContext"

export const metadata = {
  icons: { icon: "/favicon.svg" },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <Navbar />
          <main className="grow relative">
            {children}
          </main>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  )
}