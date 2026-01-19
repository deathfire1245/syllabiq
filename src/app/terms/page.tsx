import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <ScrollReveal>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mt-2 font-semibold">SyllabiQ</p>
          <p className="text-muted-foreground mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>
              By accessing or using SyllabiQ (“the Platform”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree with any part of these Terms, you must not use the Platform.
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle>2. Platform Overview</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground space-y-4">
            <p>
              SyllabiQ is an online educational platform designed to connect students with independent educators. The Platform provides access to educational content, courses, and ticket-based learning services.
            </p>
            <p>
              Certain features may be temporarily unavailable and displayed as <strong>“Coming Soon.”</strong> Such unavailability does not constitute a service failure.
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>3. Business Status Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>
              SyllabiQ is currently operating as a private digital platform and is <strong>not registered as a government-recognized entity</strong> at this time. By using the Platform, users acknowledge and accept this status.
            </p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.25}>
        <Card>
          <CardHeader>
            <CardTitle>4. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>
              To access certain features, users must create an account.
            </p>
            <p>Users are responsible for:</p>
            <ul>
                <li>Maintaining the confidentiality of their account credentials</li>
                <li>All activity performed through their account</li>
            </ul>
            <p>Providing false, misleading, or incomplete information may result in account suspension or termination.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>5. User Roles</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <h3 className="font-semibold text-foreground">Students</h3>
            <p>Students may browse, purchase, and access courses or ticket-based learning services subject to availability and these Terms.</p>
            <h3 className="font-semibold text-foreground mt-4">Teachers</h3>
            <p>Teachers are independent educators who provide educational content on the Platform. Teachers are <strong>not employees, agents, or partners</strong> of SyllabiQ.</p>
            <p>Teachers are solely responsible for:</p>
            <ul>
                <li>The accuracy and quality of their content</li>
                <li>Compliance with applicable laws and regulations</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.35}>
        <Card>
          <CardHeader>
            <CardTitle>6. Payments</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
             <ul>
                <li>Certain content and services on SyllabiQ require payment</li>
                <li>All payments are collected by SyllabiQ</li>
                <li>Course and service prices may vary</li>
                <li>Payments made by students are non-transferable</li>
            </ul>
            <p>SyllabiQ does not guarantee any level of income, earnings, or student enrollment to teachers.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>7. Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>Refunds may be granted at the discretion of SyllabiQ under limited circumstances, including but not limited to:</p>
            <ul>
                <li>The content or service was not accessed</li>
                <li>A verified technical issue prevented proper use</li>
                <li>The session or service was cancelled</li>
            </ul>
            <p>Refunds may be denied if:</p>
            <ul>
                <li>Content has already been accessed or consumed</li>
                <li>Misuse, abuse, or fraudulent behavior is detected</li>
            </ul>
            <p>All refund decisions are final.</p>
          </CardContent>
        </Card>
      </ScrollReveal>
      
      <ScrollReveal delay={0.45}>
        <Card>
          <CardHeader>
            <CardTitle>8. Content Ownership and Usage</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>Teachers retain ownership of the content they create. By uploading content to SyllabiQ, teachers grant the Platform a non-exclusive right to host, display, and distribute the content for platform operations.</p>
            <p>Users may not:</p>
            <ul>
                <li>Copy</li>
                <li>Redistribute</li>
                <li>Resell</li>
                <li>Publicly share any content without prior permission.</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.5}>
        <Card>
          <CardHeader>
            <CardTitle>9. Platform Conduct</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>Users agree not to:</p>
            <ul>
                <li>Violate any applicable laws</li>
                <li>Misuse platform features</li>
                <li>Interfere with platform security</li>
                <li>Upload unlawful, harmful, or copyrighted material without authorization</li>
            </ul>
            <p>Violation of these rules may result in account suspension or termination.</p>
          </CardContent>
        </Card>
      </ScrollReveal>
      
      <ScrollReveal delay={0.55}>
        <Card>
          <CardHeader>
            <CardTitle>10. Feature Availability</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>Some features, including but not limited to tutor bookings and live sessions, may be unavailable during early stages and shown as <strong>“Coming Soon.”</strong> Temporary unavailability does not entitle users to compensation.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.6}>
        <Card>
          <CardHeader>
            <CardTitle>11. Account Suspension and Termination</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>SyllabiQ reserves the right to suspend or terminate accounts if:</p>
            <ul>
                <li>These Terms are violated</li>
                <li>Fraudulent or abusive activity is detected</li>
                <li>Platform integrity or security is at risk</li>
            </ul>
            <p>In severe cases, access may be revoked without refund.</p>
          </CardContent>
        </Card>
      </ScrollReveal>
      
      <ScrollReveal delay={0.65}>
        <Card>
          <CardHeader>
            <CardTitle>12. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>The Platform is provided on an “as is” and “as available” basis. SyllabiQ does not guarantee uninterrupted access or specific learning outcomes.</p>
            <p>SyllabiQ is not liable for:</p>
            <ul>
                <li>Educational results</li>
                <li>Teacher performance</li>
                <li>Temporary service disruptions</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.7}>
        <Card>
          <CardHeader>
            <CardTitle>13. Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>These Terms shall be governed by and interpreted in accordance with the <strong>laws of India</strong>. Any disputes arising under these Terms shall be subject to Indian jurisdiction.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.75}>
        <Card>
          <CardHeader>
            <CardTitle>14. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>SyllabiQ may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes acceptance of the updated Terms.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.8}>
        <Card>
          <CardHeader>
            <CardTitle>15. Contact</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>For questions regarding these Terms, users may contact SyllabiQ through official platform communication channels.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.85}>
         <div className="text-center pt-8">
            <p className="font-bold text-lg">By using SyllabiQ, you acknowledge that you have read, understood, and agreed to these Terms of Service.</p>
         </div>
      </ScrollReveal>

    </div>
  );
}
