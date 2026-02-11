"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogIn } from "lucide-react";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function LockedPage() {
  const [code, setCode] = React.useState("");
  const router = useRouter();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    // In a real app, this would be a server-side check
    setTimeout(() => {
      if (code === "SyllabiQAdmin2024") {
        sessionStorage.setItem("isAdminAuthenticated", "true");
        toast({
          title: "Access Granted",
          description: "Welcome to the Admin Portal.",
        });
        router.push("/admin");
      } else {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "The provided access code is incorrect.",
        });
      }
      setIsVerifying(false);
    }, 1000);
  };

  // Check if user is already authenticated
  React.useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("isAdminAuthenticated");
    if (isAuthenticated) {
      router.push("/admin");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/50 p-4">
      <div className="absolute top-8">
          <Logo size="lg" />
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Portal Access</CardTitle>
          <CardDescription>Enter the access code to manage the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="access-code">Access Code</Label>
                <Input 
                    id="access-code" 
                    type="password"
                    placeholder="••••••••" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
            </div>
          <Button onClick={handleVerify} className="w-full" disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify & Enter"}
          </Button>
        </CardContent>
      </Card>
      <div className="mt-4">
          <Button variant="link" asChild>
            <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login as a user
            </Link>
          </Button>
      </div>
    </div>
  );
}
