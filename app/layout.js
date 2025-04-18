import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { dark } from "@clerk/themes";
import CursorTrailProvider from "@/components/cursor-trail-provider";
import SupportChatProvider from "@/components/support-chat-provider";
import { LoadingProvider } from "@/components/loading-provider";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Career Coach",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo.png" sizes="any" />
        </head>
        <body className={`${inter.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <LoadingProvider>
              <CursorTrailProvider />
              <Header />
              <main className="min-h-screen">{children}</main>
              <SupportChatProvider />
              <Toaster richColors />

              <footer className="bg-muted/50 py-12">
                <div className="container mx-auto px-4 text-center text-gray-200">
                  <p className="mb-2">A STB Product</p>
                  <p className="text-sm text-gray-400">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
                      Beta Version
                    </span>
                    <span className="block mt-1">
                      We're continuously improving to serve you better
                    </span>
                  </p>
                  <div className="mt-4 text-sm text-gray-400">
                    <Link href="/policies" className="hover:text-white transition-colors duration-200">
                      Privacy Policy | Terms & Conditions | Refund Policy
                    </Link>
                  </div>
                </div>
              </footer>

              <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
            </LoadingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
