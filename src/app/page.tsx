import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 md:pt-24">
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Your Syllabus, Simplified.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            SyllabiQ helps you access syllabus-based study material and organize
            your learning efficiently. Master your subjects with ease.
          </p>
          <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/dashboard">
              Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-16">
           <div className="relative">
            <div className="absolute top-0 -left-12 w-72 h-72 bg-accent/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-12 w-72 h-72 bg-primary/50 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-16 left-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
             <div className="relative bg-card p-2 rounded-xl shadow-2xl">
                <Image
                  src="https://picsum.photos/seed/dashboard-preview/1200/675"
                  alt="SyllabiQ dashboard preview"
                  width={1200}
                  height={675}
                  className="rounded-lg"
                  data-ai-hint="education dashboard"
                  priority
                />
             </div>
           </div>
        </section>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground text-sm">
        <p>
          &copy; {new Date().getFullYear()} SyllabiQ. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
