import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <ScrollReveal>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>1. Introduction</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>
              Welcome to SyllabiQ. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using SyllabiQ, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>2. Use of Our Services</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground space-y-4">
            <p>
              You must be at least 13 years old to use our services. You are responsible for your account and any activity that occurs through your account. You agree to use our services only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of SyllabiQ.
            </p>
            <p>
              This is placeholder text. The actual terms of service will be different. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>3. Content and Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground space-y-4">
            <p>
              All content provided on SyllabiQ, including text, graphics, logos, and software, is the property of SyllabiQ or its content suppliers and protected by international copyright laws.
            </p>
             <p>
              This is placeholder text. The actual terms of service will be different. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>4. Termination</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>
              We may terminate or suspend your access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>
      
       <ScrollReveal delay={0.5}>
        <Card>
          <CardHeader>
            <CardTitle>5. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>
    </div>
  );
}
