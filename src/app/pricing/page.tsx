import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tiers = [
    {
        name: 'Free',
        priceMonthly: '$0',
        priceYearly: '$0',
        description: 'Get started and explore core features, absolutely free.',
        features: [
            'Access to 1 Full Subject',
            'Summarized Notes',
            'Practice Questions',
            'Bookmark Topics',
            'Community Support'
        ],
        cta: 'Start for Free',
        href: '/signup',
        popular: false,
    },
    {
        name: 'Pro',
        priceMonthly: '$9.99',
        priceYearly: '$99.99',
        description: 'Unlock the full power of SyllabiQ for unlimited learning.',
        features: [
            'Access to All Subjects & Grades',
            'Summarized Notes & Video Lessons',
            'Unlimited Practice Questions',
            'AI-Powered Q&A',
            'Priority Email Support',
            'Ad-Free Experience'
        ],
        cta: 'Go Pro',
        href: '/signup',
        popular: true,
    },
     {
        name: 'Classroom',
        priceMonthly: 'Custom',
        priceYearly: 'Custom',
        description: 'Equip your entire classroom with the best learning tools.',
        features: [
            'Everything in Pro, plus:',
            'Teacher Dashboard',
            'Student Progress Tracking',
            'Bulk Seat Licenses',
            'Dedicated Onboarding',
            'School-level Invoicing'
        ],
        cta: 'Contact Sales',
        href: '/contact',
        popular: false,
    }
]

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Flexible pricing for everyone</h1>
        <p className="text-muted-foreground mt-4 text-lg">
          Choose the plan that's right for you. Change or cancel anytime.
        </p>
      </div>

      <Tabs defaultValue="monthly" className="mt-12">
        <div className="flex justify-center">
            <TabsList>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly (Save 15%)</TabsTrigger>
            </TabsList>
        </div>
        <TabsContent value="monthly">
            <div className="grid lg:grid-cols-3 gap-8 mt-8 items-stretch">
                {tiers.map((tier) => (
                    <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                         <CardHeader className="text-center">
                            {tier.popular && <p className="font-semibold text-primary mb-2">Most Popular</p>}
                            <CardTitle className="text-2xl">{tier.name}</CardTitle>
                            <p className="text-4xl font-bold mt-2">{tier.priceMonthly}</p>
                            <CardDescription className="mt-2">{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-4">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-1" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className={`w-full ${tier.popular ? '' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                                <Link href={tier.href}>{tier.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="yearly">
             <div className="grid lg:grid-cols-3 gap-8 mt-8 items-stretch">
                {tiers.map((tier) => (
                    <Card key={tier.name} className={`flex flex-col ${tier.popular ? 'border-primary shadow-lg' : ''}`}>
                         <CardHeader className="text-center">
                            {tier.popular && <p className="font-semibold text-primary mb-2">Most Popular</p>}
                            <CardTitle className="text-2xl">{tier.name}</CardTitle>
                            <p className="text-4xl font-bold mt-2">{tier.priceYearly}</p>
                             <CardDescription className="mt-2">{tier.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <ul className="space-y-4">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex items-start">
                                        <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-1" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                           <Button asChild className={`w-full ${tier.popular ? '' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                                <Link href={tier.href}>{tier.cta}</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
