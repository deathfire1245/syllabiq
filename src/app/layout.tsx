import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { BookmarkProvider } from "@/contexts/BookmarkContext";
import "./globals.css";
import { FirebaseClientProvider } from "@/firebase/client-provider";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
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
