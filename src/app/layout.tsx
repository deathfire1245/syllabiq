import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { GeistSans } from "geist/font/sans";
import { PT_Sans } from "next/font/google";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: "SyllabiQ",
  description: "Your Syllabus, Simplified. Access syllabus-based study material and organize your learning efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${ptSans.variable}`} suppressHydrationWarning>
      <body>
        <FirebaseClientProvider>
          <BookmarkProvider>
            {children}
            <Toaster />
          </BookmarkProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
