

import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, FileText, Video, HelpCircle, Star, UserPlus, BookOpen, GraduationCap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

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
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
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

const timelineSteps = [
    {
        icon: UserPlus,
        title: 'Sign Up',
        description: 'Create your account and select your grade to get started.',
    },
    {
        icon: BookOpen,
        title: 'Choose a Subject',
        description: 'Browse your subjects and pick a topic you want to master.',
    },
    {
        icon: GraduationCap,
        title: 'Start Learning',
        description: 'Dive into notes, watch videos, and test your knowledge.',
    },
];


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-x-hidden">
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
            <Link href="/dashboard/subjects">Explore</Link>
          </Button>
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center text-center text-white">
          <Image
            src="https://picsum.photos/seed/dashboard-preview/1920/1080"
            alt="Students learning"
            fill
            className="object-cover"
            priority
            data-ai-hint="education students"
          />
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="container relative z-20 mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <Badge variant="secondary" className="mb-4 text-sm font-medium py-1 px-3">Your Personal Learning Assistant</Badge>
              <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
                Your Syllabus, Simplified.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-10">
                SyllabiQ helps you access syllabus-based study material and organize
                your learning efficiently. Master your subjects with ease.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
                <Link href="/dashboard">
                  Start Learning Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </ScrollReveal>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 sm:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Succeed</h2>
              <p className="text-muted-foreground mt-4 text-lg">
                We've packed SyllabiQ with features to help you study smarter, not harder.
              </p>
            </ScrollReveal>
            <div className="mt-12">
              <div className="md:hidden px-10">
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {features.map((feature, index) => (
                      <CarouselItem key={index} className="basis-full sm:basis-1/2">
                         <div className="p-1 h-full">
                          <ScrollReveal delay={index * 0.1} className="h-full">
                            <Card className="text-center transition-transform hover:-translate-y-2 hover:shadow-xl bg-card h-full">
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
                          </ScrollReveal>
                         </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              <div className="hidden md:grid grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <ScrollReveal key={index} delay={index * 0.1}>
                    <Card className="text-center transition-transform hover:-translate-y-2 hover:shadow-xl bg-card h-full">
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
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 sm:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Get Started in 3 Simple Steps</h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Learning with SyllabiQ is as easy as one, two, three.
              </p>
            </ScrollReveal>
            <div className="relative mt-16 max-w-2xl mx-auto">
                <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border -z-10" aria-hidden="true"></div>
                
                {timelineSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isEven = index % 2 === 0;
                  return (
                    <ScrollReveal 
                      key={index} 
                      className="relative group mb-12 last:mb-0"
                      xOffset={isEven ? -50 : 50}
                      yOffset={0}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background transition-transform group-hover:scale-125"></div>
                      <div className={`flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                          <div className="flex-1">
                              <Card className="p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-primary/20">
                                  <div className="flex items-center gap-4 mb-3">
                                      <div className="bg-primary/10 text-primary p-3 rounded-full flex-shrink-0">
                                          <Icon className="w-6 h-6" />
                                      </div>
                                      <h3 className="text-xl font-bold">{step.title}</h3>
                                  </div>
                                  <p className="text-muted-foreground">{step.description}</p>
                              </Card>
                          </div>
                          <div className="hidden sm:flex flex-1 items-center justify-center text-5xl font-extrabold text-primary/20">
                              0{index + 1}
                          </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 sm:py-24 bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold">Loved by Students and Teachers</h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Don't just take our word for it. Here's what people are saying about SyllabiQ.
              </p>
            </ScrollReveal>
            <div className="mt-12">
               <div className="md:hidden px-10">
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {testimonials.map((testimonial, index) => (
                      <CarouselItem key={index} className="basis-full sm:basis-1/2">
                        <div className="p-1 h-full">
                          <ScrollReveal delay={index * 0.1} className="h-full">
                            <Card className="flex flex-col justify-between bg-card h-full transition-transform hover:-translate-y-2 hover:shadow-xl">
                              <CardContent className="pt-6">
                                <div className="flex text-yellow-400 gap-0.5 mb-4">
                                  {[...Array(5)].map((_, i) => <Star key={`star-${testimonial.name}-${i}`} className="w-5 h-5 fill-current" />)}
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
                          </ScrollReveal>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              <div className="hidden md:grid grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <ScrollReveal key={testimonial.name} delay={index * 0.1}>
                    <Card className="flex flex-col justify-between bg-card h-full transition-transform hover:-translate-y-2 hover:shadow-xl">
                      <CardContent className="pt-6">
                        <div className="flex text-yellow-400 gap-0.5 mb-4">
                          {[...Array(5)].map((_, i) => <Star key={`star-${testimonial.name}-${i}`} className="w-5 h-5 fill-current" />)}
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
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <ScrollReveal className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Simplify Your Studies?</h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Join thousands of students who are learning smarter with SyllabiQ.
            </p>
            <Button size="lg" asChild className="mt-8 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow">
              <Link href="/signup">
                Sign Up for Free <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </ScrollReveal>
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
