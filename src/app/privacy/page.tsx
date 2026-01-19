
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12 px-4 space-y-8">
      <ScrollReveal>
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2 font-semibold">SyllabiQ</p>
          <p className="text-muted-foreground mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>We collect the following types of information:</p>
            <h3 className="font-semibold text-foreground">a. Personal Information</h3>
            <ul>
                <li>Name</li>
                <li>Email address</li>
                <li>Account role (student or teacher)</li>
                <li>Profile details you choose to provide</li>
            </ul>
            <h3 className="font-semibold text-foreground">b. Usage & Activity Information</h3>
            <ul>
                <li>Courses accessed and completed</li>
                <li>Learning progress and activity</li>
                <li>Session and booking-related activity</li>
            </ul>
             <h3 className="font-semibold text-foreground">c. Payment Information</h3>
            <ul>
                <li>Payment status and transaction references</li>
                <li>We <strong>do not store</strong> sensitive payment details such as card numbers or bank credentials</li>
            </ul>
            <h3 className="font-semibold text-foreground">d. Technical Information</h3>
            <ul>
                <li>IP address</li>
                <li>Device type and browser information</li>
                <li>Basic usage logs for security and analytics</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle>2. How We Collect Information</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>We collect information:</p>
            <ul>
                <li>When you create or access your account</li>
                <li>When you use platform features and content</li>
                <li>When you make payments</li>
                <li>Automatically through cookies and platform logs</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>3. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>We use your information to:</p>
             <ul>
                <li>Create and manage user accounts</li>
                <li>Deliver educational content and services</li>
                <li>Track learning progress and activity</li>
                <li>Process payments and refunds</li>
                <li>Improve platform performance and reliability</li>
                <li>Maintain security and prevent misuse</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.25}>
        <Card>
          <CardHeader>
            <CardTitle>4. Payments & Financial Data</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
             <ul>
                <li>All payments are processed via <strong>third-party payment providers</strong></li>
                <li>SyllabiQ does <strong>not store</strong> sensitive financial information</li>
                <li>Only transaction identifiers and payment status are retained for records</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>
      
       <ScrollReveal delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>5. Data Sharing</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>We may share limited information only with:</p>
            <ul>
                <li>Payment service providers</li>
                <li>Hosting and cloud infrastructure providers</li>
                <li>Analytics services for platform improvement</li>
            </ul>
            <p>We <strong>do not sell, rent, or trade</strong> personal data to third parties.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.35}>
        <Card>
          <CardHeader>
            <CardTitle>6. Data Storage & Security</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <ul>
                <li>Data is stored using secure, cloud-based infrastructure</li>
                <li>We implement reasonable technical and organizational safeguards</li>
                <li>While no system is completely secure, we take appropriate measures to protect your data</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>7. Cookies & Tracking Technologies</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>We use cookies to:</p>
            <ul>
                <li>Maintain login sessions</li>
                <li>Remember user preferences</li>
                <li>Collect basic analytics</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.45}>
        <Card>
          <CardHeader>
            <CardTitle>8. User Rights</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>You have the right to:</p>
            <ul>
                <li>Access your personal information</li>
                <li>Request corrections to inaccurate data</li>
                <li>Request account deletion, subject to legal and operational requirements</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>
      
       <ScrollReveal delay={0.5}>
        <Card>
          <CardHeader>
            <CardTitle>9. Children’s Privacy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <ul>
                <li>SyllabiQ is <strong>not intended for children under the age of 13</strong></li>
                <li>We do not knowingly collect personal data from children</li>
                <li>Accounts found violating this may be removed</li>
            </ul>
          </CardContent>
        </Card>
      </ScrollReveal>

       <ScrollReveal delay={0.55}>
        <Card>
          <CardHeader>
            <CardTitle>10. Feature Availability</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>Some platform features may be marked as <strong>“Coming Soon.”</strong> No additional data is collected for unavailable features.</p>
          </CardContent>
        </Card>
      </ScrollReveal>
      
       <ScrollReveal delay={0.6}>
        <Card>
          <CardHeader>
            <CardTitle>11. Third-Party Links</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of external platforms.</p>
          </CardContent>
        </Card>
      </ScrollReveal>
      
       <ScrollReveal delay={0.65}>
        <Card>
          <CardHeader>
            <CardTitle>12. Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>We may update this Privacy Policy from time to time. Continued use of the platform after updates indicates acceptance of the revised policy.</p>
          </CardContent>
        </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.7}>
        <Card>
          <CardHeader>
            <CardTitle>13. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none text-muted-foreground">
            <p>If you have questions or concerns regarding this Privacy Policy or your data, you may contact us through the platform’s official support channels.</p>
          </CardContent>
        </Card>
      </ScrollReveal>
      
      <ScrollReveal delay={0.75}>
         <div className="text-center pt-8">
            <p className="font-bold text-lg">By using SyllabiQ, you acknowledge that you have read and understood this Privacy Policy.</p>
         </div>
      </ScrollReveal>

    </div>
  );
}
