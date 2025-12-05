import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "My Marketplace",
  description: "Clone of Wildberries/eBay",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <Header />
        
        <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
        
        {children}
      </body>
    </html>
  );
}