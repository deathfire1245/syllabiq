
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpenCheck, ChevronRight, Video, FileText, HelpCircle, User, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: FileText,
    title: "Summarized Notes",
    description: "Get concise, easy-to-understand notes for every topic in your syllabus.",
    bgColor: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Video,
    title: "Video Lessons",
    description: "Visual learners rejoice! Watch engaging video lessons that explain complex concepts simply.",
    bgColor: "bg-accent/10",
    iconColor: "text-accent",
  },
  {
    icon: HelpCircle,
    title: "Important Questions",
    description: "Practice with a curated list of important questions to ace your exams.",
    bgColor: "bg-secondary",
    iconColor: "text-foreground",
  },
];

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Grade 10 Student",
    quote: "SyllabiQ has been a game-changer for my exam preparation. The summarized notes are a lifesaver!",
    avatar: "https://picsum.photos/seed/alex/100"
  },
  {
    name: "Maria Garcia",
    role: "High School Teacher",
    quote: "I recommend SyllabiQ to all my students. It perfectly complements our classroom teaching and helps them organize their study.",
    avatar: "https://picsum.photos/seed/maria/100"
  },
  {
    name: "Sam Lee",
    role: "Grade 12 Student",
    quote: "The important questions section helped me focus on what really matters. I scored 15% higher than I expected!",
    avatar: "https://picsum.photos/seed/sam/100"
  },
];


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 md:pt-24 pb-12">
          <Badge variant="outline" className="mb-4 text-sm font-medium py-1 px-3">Your Personal Learning Assistant</Badge>
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Your Syllabus, Simplified.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            SyllabiQ helps you access syllabus-based study material and organize
            your learning efficiently. Master your subjects with ease.
          </p>
          <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
            <Link href="/dashboard">
              Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </section>

        {/* Dashboard Preview Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-16">
           <div className="relative">
            <div className="absolute top-0 -left-12 w-72 h-72 bg-accent/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-12 w-72 h-72 bg-primary/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-16 left-20 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
             <div className="relative bg-card p-2 rounded-xl shadow-2xl transition-all hover:shadow-primary/20">
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

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Succeed</h2>
              <p className="text-muted-foreground mt-4 text-lg">
                We've packed SyllabiQ with features to help you study smarter, not harder.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="text-center transition-transform hover:-translate-y-2 hover:shadow-xl">
                  <CardHeader>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${feature.bgColor}`}>
                      <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Get Started in 3 Simple Steps</h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Learning with SyllabiQ is as easy as one, two, three.
              </p>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-8 md:gap-4 items-start relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-border -translate-y-1/2"></div>
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-1">
                  <svg width="100%" height="100%" className="text-border">
                    <line x1="0" y1="0" x2="100%" y2="0" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8" />
                  </svg>
                </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-2xl z-10 bg-background">1</div>
                <h3 className="mt-6 text-xl font-semibold">Sign Up</h3>
                <p className="mt-2 text-muted-foreground">Create your account and select your grade to get started.</p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-2xl z-10 bg-background">2</div>
                <h3 className="mt-6 text-xl font-semibold">Choose a Subject</h3>
                <p className="mt-2 text-muted-foreground">Browse your subjects and pick a topic you want to master.</p>
              </div>
              <div className="relative flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-2xl z-10 bg-background">3</div>
                <h3 className="mt-6 text-xl font-semibold">Start Learning</h3>
                <p className="mt-2 text-muted-foreground">Dive into notes, watch videos, and test your knowledge.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 sm:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Loved by Students and Teachers</h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Don't just take our word for it. Here's what people are saying about SyllabiQ.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="flex flex-col justify-between">
                  <CardContent className="pt-6">
                    <div className="flex text-yellow-400 gap-0.5 mb-4">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                  </CardContent>
                  <CardHeader className="flex-row items-center gap-4">
                    <Image src={testimonial.avatar} alt={testimonial.name} width={48} height={48} className="rounded-full" data-ai-hint="person avatar" />
                    <div>
                      <CardTitle className="text-base font-semibold">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Simplify Your Studies?</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Join thousands of students who are learning smarter with SyllabiQ.
            </p>
            <Button size="lg" asChild className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Link href="/signup">
                Sign Up for Free <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Logo />
              <p className="text-muted-foreground text-sm">Your Syllabus, Simplified.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Platform</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="#features" className="text-muted-foreground hover:text-primary">Features</Link>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link>
                <Link href="/login" className="text-muted-foreground hover:text-primary">Login</Link>
                <Link href="/signup" className="text-muted-foreground hover:text-primary">Sign Up</Link>
              </nav>
            </div>
             <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link>
              </nav>
            </div>
             <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <nav className="flex flex-col gap-2 text-sm">
                <Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link>
              </nav>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} SyllabiQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
