import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import GlobalProvider from "./GlobalProvider";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Token Exchange Dapp",
  description: "A simple token exchange dapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GlobalProvider>
      <html lang="en">
        <body className={cn(poppins.className, "dark")}>
          <main>{children}</main>
        </body>
      </html>
    </GlobalProvider>
  );
}
